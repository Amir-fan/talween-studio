import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Starting complete user cleanup...');
    
    // Clear Google Sheets users
    await clearGoogleSheetsUsers();
    
    // Clear local database
    clearLocalDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'All users have been cleared successfully',
      cleared: {
        googleSheets: true,
        localDatabase: true
      }
    });
    
  } catch (error) {
    console.error('Error clearing users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear users: ' + error.message
    }, { status: 500 });
  }
}

async function clearGoogleSheetsUsers() {
  try {
    // Get all users first
    const getUsersUrl = `${config.googleAppsScriptUrl}?action=getUsers&apiKey=${config.googleSheetsApiKey}`;
    const response = await fetch(getUsersUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to get users: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.users && data.users.length > 0) {
      console.log(`Found ${data.users.length} users to delete from Google Sheets...`);
      
      // Delete each user
      for (const user of data.users) {
        try {
          const deleteResponse = await fetch(`${config.googleAppsScriptUrl}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'deleteUser',
              userId: user.id || user.uid,
              apiKey: config.googleSheetsApiKey
            })
          });
          
          if (deleteResponse.ok) {
            const deleteData = await deleteResponse.json();
            if (deleteData.success) {
              console.log(`✅ Deleted user: ${user.email || user['البريد الإلكتروني'] || user.id}`);
            }
          }
        } catch (error) {
          console.log(`❌ Error deleting user:`, error.message);
        }
      }
    }
    
    console.log('✅ Google Sheets cleanup completed');
  } catch (error) {
    console.error('❌ Error clearing Google Sheets users:', error.message);
    throw error;
  }
}

function clearLocalDatabase() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Clear data/db.json
    const localDbPath = path.join(process.cwd(), 'data', 'db.json');
    const dbData = {
      users: [],
      orders: [],
      emailLogs: [],
      userContent: []
    };
    fs.writeFileSync(localDbPath, JSON.stringify(dbData, null, 2));
    console.log('✅ Cleared data/db.json');
    
    // Clear database.json
    const simpleDbPath = path.join(process.cwd(), 'database.json');
    const simpleDbData = {
      users: [],
      orders: [],
      emailLogs: [],
      userContent: []
    };
    fs.writeFileSync(simpleDbPath, JSON.stringify(simpleDbData, null, 2));
    console.log('✅ Cleared database.json');
    
    console.log('✅ Local database cleanup completed');
  } catch (error) {
    console.error('❌ Error clearing local database:', error.message);
    throw error;
  }
}
