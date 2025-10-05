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
    const percentOff = Math.min(Math.max(Number(d.percentOff || 0), 0), 100);
    const original = Number(amount || 0);
    const discountAmount = Math.round((original * percentOff) * 100) / 100 / 100; // keep currency logic flexible
    const finalAmount = Math.max(original - (original * (percentOff / 100)), 0);
    return NextResponse.json({ success: true, percentOff, finalAmount });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'فشل التحقق من رمز الخصم' }, { status: 500 });
  }
}


