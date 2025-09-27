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

    // Step 1: Delete from local database
    console.log('💾 Step 1: Deleting from local database...');
    const localDeleteResult = userDb.deleteUserCompletely(userId);
    console.log('💾 Local database deletion result:', localDeleteResult);

    // Step 2: Delete from Google Sheets
    console.log('📊 Step 2: Deleting from Google Sheets...');
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

    // Return success if either deletion succeeded
    const localSuccess = localDeleteResult.success;
    const googleSheetsSuccess = googleSheetsData.success;

    if (!localSuccess && !googleSheetsSuccess) {
      console.error('❌ Failed to delete from both databases');
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete user from both local database and Google Sheets' 
      }, { status: 500 });
    }

    console.log('✅ User deletion completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: `User "${userName || userId}" deleted successfully`,
      deletedUser: {
        id: userId,
        name: userName,
        localDeleted: localSuccess,
        googleSheetsDeleted: googleSheetsSuccess,
        localDetails: localDeleteResult
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