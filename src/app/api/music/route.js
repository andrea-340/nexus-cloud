import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=20`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Deezer API error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Deezer API' }, { status: 500 });
  }
}
