import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    console.log('🔍 REGISTRATION API - Attempting to register:');
    console.log('  - email:', email);
    console.log('  - displayName:', displayName);
    
    const result = await registerUser(email, password, displayName);
    
    console.log('  - result.success:', result.success);
    console.log('  - result.error:', result.error);

    if (result.success) {
      console.log('✅ Registration successful');
      // Fire LeadConnector webhook (non-blocking)
      try {
        await fetch('https://services.leadconnectorhq.com/hooks/2xJ6VY43ugovZK68Cz74/webhook-trigger/3bffa62e-ae01-4db8-ac41-844ff1eabddf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            event: 'signup',
            email,
            name: displayName,
            userId: result.user?.id,
            credits: result.user?.credits,
            source: 'talween-studio',
            timestamp: Date.now()
          })
        });
      } catch (e) {
        console.log('Lead capture webhook failed (non-blocking):', e);
      }
      return NextResponse.json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.',
        user: result.user
      });
    } else {
      console.log('❌ Registration failed:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    );
  }
}
