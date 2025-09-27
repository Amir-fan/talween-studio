// Clear All Users Script
// This script will clear all users from both Google Sheets and local database

const fs = require('fs');
const path = require('path');

// Configuration
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCnPVVhTeGGHSgxZVGi0ha9VAhvDDo1JyuuVpFrCA3N06jfAnzDqzyZEr9SFm7Poza/exec';
const GOOGLE_SHEETS_API_KEY = '4808f174cdf9c9aa94cdd80d02d3b069fa04b49b';

// Local database paths
const LOCAL_DB_PATH = path.join(__dirname, 'data', 'db.json');
const SIMPLE_DB_PATH = path.join(__dirname, 'database.json');

async function clearGoogleSheetsUsers() {
  console.log('🗑️ Clearing users from Google Sheets...');
  
  try {
    // First, get all users to get their IDs
    const getUsersUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=getUsers&apiKey=${GOOGLE_SHEETS_API_KEY}`;
    const response = await fetch(getUsersUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to get users: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.users && data.users.length > 0) {
      console.log(`Found ${data.users.length} users to delete...`);
      
      // Delete each user
      for (const user of data.users) {
        try {
          const deleteUrl = `${GOOGLE_APPS_SCRIPT_URL}`;
          const deleteResponse = await fetch(deleteUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'deleteUser',
              userId: user.id || user.uid,
              apiKey: GOOGLE_SHEETS_API_KEY
            })
          });
          
          if (deleteResponse.ok) {
            const deleteData = await deleteResponse.json();
            if (deleteData.success) {
              console.log(`✅ Deleted user: ${user.email || user['البريد الإلكتروني'] || user.id}`);
            } else {
              console.log(`❌ Failed to delete user: ${user.email || user['البريد الإلكتروني'] || user.id} - ${deleteData.error}`);
            }
          } else {
            console.log(`❌ HTTP error deleting user: ${user.email || user['البريد الإلكتروني'] || user.id}`);
          }
        } catch (error) {
          console.log(`❌ Error deleting user ${user.email || user['البريد الإلكتروني'] || user.id}:`, error.message);
        }
      }
    } else {
      console.log('No users found in Google Sheets');
    }
    
    console.log('✅ Google Sheets cleanup completed');
  } catch (error) {
    console.error('❌ Error clearing Google Sheets users:', error.message);
  }
}

function clearLocalDatabase() {
  console.log('🗑️ Clearing local database...');
  
  try {
    // Clear data/db.json
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const dbData = {
        users: [],
        orders: [],
        emailLogs: [],
        userContent: []
      };
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(dbData, null, 2));
      console.log('✅ Cleared data/db.json');
    } else {
      console.log('⚠️ data/db.json not found');
    }
    
    // Clear database.json
    if (fs.existsSync(SIMPLE_DB_PATH)) {
      const simpleDbData = {
        users: [],
        orders: [],
        emailLogs: [],
        userContent: []
      };
      fs.writeFileSync(SIMPLE_DB_PATH, JSON.stringify(simpleDbData, null, 2));
      console.log('✅ Cleared database.json');
    } else {
      console.log('⚠️ database.json not found');
    }
    
    console.log('✅ Local database cleanup completed');
  } catch (error) {
    console.error('❌ Error clearing local database:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting complete user cleanup...');
  console.log('⚠️ WARNING: This will delete ALL users from the system!');
  console.log('');
  
  // Clear local database first
  clearLocalDatabase();
  
  // Clear Google Sheets
  await clearGoogleSheetsUsers();
  
  console.log('');
  console.log('🎉 Cleanup completed! All users have been removed.');
  console.log('You can now start fresh with your clients.');
}

// Run the cleanup
main().catch(console.error);
