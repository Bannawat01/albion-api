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

    // Simple local chatbot logic for now
    const question_lower = question.toLowerCase();

    let reply = '';

    if (question_lower.includes('gold') || question_lower.includes('ทอง')) {
      reply = 'Current gold price information is not available right now. Please check the Gold Market page for real-time prices.';
    } else if (question_lower.includes('sell') || question_lower.includes('ขาย') || question_lower.includes('from')) {
      reply = 'For selling recommendations, please use the item search feature. Enter an item name and check the market data for the best selling locations.';
    } else if (question_lower.includes('buy') || question_lower.includes('ซื้อ') || question_lower.includes('purchase')) {
      reply = 'For buying recommendations, please use the item search feature. Look for items with the lowest buy prices in different cities.';
    } else if (question_lower.includes('hello') || question_lower.includes('hi') || question_lower.includes('สวัสดี')) {
      reply = 'สวัสดี! ฉันคือแชทบอทสำหรับ Albion Online ช่วยคุณหาข้อมูลตลาดไอเทมและราคาทองได้ คุณสามารถถามเกี่ยวกับการซื้อขายไอเทมหรือราคาทองได้เลย!';
    } else {
      reply = 'ฉันสามารถช่วยคุณในเรื่องเหล่านี้:\n• ค้นหาไอเทมและดูราคาตลาด\n• แนะนำสถานที่ขายที่ดีที่สุด\n• แสดงราคาทอง\n• ค้นหาสถานที่ซื้อถูกที่สุด\n\nลองถาม เช่น "T4_BAG ซื้อที่ไหนได้ราคาถูก" หรือ "ราคาทองวันนี้เท่าไหร่"';
    }

    console.log('Chatbot reply:', reply);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}