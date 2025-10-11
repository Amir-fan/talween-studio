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
        console.log('📞 Sending lead to LeadConnector webhook...');
        const webhookResponse = await fetch('https://services.leadconnectorhq.com/hooks/2xJ6VY43ugovZK68Cz74/webhook-trigger/260c7d50-814b-47de-9245-257723375ee0', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            // Lead basic information
            email: email,
            first_name: displayName.split(' ')[0] || displayName,
            last_name: displayName.split(' ').slice(1).join(' ') || '',
            full_name: displayName,
            
            // Lead source and tracking
            source: 'talween-studio-signup',
            lead_source: 'Website Registration',
            campaign: 'Story Creation Platform',
            
            // Lead details
            lead_type: 'New User Registration',
            status: 'New',
            tags: ['story-creation', 'new-user', 'signup'],
            
            // User data
            user_id: result.user?.id,
            initial_credits: result.user?.credits || 0,
            platform: 'Talween Studio',
            
            // Timestamps
            created_at: new Date().toISOString(),
            timestamp: Date.now(),
            
            // Additional metadata
            metadata: {
              signup_method: 'email',
              platform_version: '1.0',
              registration_source: 'main_signup_form'
            }
          })
        });
        
        if (webhookResponse.ok) {
          console.log('✅ Lead successfully sent to LeadConnector');
        } else {
          console.log('⚠️ LeadConnector webhook returned:', webhookResponse.status, webhookResponse.statusText);
        }
      } catch (e) {
        console.log('❌ Lead capture webhook failed (non-blocking):', e);
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
