import { NextRequest, NextResponse } from 'next/server';
import { discountDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الخصم مطلوب' }, { status: 400 });
    }
    
    const existingDiscount = discountDb.findById(id);
    if (!existingDiscount) {
      return NextResponse.json({ success: false, error: 'رمز الخصم غير موجود' }, { status: 404 });
    }
    
    const deleted = discountDb.delete(id);
    
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'فشل حذف رمز الخصم' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, discounts: discountDb.list() });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'فشل حذف رمز الخصم' }, { status: 500 });
  }
}
