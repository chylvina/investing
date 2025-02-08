import config from 'config';
import fs from 'fs/promises';
import path from 'path';

interface Message {
  role: 'system' | 'user';
  content: string;
}

interface RequestBody {
  model: string;
  messages: Message[];
  max_tokens?: number;
  temperature: number;
  top_p: number;
  search_domain_filter: string[];
  return_images: boolean;
  return_related_questions: boolean;
  search_recency_filter: string;
  top_k: number;
  stream: boolean;
  presence_penalty: number;
  frequency_penalty: number;
  response_format: null;
}

interface ApiResponse {
  [key: string]: any;
}

// 从配置文件读取token
const PERPLEXITY_TOKEN = config.get<string>('perplexity.token');

async function queryPerplexity(question: string, stockCode: string): Promise<ApiResponse> {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PERPLEXITY_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar-reasoning-pro',
      messages: [
        {
          role: 'system',
          content: 'Be precise and concise.'
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: undefined,
      temperature: 0.2,
      top_p: 0.9,
      search_domain_filter: ['10jqka.com.cn','xueqiu.com'],
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1,
      response_format: null
    } as RequestBody)
  };

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', options);
    const data: ApiResponse = await response.json();
    
    // 保存响应数据到本地文件
    const timestamp = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    const filename = `${stockCode}-${timestamp}.json`;
    const outputDir = path.join(process.cwd(), 'tmp');
    
    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true });
    
    let outputPath = path.join(outputDir, filename);

    // 将数据写入文件
    await fs.writeFile(
      outputPath,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    console.log(`分析结果已保存到: ${outputPath}`);
    
    return data;
  } catch (error) {
    throw error;
  }
}

async function processQuery() {
  let output = [];
  
  // 从本地加载 GPLIST.json
  const gplist = JSON.parse(await fs.readFile(path.join(process.cwd(), 'assets/GPLIST.json'), 'utf-8'));
  
  // 定义批处理大小和延迟时间
  const BATCH_SIZE = 2;
  const DELAY_MS = 1000;

  // 将 gplist 分成多个批次
  const batches = [];
  for (let i = 0; i < gplist.length; i += BATCH_SIZE) {
    batches.push(gplist.slice(i, i + BATCH_SIZE));
  }

  // 处理每个批次
  for (const batch of batches) {
    // 并发处理每个批次中的股票
    const promises = batch.map(async (stock: any) => {
      try {
        const question = `帮我搜索${stock.name}(${stock.code})的过去一个月的新闻和财报，并且根据价值投资标准打分(满分100)，打分的结果格式为 investing score: {$score}，其中 score 为分数(0-100)，并放在最后面。`;
        const result = await queryPerplexity(question, stock.code);
        return {
          code: stock.code,
          name: stock.name,
          result
        };
      } catch (error: any) {
        console.error(`处理 ${stock.name}(${stock.code}) 时出错:`, error);
        return {
          code: stock.code,
          name: stock.name,
          error: error.message
        };
      }
    });

    // 等待当前批次完成
    const batchResults = await Promise.all(promises);
    output.push(...batchResults);

    // 在批次之间添加延迟
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  // 将结果保存到文件
  const timestamp = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
  const outputPath = path.join(process.cwd(), 'tmp', `analysis-results-${timestamp}.json`);
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`分析结果已保存到: ${outputPath}`);
}

processQuery();
