import nodemailer from 'nodemailer';
import { emailDb } from './simple-database';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const emailTemplates = {
  // Registration emails
  emailVerification: (name: string, verificationLink: string) => ({
    subject: 'فعل حسابك في تلوين ✨',
    html: `
      <div dir="rtl" style="font-family: Cairo, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef3c7, #fde68a);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A2561A; font-size: 32px; margin: 0;">تلوين ستوديو</h1>
          <p style="color: #92400e; font-size: 16px; margin: 10px 0 0 0;">عالم الإبداع والقصص السحرية</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h2 style="color: #A2561A; font-size: 24px; margin: 0 0 20px 0; text-align: center;">هلا ${name} 👋</h2>
          
          <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 25px 0;">
            مرحباً بك في عالم تلوين! نحن متحمسون لرؤية الإبداع الذي ستنشئه لطفلك.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            اضغط على الرابط أدناه لتفعيل حسابك والبدء في إنشاء قصص سحرية:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: linear-gradient(135deg, #ec4899, #8b5cf6); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 5px 15px rgba(236, 72, 153, 0.3);">
              فعّل حسابي الآن ✨
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
            صلاحية الرابط محدودة. إذا لم تطلب هذا الحساب، يمكنك تجاهل هذه الرسالة.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
          <p>© 2024 تلوين ستوديو. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    `
  }),

  welcomeAfterVerification: (name: string) => ({
    subject: 'مرحبا بك في عالم تلوين 🎉',
    html: `
      <div dir="rtl" style="font-family: Cairo, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #ecfdf5, #d1fae5);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; font-size: 32px; margin: 0;">🎉 مبروك!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h2 style="color: #A2561A; font-size: 24px; margin: 0 0 20px 0; text-align: center;">مرحباً ${name}!</h2>
          
          <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 25px 0;">
            حسابك صار جاهز! تقدر تدخل وتبدأ تولّد قصص ورسومات باسم طفلك.
          </p>
          
          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: #A2561A; margin: 0 0 10px 0;">🎁 هديتك المجانية:</h3>
            <ul style="color: #374151; margin: 0; padding-right: 20px;">
              <li>128 نقطة مجانية للبدء</li>
              <li>قصة شخصية كاملة</li>
              <li>صفحات تلوين مخصصة</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/create" 
               style="background: linear-gradient(135deg, #ec4899, #8b5cf6); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 5px 15px rgba(236, 72, 153, 0.3);">
              ابدأ إبداعك الآن 🎨
            </a>
          </div>
        </div>
      </div>
    `
  }),

  passwordReset: (name: string, resetLink: string) => ({
    subject: 'طلب إعادة كلمة المرور',
    html: `
      <div dir="rtl" style="font-family: Cairo, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef2f2, #fecaca);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; font-size: 32px; margin: 0;">تلوين ستوديو</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h2 style="color: #A2561A; font-size: 24px; margin: 0 0 20px 0; text-align: center;">مرحباً ${name}</h2>
          
          <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 25px 0;">
            تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            اضغط على الرابط أدناه لتغيير كلمة المرور:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #dc2626, #ef4444); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 5px 15px rgba(220, 38, 38, 0.3);">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
            إذا لم تطلب هذا التغيير، تجاهل هذه الرسالة. الرابط صالح لمدة ساعة واحدة.
          </p>
        </div>
      </div>
    `
  }),

  // Order emails
  orderConfirmation: (name: string, orderNumber: string, totalAmount: number) => ({
    subject: `تم استلام طلبك #${orderNumber}`,
    html: `
      <div dir="rtl" style="font-family: Cairo, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef3c7, #fde68a);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A2561A; font-size: 32px; margin: 0;">تلوين ستوديو</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h2 style="color: #A2561A; font-size: 24px; margin: 0 0 20px 0; text-align: center;">يعطيك العافية ${name}!</h2>
          
          <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 25px 0;">
            سجلنا طلبك #${orderNumber} وبانتظار الدفع/المراجعة.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: #A2561A; margin: 0 0 15px 0;">تفاصيل الطلب:</h3>
            <p style="margin: 5px 0; color: #374151;"><strong>رقم الطلب:</strong> #${orderNumber}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>المبلغ الإجمالي:</strong> $${totalAmount}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>الحالة:</strong> في الانتظار</p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 25px 0;">
            سنرسل لك رسالة تأكيد أخرى بمجرد اكتمال الدفع.
          </p>
        </div>
      </div>
    `
  }),

  paymentSuccess: (name: string, orderNumber: string, totalAmount: number) => ({
    subject: `إيصالك #${orderNumber} — تم الدفع بنجاح ✅`,
    html: `
      <div dir="rtl" style="font-family: Cairo, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #ecfdf5, #d1fae5);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; font-size: 32px; margin: 0;">✅ تم الدفع بنجاح!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h2 style="color: #A2561A; font-size: 24px; margin: 0 0 20px 0; text-align: center;">شكراً لثقتك ${name}!</h2>
          
          <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 25px 0;">
            هذا إيصالك. تقدر تحمله من هنا:
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: #A2561A; margin: 0 0 15px 0;">تفاصيل الدفع:</h3>
            <p style="margin: 5px 0; color: #374151;"><strong>رقم الطلب:</strong> #${orderNumber}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>المبلغ المدفوع:</strong> $${totalAmount}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>تاريخ الدفع:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account" 
               style="background: linear-gradient(135deg, #059669, #10b981); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 5px 15px rgba(5, 150, 105, 0.3);">
              عرض حسابي
            </a>
          </div>
        </div>
      </div>
    `
  }),

  paymentFailed: (name: string, orderNumber: string) => ({
    subject: 'محاولة الدفع ما تمت',
    html: `
      <div dir="rtl" style="font-family: Cairo, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef2f2, #fecaca);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; font-size: 32px; margin: 0;">تلوين ستوديو</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h2 style="color: #A2561A; font-size: 24px; margin: 0 0 20px 0; text-align: center;">مرحباً ${name}</h2>
          
          <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 25px 0;">
            صار خطأ بالدفع (مثلاً: البطاقة منتهية). جرب مرة ثانية من هنا:
          </p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin: 25px 0; border-right: 4px solid #dc2626;">
            <p style="margin: 0; color: #dc2626; font-weight: bold;">رقم الطلب: #${orderNumber}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account" 
               style="background: linear-gradient(135deg, #dc2626, #ef4444); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 5px 15px rgba(220, 38, 38, 0.3);">
              إعادة المحاولة
            </a>
          </div>
        </div>
      </div>
    `
  }),

  // Additional emails
  abandonedCart: (name: string) => ({
    subject: 'نسيت تكمل طلبك؟',
    html: `
      <div dir="rtl" style="font-family: Cairo, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef3c7, #fde68a);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A2561A; font-size: 32px; margin: 0;">تلوين ستوديو</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h2 style="color: #A2561A; font-size: 24px; margin: 0 0 20px 0; text-align: center;">مرحباً ${name}</h2>
          
          <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 25px 0;">
            احتفظنا بالقصص/الرسومات اللي اخترتها. تقدر تكمل الدفع من هنا:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/create" 
               style="background: linear-gradient(135deg, #ec4899, #8b5cf6); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 5px 15px rgba(236, 72, 153, 0.3);">
              أكمل طلبك الآن
            </a>
          </div>
        </div>
      </div>
    `
  }),

  digitalDelivery: (name: string, downloadLink: string) => ({
    subject: 'ملفاتك جاهزة للتحميل',
    html: `
      <div dir="rtl" style="font-family: Cairo, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #ecfdf5, #d1fae5);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; font-size: 32px; margin: 0;">🎉 ملفاتك جاهزة!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h2 style="color: #A2561A; font-size: 24px; margin: 0 0 20px 0; text-align: center;">مرحباً ${name}</h2>
          
          <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 25px 0;">
            تقدر تنزل الكراسة/القصة الخاصة باسم طفلك من الرابط أدناه:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadLink}" 
               style="background: linear-gradient(135deg, #059669, #10b981); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 5px 15px rgba(5, 150, 105, 0.3);">
              تحميل الملفات 📥
            </a>
          </div>
        </div>
      </div>
    `
  })
};

// Email sending function
export async function sendEmail(
  to: string,
  emailType: string,
  templateData: any,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = emailTemplates[emailType as keyof typeof emailTemplates];
    if (!template) {
      throw new Error(`Email template not found: ${emailType}`);
    }

    const emailContent = template(templateData);
    const emailLogId = emailDb.log(userId || null, emailType, to, emailContent.subject);

    const mailOptions = {
      from: `"تلوين ستوديو" <${process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    await transporter.sendMail(mailOptions);
    emailDb.updateStatus(emailLogId, 'sent');
    
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    emailDb.updateStatus(emailLogId, 'failed', error instanceof Error ? error.message : 'Unknown error');
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export { emailTemplates };
