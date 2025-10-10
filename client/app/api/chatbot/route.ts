import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log('Chatbot API called with question:', question);

    // Call n8n cloud workflow
    const n8nResponse = await fetch('https://bannawat102.app.n8n.cloud/webhook/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n workflow failed: ${n8nResponse.status} ${n8nResponse.statusText}`);
    }

    const data = await n8nResponse.json();
    const rawMessage = data.output || data.message || data.reply || 'Sorry, I could not process your request.';
    const cleanMessage = rawMessage.trim().replace(/^["']|["']$/g, ''); // Remove surrounding quotes
    const reply = `🤖 albo: ${cleanMessage}`;

    console.log('Chatbot reply from n8n:', reply);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}