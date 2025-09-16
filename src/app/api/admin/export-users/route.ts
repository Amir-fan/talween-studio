import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';

export async function GET(request: NextRequest) {
  try {
    const users = userDb.getAllUsers();
    
    // Create CSV content
    const headers = [
      'ID',
      'البريد الإلكتروني',
      'الاسم',
      'النقاط',
      'الحالة',
      'تم التحقق من البريد',
      'مستوى الاشتراك',
      'تاريخ الإنشاء',
      'آخر دخول',
      'إجمالي المدفوع'
    ];
    
    const csvRows = users.map(user => [
      user.id,
      user.email,
      user.display_name,
      user.credits,
      user.status,
      user.email_verified ? 'نعم' : 'لا',
      user.subscription_tier,
      new Date(user.created_at * 1000).toLocaleDateString('ar-SA'),
      user.last_login ? new Date(user.last_login * 1000).toLocaleDateString('ar-SA') : 'لم يسجل دخول',
      user.total_spent
    ]);
    
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="talween-users.csv"'
      }
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    );
  }
}
