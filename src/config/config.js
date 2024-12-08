export const config = {
    baseUrl: process.env.BASE_URL || 'https://wesslen--vllm-openai-compatible-serve.modal.run/v1',
    apiKey: process.env.API_KEY,
    model: process.env.MODEL_NAME || '/models/NousResearch/Meta-Llama-3-8B-Instruct'
  };