import { NextRequest, NextResponse } from 'next/server';
import { syncAllUsersToSheets } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    await syncAllUsersToSheets();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing to sheets:', error);
    return NextResponse.json(
      { error: 'Failed to sync to Google Sheets' },
      { status: 500 }
    );
  }
}
