import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'رمز التحقق مطلوب' },
        { status: 400 }
      );
    }

    const result = await verifyEmail(token);

    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق من البريد الإلكتروني' },
      { status: 500 }
    );
  }
}
