import { NextRequest, NextResponse } from 'next/server';
import { discountDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    const { code, type, value, maxUses, expiresAt, description } = await request.json();
    if (!code || !type || isNaN(Number(value))) {
      return NextResponse.json({ success: false, error: 'بيانات غير صحيحة' }, { status: 400 });
    }
    if (!['percentage', 'amount'].includes(type)) {
      return NextResponse.json({ success: false, error: 'نوع الخصم غير صالح' }, { status: 400 });
    }
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json({ success: false, error: 'نسبة الخصم يجب أن تكون بين 0 و 100' }, { status: 400 });
    }
    if (type === 'amount' && value < 0) {
      return NextResponse.json({ success: false, error: 'قيمة الخصم يجب أن تكون أكبر من 0' }, { status: 400 });
    }
    
    const d = discountDb.create(
      String(code).toUpperCase(), 
      type, 
      Number(value), 
      maxUses ? Number(maxUses) : undefined, 
      expiresAt ? Number(expiresAt) : undefined,
      description || ''
    );
    return NextResponse.json({ success: true, discount: d, discounts: discountDb.list() });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'فشل إنشاء الكود' }, { status: 500 });
  }
}


