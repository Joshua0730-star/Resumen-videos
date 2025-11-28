// app/api/generate-summary/route.ts
import { NextResponse } from 'next/server';
import { DeepSeek } from 'deepseek-ai';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(request: Request) {
    try {
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        const deepseek = new DeepSeek(process.env.DEEPSEEK_API_KEY!);

        const response = await deepseek.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente que genera resúmenes ejecutivos de transcripciones de videos. Sigue estrictamente el formato solicitado."
                },
                {
                    role: "user",
                    content: `Por favor, resume la siguiente transcripción siguiendo el formato especificado en el prompt:\n\n${content}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        return NextResponse.json({ summary: response.choices[0].message.content });
    } catch (error: any) {
        console.error('Error generating summary:', error);
        return NextResponse.json(
            { error: 'Error al generar el resumen', details: error.message },
            { status: 500 }
        );
    }
}