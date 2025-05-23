import { NextResponse } from 'next/server';

// Function to generate a summary using the Sutra API
async function generateSummary(query: string): Promise<string> {
  try {
    const apiKey = process.env.SUTRA_API_KEY;
    
    if (!apiKey) {
      throw new Error('SUTRA API key not found in environment variables');
    }
    
    const response = await fetch('https://api.two.ai/v2/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sutra-v2',
        messages: [
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, showToolCalls } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }
    
    const summary = await generateSummary(query);
    
    return NextResponse.json({ response: summary });
  } catch (error: any) {
    console.error('Error in summarize route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
} 