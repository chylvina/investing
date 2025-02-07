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

async function queryPerplexity(question: string): Promise<ApiResponse> {
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
      search_domain_filter: ['perplexity.ai'],
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
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `perplexity-response-${timestamp}.json`;
    const outputDir = path.join(process.cwd(), 'tmp');
    
    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true });
    
    // 将数据写入文件
    await fs.writeFile(
      path.join(outputDir, filename),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    
    console.log(`响应数据已保存到: ${filename}`);
    return data;
  } catch (error) {
    throw error;
  }
}

// 使用示例:
queryPerplexity('帮我搜索常山北明的过去一个月的新闻和财报，并且根据价值投资标准打分(满分100)，打分的结果格式为 investing score: {$score}，其中 score 为分数(0-100)，并放在最后面。')
   .then(response => console.log(response))
   .catch(error => console.error(error));
