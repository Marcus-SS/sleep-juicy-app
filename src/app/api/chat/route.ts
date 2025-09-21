import { NextRequest, NextResponse } from 'next/server';
import { generateResponse, PREPROMPT } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { messages, userContext } = await request.json();

    // Add user context to the system prompt
    let systemPrompt = PREPROMPT.content;
    if (userContext) {
      systemPrompt += `\n\n## User Context:\n`;
      if (userContext.chronotype) systemPrompt += `- Chronotype: ${userContext.chronotype}\n`;
      if (userContext.sleep_goals) systemPrompt += `- Sleep Goals: ${userContext.sleep_goals}\n`;
      if (userContext.challenges) systemPrompt += `- Sleep Challenges: ${userContext.challenges}\n`;
    }

    // Prepare messages for Gemini
    const geminiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await generateResponse(geminiMessages, userContext);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
