import { NextResponse } from 'next/server';

export async function GET() {
  // Only show first 10 characters of API key for security
  const apiKeyPreview = process.env.MYFATOORAH_API_KEY 
    ? `${process.env.MYFATOORAH_API_KEY.substring(0, 10)}...` 
    : 'NOT SET';
    
  return NextResponse.json({
    MYFATOORAH_API_KEY: apiKeyPreview,
    MYFATOORAH_BASE_URL: process.env.MYFATOORAH_BASE_URL || 'NOT SET',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    // Don't expose JWT_SECRET for security
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    // Google Sheets environment variables
    GOOGLE_APPS_SCRIPT_URL: process.env.GOOGLE_APPS_SCRIPT_URL ? 'SET' : 'NOT SET',
    GOOGLE_SHEETS_API_KEY: process.env.GOOGLE_SHEETS_API_KEY ? 'SET' : 'NOT SET',
    GOOGLE_SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID ? 'SET' : 'NOT SET',
    // NEXT_PUBLIC versions (should not be readable server-side)
    NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL: process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID: process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID ? 'SET' : 'NOT SET',
  });
}
