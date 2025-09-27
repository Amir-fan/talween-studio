import { NextRequest, NextResponse } from 'next/server';
import { contentDb } from '@/lib/simple-database';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { action } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    if (action === 'toggleFavorite') {
      const result = contentDb.toggleFavorite(id);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          content: result.content,
          message: result.content.status === 'favorite' ? 'تم إضافة المحتوى للمفضلة' : 'تم إزالة المحتوى من المفضلة'
        });
      } else {
        return NextResponse.json(
          { error: result.error || 'فشل في تحديث المفضلة' },
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const result = contentDb.delete(id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'تم حذف المحتوى بنجاح'
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'فشل في حذف المحتوى' },
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