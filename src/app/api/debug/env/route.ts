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
  });
}
