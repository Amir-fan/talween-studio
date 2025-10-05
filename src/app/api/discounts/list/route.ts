import { NextResponse } from 'next/server';
import { discountDb } from '@/lib/simple-database';

export async function GET() {
  try {
    return NextResponse.json({ success: true, discounts: discountDb.list() });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'فشل جلب الأكواد' }, { status: 500 });
  }
}


