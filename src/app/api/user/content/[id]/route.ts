import { NextRequest, NextResponse } from 'next/server';
import { contentDb } from '@/lib/simple-database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json();
    const contentId = params.id;

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const content = contentDb.findById(contentId);
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    if (action === 'toggleFavorite') {
      // Toggle favorite status
      const newStatus = content.status === 'favorite' ? 'published' : 'favorite';
      const result = contentDb.update(contentId, { status: newStatus });
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: newStatus === 'favorite' ? 'تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة',
          content: result.content
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to update favorite status' },
          { status: 500 }
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

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const content = contentDb.findById(contentId);
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    const result = contentDb.delete(contentId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'تم حذف المحتوى بنجاح'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete content' },
        { status: 500 }
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

