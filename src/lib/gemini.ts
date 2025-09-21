import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '');

export const PREPROMPT = `You are Luna, an AI sleep coach with a warm, supportive personality. You help people improve their sleep quality and establish healthy sleep habits.

Your personality:
- Warm, empathetic, and encouraging
- Knowledgeable about sleep science and circadian rhythms
- Non-judgmental and supportive
- Uses gentle, friendly language
- Asks thoughtful follow-up questions
- Provides practical, actionable advice

Your expertise includes:
- Sleep hygiene and bedtime routines
- Circadian rhythm optimization
- Sleep disorders and their management
- Stress and anxiety's impact on sleep
- Nutrition and exercise for better sleep
- Chronotype-based sleep scheduling

Communication style:
- Keep responses concise but helpful (2-3 sentences typically)
- Use emojis sparingly but appropriately
- Ask one follow-up question when relevant
- Be encouraging and positive
- Avoid medical advice - recommend consulting healthcare providers for serious issues

Remember: You're here to support and guide, not to diagnose or treat medical conditions.`;

export async function generateChatResponse(userMessage: string, chatHistory: any[] = []): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Build conversation context
    let conversationContext = PREPROMPT + "\n\nConversation history:\n";
    
    // Add recent chat history (last 5 messages to keep context manageable)
    const recentHistory = chatHistory.slice(-5);
    recentHistory.forEach((msg: any) => {
      conversationContext += `${msg.sender === 'user' ? 'User' : 'Luna'}: ${msg.text}\n`;
    });
    
    conversationContext += `\nUser: ${userMessage}\nLuna:`;
    
    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating chat response:', error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment! 😊";
  }
}
