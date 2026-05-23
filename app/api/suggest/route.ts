import { NextRequest, NextResponse } from 'next/server';
import anthropic from '@/lib/anthropic';
import { buildMemePrompt } from '@/lib/prompts';

export const runtime = 'nodejs'; // NOT edge — base64 images are large
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { imageData, mimeType } = await req.json();

    if (!imageData) {
      return NextResponse.json({ error: 'No image' }, { status: 400 });
    }

    // Strip the data URL prefix to get raw base64
    const base64 = imageData.replace(/^data:[^;]+;base64,/, '');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType ?? 'image/jpeg',
              data: base64,
            },
          },
          {
            type: 'text',
            text: buildMemePrompt(),
          },
        ],
      }],
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    // Parse — Claude sometimes wraps in ```json
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ suggestions: parsed.suggestions });

  } catch (err) {
    console.error('[suggest]', err);
    return NextResponse.json(
      { error: 'AI request failed', details: String(err) },
      { status: 500 }
    );
  }
}
