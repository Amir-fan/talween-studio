import { NextRequest, NextResponse } from 'next/server';
import { discountDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    const { code, percentOff, maxUses, expiresAt } = await request.json();
    if (!code || isNaN(Number(percentOff))) {
      return NextResponse.json({ success: false, error: 'بيانات غير صحيحة' }, { status: 400 });
    }
    const d = discountDb.create(String(code).toUpperCase(), Number(percentOff), maxUses ? Number(maxUses) : undefined, expiresAt ? Number(expiresAt) : undefined);
    return NextResponse.json({ success: true, discounts: discountDb.list() });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'فشل إنشاء الكود' }, { status: 500 });
  }
}


