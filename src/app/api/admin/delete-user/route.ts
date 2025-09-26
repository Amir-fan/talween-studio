import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { userDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    console.log('🗑️ ADMIN API - Deleting user:', { userId, userName });

    // Step 1: Delete from Google Sheets
    console.log('📊 Step 1: Deleting from Google Sheets...');
    const googleSheetsResponse = await fetch(`${config.googleAppsScriptUrl}?action=deleteUser&apiKey=${config.googleSheetsApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'deleteUser',
        apiKey: config.googleSheetsApiKey,
        userId 
      })
    });

    const googleSheetsData = await googleSheetsResponse.json();
    console.log('📊 Google Sheets response:', googleSheetsData);

    if (!googleSheetsData.success) {
      console.error('❌ Failed to delete from Google Sheets:', googleSheetsData.error);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to delete from Google Sheets: ${googleSheetsData.error}` 
      }, { status: 500 });
    }

    // Step 2: Delete from local JSON database (comprehensive deletion)
    console.log('💾 Step 2: Deleting from local database (comprehensive)...');
    const localDeleteResult = userDb.deleteUserCompletely(userId);
    console.log('💾 Local database response:', localDeleteResult);

    if (!localDeleteResult.success) {
      console.warn('⚠️ User not found in local database (this might be normal)');
    }

    // Step 3: Log cleanup results
    console.log('🧹 Step 3: Cleanup results:', {
      userDeleted: localDeleteResult.results?.userDeleted || false,
      ordersDeleted: localDeleteResult.results?.ordersDeleted || 0,
      emailLogsDeleted: localDeleteResult.results?.emailLogsDeleted || 0,
      contentDeleted: localDeleteResult.results?.contentDeleted || 0
    });

    console.log('✅ User deletion completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: `User "${userName || userId}" deleted successfully from all databases`,
      deletedUser: {
        id: userId,
        name: userName,
        googleSheetsDeleted: googleSheetsData.success,
        localDatabaseDeleted: localDeleteResult.success,
        cleanupResults: localDeleteResult.results
      }
    });

  } catch (error) {
    console.error('❌ Error in delete user API:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}