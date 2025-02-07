import config from 'config';

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
    return data;
  } catch (error) {
    throw error;
  }
}

// 使用示例:
// queryPerplexity('How many stars are there in our galaxy?')
//   .then(response => console.log(response))
//   .catch(error => console.error(error));