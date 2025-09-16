import { emailDb } from './simple-database';

// Mock email service for development/testing
export async function sendEmail(
  recipientEmail: string,
  emailType: string,
  templateData: any,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Log the email details to console for testing
    console.log('\n📧 MOCK EMAIL SENT:');
    console.log('=====================================');
    console.log(`To: ${recipientEmail}`);
    console.log(`Type: ${emailType}`);
    console.log(`User ID: ${userId}`);
    console.log(`Data:`, JSON.stringify(templateData, null, 2));
    
    if (emailType === 'emailVerification' && templateData.verificationLink) {
      console.log('\n🔗 VERIFICATION LINK:');
      console.log('=====================================');
      console.log(templateData.verificationLink);
      console.log('=====================================\n');
    }
    
    // Log to database
    emailDb.log(
      userId,
      emailType,
      recipientEmail,
      `Mock email sent - ${emailType}`,
      'sent'
    );

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    emailDb.log(
      userId,
      emailType,
      recipientEmail,
      `Mock email failed - ${emailType}`,
      'failed',
      errorMessage
    );

    console.error('❌ Mock email service error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}