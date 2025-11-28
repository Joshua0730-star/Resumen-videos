// app/api/generate-summary/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        // Read the prompt file
        const promptPath = path.join(process.cwd(), 'instructions', 'PromptResumen.md');
        const prompt = fs.readFileSync(promptPath, 'utf8');

        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: prompt
                },
                {
                    role: "user",
                    content: `Por favor, resume la siguiente transcripción siguiendo el formato especificado en el prompt:\n\n${content}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        return NextResponse.json({
            summary: response.choices[0].message.content
        });
    } catch (error: any) {
        console.error('Error generating summary:', error);
        return NextResponse.json(
            {
                error: 'Error al generar el resumen',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}