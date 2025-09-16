// Professional Email Templates for Talween Studio
// Copy this entire code into your Google Apps Script project

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { recipientEmail, emailType, templateData, userId } = data;
    
    if (!recipientEmail || !emailType) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Missing required fields' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    let subject = '';
    let htmlBody = '';
    
    switch (emailType) {
      case 'emailVerification':
        subject = 'تأكيد بريدك الإلكتروني - تلوين ستوديو';
        htmlBody = getVerificationEmailTemplate(templateData);
        break;
        
      case 'welcomeAfterVerification':
        subject = 'مرحباً بك في تلوين ستوديو! 🎨';
        htmlBody = getWelcomeEmailTemplate(templateData);
        break;
        
      case 'passwordReset':
        subject = 'إعادة تعيين كلمة المرور - تلوين ستوديو';
        htmlBody = getPasswordResetEmailTemplate(templateData);
        break;
        
      case 'welcome':
        subject = 'مرحباً بك في تلوين ستوديو!';
        htmlBody = getWelcomeEmailTemplate(templateData);
        break;
        
      case 'orderConfirmation':
        subject = 'تأكيد الطلب - تلوين ستوديو';
        htmlBody = getOrderConfirmationTemplate(templateData);
        break;
        
      case 'paymentSuccess':
        subject = 'تم الدفع بنجاح - تلوين ستوديو';
        htmlBody = getPaymentSuccessTemplate(templateData);
        break;
        
      case 'creditsAdded':
        subject = 'تم إضافة النقاط إلى حسابك - تلوين ستوديو';
        htmlBody = getCreditsAddedTemplate(templateData);
        break;
        
      case 'paymentSuccess':
        subject = 'تم الدفع بنجاح - تلوين ستوديو';
        htmlBody = getPaymentSuccessTemplate(templateData);
        break;
        
      default:
        subject = 'رسالة من تلوين ستوديو';
        htmlBody = getDefaultEmailTemplate(templateData);
    }
    
    GmailApp.sendEmail(
      recipientEmail,
      subject,
      '',
      {
        htmlBody: htmlBody,
        name: 'تلوين ستوديو'
      }
    );
    
    console.log(`Email sent successfully to ${recipientEmail} for ${emailType}`);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        recipientEmail,
        emailType 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error sending email:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Email Verification Template
function getVerificationEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد البريد الإلكتروني</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">تلوين ستوديو</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">مرحباً بك في عالم الإبداع!</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #4ecdc4, #45b7d1); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">✉️</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">تأكيد بريدك الإلكتروني</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
              مرحباً ${data.name || 'عزيزي المستخدم'}،<br>
              شكراً لك على التسجيل في تلوين ستوديو! يرجى النقر على الزر أدناه لتأكيد بريدك الإلكتروني والبدء في رحلة الإبداع.
            </p>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #4ecdc4); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3); transition: all 0.3s ease;">
              تأكيد البريد الإلكتروني
            </a>
          </div>
          
          <!-- Features -->
          <div style="background: #f8f9fa; padding: 30px; border-radius: 15px; margin: 30px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 20px 0; text-align: center; font-size: 20px;">ما ينتظرك في تلوين ستوديو:</h3>
            <div style="display: flex; flex-direction: column; gap: 15px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 24px;">🎨</span>
                <span style="color: #2c3e50; font-size: 16px;">إنشاء قصص شخصية مذهلة</span>
              </div>
              <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 24px;">🖼️</span>
                <span style="color: #2c3e50; font-size: 16px;">تحويل الصور إلى صفحات تلوين</span>
              </div>
              <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 24px;">✨</span>
                <span style="color: #2c3e50; font-size: 16px;">50 نقطة مجانية للبدء</span>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #ecf0f1;">
            <p style="color: #95a5a6; font-size: 14px; margin: 0;">
              إذا لم تقم بإنشاء حساب في تلوين ستوديو، يرجى تجاهل هذا البريد.<br>
              هذا البريد تم إرساله تلقائياً، يرجى عدم الرد عليه.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Welcome Email Template
function getWelcomeEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>مرحباً بك في تلوين ستوديو</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4ecdc4, #45b7d1); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">مرحباً بك! 🎉</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">تم تأكيد حسابك بنجاح</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #4ecdc4, #45b7d1); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🎨</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">مرحباً ${data.name || 'عزيزي المستخدم'}!</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
              تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن الاستمتاع بجميع ميزات تلوين ستوديو وبدء رحلة الإبداع مع طفلك.
            </p>
          </div>
          
          <!-- Credits Card -->
          <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 25px; border-radius: 15px; margin: 30px 0; text-align: center;">
            <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 24px;">🎁 هديتك المجانية</h3>
            <p style="color: #2c3e50; margin: 0; font-size: 18px; font-weight: bold;">50 نقطة مجانية</p>
            <p style="color: #2c3e50; margin: 10px 0 0 0; font-size: 14px;">يمكنك استخدام هذه النقاط لإنشاء قصص وصور تلوين مخصصة!</p>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://your-domain.com/create" style="display: inline-block; background: linear-gradient(135deg, #4ecdc4, #45b7d1); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);">
              ابدأ الإبداع الآن
            </a>
          </div>
          
          <!-- Features Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 15px;">
              <div style="font-size: 32px; margin-bottom: 10px;">📚</div>
              <h4 style="color: #2c3e50; margin: 0 0 10px 0;">قصص شخصية</h4>
              <p style="color: #7f8c8d; margin: 0; font-size: 14px;">أنشئ قصص مخصصة لطفلك</p>
            </div>
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 15px;">
              <div style="font-size: 32px; margin-bottom: 10px;">🖼️</div>
              <h4 style="color: #2c3e50; margin: 0 0 10px 0;">صفحات تلوين</h4>
              <p style="color: #7f8c8d; margin: 0; font-size: 14px;">حوّل الصور إلى صفحات تلوين</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Password Reset Template
function getPasswordResetEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>إعادة تعيين كلمة المرور</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b6b, #ffa726); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">إعادة تعيين كلمة المرور</h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ff6b6b, #ffa726); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🔐</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">إعادة تعيين كلمة المرور</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
              مرحباً ${data.name || 'عزيزي المستخدم'}،<br>
              تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. انقر على الزر أدناه لإعادة تعيين كلمة المرور.
            </p>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.resetLink}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #ffa726); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          
          <!-- Security Notice -->
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin: 30px 0;">
            <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">🔒 ملاحظة أمنية</h4>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد. 
              رابط إعادة التعيين صالح لمدة 24 ساعة فقط.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Order Confirmation Template
function getOrderConfirmationTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد الطلب</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #00b894, #00cec9); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">تم تأكيد طلبك! ✅</h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">شكراً لك على طلبك!</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
              تم تأكيد طلبك بنجاح. يمكنك الآن الاستمتاع بجميع الميزات المدفوعة.
            </p>
          </div>
          
          <!-- Order Details -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin: 30px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 20px 0; text-align: center;">تفاصيل الطلب</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #7f8c8d;">رقم الطلب:</span>
              <span style="color: #2c3e50; font-weight: bold;">${data.orderId || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #7f8c8d;">المبلغ:</span>
              <span style="color: #2c3e50; font-weight: bold;">${data.amount || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #7f8c8d;">تاريخ الطلب:</span>
              <span style="color: #2c3e50; font-weight: bold;">${new Date().toLocaleDateString('ar-SA')}</span>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Payment Success Template
function getPaymentSuccessTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تم الدفع بنجاح</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #00b894, #00cec9); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">تم الدفع بنجاح! 💳</h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #00b894, #00cec9); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">✅</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">تم الدفع بنجاح!</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
              شكراً لك! تم استلام دفعتك بنجاح وتم تفعيل حسابك.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Credits Added Template
function getCreditsAddedTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تم إضافة النقاط</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #fdcb6e, #e17055); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">تم إضافة النقاط! ⭐</h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #fdcb6e, #e17055); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">⭐</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">تم إضافة ${data.credits || '0'} نقطة!</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
              تم إضافة النقاط إلى حسابك بنجاح. يمكنك الآن الاستمتاع بإنشاء المزيد من المحتوى!
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Default Template
function getDefaultEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>رسالة من تلوين ستوديو</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="padding: 40px 30px;">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0;">مرحباً ${data.name || 'عزيزي المستخدم'}!</h2>
          <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
            ${data.message || 'شكراً لك على استخدام تلوين ستوديو!'}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Test function
function testEmail() {
  const testData = {
    recipientEmail: 'your-email@gmail.com',
    emailType: 'emailVerification',
    templateData: {
      name: 'Test User',
      verificationLink: 'https://your-domain.com/verify-email?token=test123'
    },
    userId: 'test123'
  };
  
  const result = doPost({
    postData: {
      contents: JSON.stringify(testData)
    }
  });
  
  console.log(result.getContent());
}
