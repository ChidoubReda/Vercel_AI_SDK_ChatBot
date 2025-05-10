import { type CoreMessage, streamText } from "ai";
import { mistral } from '@ai-sdk/mistral';
import { groq } from '@ai-sdk/groq';

export async function POST(request: Request) {
  const { messages }: { messages: CoreMessage[] } = await request.json();
  const stream = await streamText({
    model: groq('qwen-qwq-32b'),
    system: "You are a helpful assistant.",
    messages,
  });
  return stream.toDataStreamResponse();
}