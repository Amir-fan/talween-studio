import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete user from database
    const result = userDb.deleteUser(userId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to delete user' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
