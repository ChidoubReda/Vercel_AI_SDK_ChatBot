import { streamText } from "ai";
import { mistral } from '@ai-sdk/mistral';

export async function POST(request: Request) {
  const { messages } = await request.json();
  const stream = await streamText({
    model: mistral('mistral-tiny'),
    system: "You are a helpful assistant.",
    messages,
  });
  return stream.toDataStreamResponse();
}