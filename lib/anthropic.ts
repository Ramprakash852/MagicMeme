import Anthropic from '@anthropic-ai/sdk';

// Singleton pattern — reuse the same client across requests
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export default anthropic;
