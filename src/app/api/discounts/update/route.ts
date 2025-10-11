import { NextRequest, NextResponse } from 'next/server';
import { discountDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    const { id, code, type, value, maxUses, active, description, expiresAt } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الخصم مطلوب' }, { status: 400 });
    }
    
    const existingDiscount = discountDb.findById(id);
    if (!existingDiscount) {
      return NextResponse.json({ success: false, error: 'رمز الخصم غير موجود' }, { status: 404 });
    }
    
    // Validate data if provided
    if (type && !['percentage', 'amount'].includes(type)) {
      return NextResponse.json({ success: false, error: 'نوع الخصم غير صالح' }, { status: 400 });
    }
    if (value !== undefined && isNaN(Number(value))) {
      return NextResponse.json({ success: false, error: 'قيمة الخصم غير صحيحة' }, { status: 400 });
    }
    if (type === 'percentage' && value !== undefined && (value < 0 || value > 100)) {
      return NextResponse.json({ success: false, error: 'نسبة الخصم يجب أن تكون بين 0 و 100' }, { status: 400 });
    }
    if (type === 'amount' && value !== undefined && value < 0) {
      return NextResponse.json({ success: false, error: 'قيمة الخصم يجب أن تكون أكبر من 0' }, { status: 400 });
    }
    
    const updates: any = {};
    if (code) updates.code = code;
    if (type) updates.type = type;
    if (value !== undefined) updates.value = value;
    if (maxUses !== undefined) updates.maxUses = maxUses;
    if (active !== undefined) updates.active = active;
    if (description !== undefined) updates.description = description;
    if (expiresAt !== undefined) updates.expires_at = expiresAt;
    
    const updatedDiscount = discountDb.update(id, updates);
    
    if (!updatedDiscount) {
      return NextResponse.json({ success: false, error: 'فشل تحديث رمز الخصم' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, discount: updatedDiscount, discounts: discountDb.list() });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'فشل تحديث رمز الخصم' }, { status: 500 });
  }
}
