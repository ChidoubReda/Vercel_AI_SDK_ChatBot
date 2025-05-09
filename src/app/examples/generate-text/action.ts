import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { streamText } from 'ai';
import { mistral } from '@ai-sdk/mistral';

async function main() {
    const result = await streamText({
        model: mistral('mistral-tiny'),
        prompt: 'Tell me a joke.',
    });
    for await (const textPart of result.textStream) {
        process.stdout.write(textPart);
    }
}

main().catch(console.error);
