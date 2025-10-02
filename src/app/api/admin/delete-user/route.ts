import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { userDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ ADMIN DELETE API - Starting deletion process...');
    
    const { userId, userName } = await request.json();
    console.log('🗑️ Request data received:', { userId, userName });
    
    if (!userId) {
      console.log('❌ No userId provided');
      return NextResponse.json({ 
        success: false, 
        error: 'معرف المستخدم مطلوب' 
      }, { status: 400 });
    }

    console.log('🗑️ ADMIN API - Deleting user:', { userId, userName });

    // Step 1: Delete from local database
    console.log('💾 Step 1: Deleting from local database...');
    let localDeleteResult;
    try {
      localDeleteResult = userDb.deleteUserCompletely(userId);
      console.log('💾 Local database deletion result:', localDeleteResult);
    } catch (localError) {
      console.error('💾 Local database deletion error:', localError);
      localDeleteResult = { success: false, error: localError.message };
    }

    // Step 2: Delete from Google Sheets
    console.log('📊 Step 2: Deleting from Google Sheets...');
    let googleSheetsSuccess = false;
    let googleSheetsError = '';
    
    try {
      const response = await fetch(`${config.googleAppsScriptUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteUser',
          userId: userId,
          apiKey: config.googleSheetsApiKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Google Sheets deletion result:', result);
      googleSheetsSuccess = result.success;
      googleSheetsError = result.error || '';
    } catch (error) {
      console.error('📊 Google Sheets deletion error:', error);
      googleSheetsError = error.message;
    }

    // Return success if local deletion succeeded (primary requirement)
    const localSuccess = localDeleteResult && localDeleteResult.success;

    if (!localSuccess) {
      console.error('❌ Failed to delete from local database');
      return NextResponse.json({ 
        success: false, 
        error: 'حدث خطأ أثناء حذف المستخدم من قاعدة البيانات المحلية' 
      }, { status: 500 });
    }

    console.log('✅ User deletion completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: `تم حذف المستخدم "${userName || userId}" بنجاح`,
      deletedUser: {
        id: userId,
        name: userName,
        localDeleted: localSuccess,
        googleSheetsDeleted: googleSheetsSuccess,
        googleSheetsError: googleSheetsError,
        localDetails: localDeleteResult
      }
    });

  } catch (error) {
    console.error('❌ Error in delete user API:', error);
    return NextResponse.json({ 
      success: false, 
      error: `حدث خطأ أثناء حذف المستخدم: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` 
    }, { status: 500 });
  }
}