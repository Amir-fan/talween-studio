import { emailDb } from './simple-database';

// Google Apps Script Web App URL - you'll get this after deploying the script
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || '';

export async function sendEmail(
  recipientEmail: string,
  emailType: string,
  templateData: any,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!GOOGLE_APPS_SCRIPT_URL) {
      console.error('GOOGLE_APPS_SCRIPT_URL not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const payload = {
      recipientEmail,
      emailType,
      templateData,
      userId
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();

    if (result.success) {
      // Log successful email
      emailDb.log(
        userId,
        emailType,
        recipientEmail,
        `Email sent via Google Apps Script - ${emailType}`,
        'sent'
      );
      
      console.log(`✅ Email sent successfully via Google Apps Script: ${emailType} to ${recipientEmail}`);
      return { success: true };
    } else {
      // Log failed email
      emailDb.log(
        userId,
        emailType,
        recipientEmail,
        `Email failed via Google Apps Script - ${emailType}`,
        'failed',
        result.error
      );
      
      console.error('❌ Email failed via Google Apps Script:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failed email
    emailDb.log(
      userId,
      emailType,
      recipientEmail,
      `Email failed via Google Apps Script - ${emailType}`,
      'failed',
      errorMessage
    );
    
    console.error('❌ Email service error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
