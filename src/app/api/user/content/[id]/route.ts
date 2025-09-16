import { NextRequest, NextResponse } from 'next/server';
import { contentDb } from '@/lib/simple-database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json();
    const contentId = params.id;

    if (action === 'toggle-favorite') {
      const result = contentDb.toggleFavorite(contentId);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          content: result.content
        });
      } else {
        return NextResponse.json(
          { error: result.error },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id;
    const result = contentDb.delete(contentId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
