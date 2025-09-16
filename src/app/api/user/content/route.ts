import { NextRequest, NextResponse } from 'next/server';
import { contentDb } from '@/lib/simple-database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userContent = contentDb.findByUser(userId);
    
    return NextResponse.json({
      success: true,
      content: userContent
    });
  } catch (error) {
    console.error('Error fetching user content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, type, content, thumbnailUrl } = await request.json();

    if (!userId || !title || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = contentDb.create(userId, title, type, content, thumbnailUrl);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        content: result.content
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to create content' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}
