import { NextRequest, NextResponse } from 'next/server';
import { discountDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    const { code, amount } = await request.json();
    if (!code) {
      return NextResponse.json({ success: false, error: 'رمز الخصم مطلوب' }, { status: 400 });
    }
    const d = discountDb.findByCode(code);
    if (!d || !d.active) {
      return NextResponse.json({ success: false, error: 'رمز الخصم غير صالح' }, { status: 404 });
    }
    if (d.expires_at && Date.now() / 1000 > d.expires_at) {
      return NextResponse.json({ success: false, error: 'انتهت صلاحية رمز الخصم' }, { status: 400 });
    }
    if (d.maxUses && d.uses >= d.maxUses) {
      return NextResponse.json({ success: false, error: 'تم استهلاك رمز الخصم' }, { status: 400 });
    }
    
    const original = Number(amount || 0);
    let discountAmount = 0;
    let finalAmount = original;
    let discountType = d.type;
    let discountValue = d.value;
    
    if (d.type === 'percentage') {
      const percentOff = Math.min(Math.max(Number(d.value || 0), 0), 100);
      discountAmount = (original * percentOff) / 100;
      finalAmount = Math.max(original - discountAmount, 0);
    } else if (d.type === 'amount') {
      discountAmount = Math.min(Number(d.value || 0), original); // Can't discount more than the total
      finalAmount = Math.max(original - discountAmount, 0);
    }
    
    return NextResponse.json({ 
      success: true, 
      discountType: d.type,
      discountValue: d.value,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
      description: d.description
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'فشل التحقق من رمز الخصم' }, { status: 500 });
  }
}


