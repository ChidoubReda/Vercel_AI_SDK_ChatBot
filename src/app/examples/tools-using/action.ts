import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { generateText, streamText } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import {z} from 'zod';

async function main() {
    const location = "Morocco";
    const result = await generateText({
        model: mistral('mistral-tiny'),
        prompt: 'Tou are a funny chatbot. User location: ${location}.',
        tools: {
            weather: {
                description: 'Get the weather for the user location.',
                parameters: z.object({
                    location: z.string().describe('user location'),
                }),
                execute: async ({location}) => {
                    const temperature = Math.floor(Math.random() * 100);
                    return {temperature};
                },
            },
        },
    }); 
    if (result.toolResults && result.toolCalls) {
        const joke = await streamText({
            model: mistral('mistral-tiny'),
            prompt: 'Tell me a joke about ${location} and its current temperature (${result.toolResults[0].result.temperature})', 
        });
        for await (const textPart of joke.textStream) {
            process.stdout.write(textPart);
        }
    }
}

main().catch(console.error);
