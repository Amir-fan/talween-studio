# Production Deployment Guide

## 🚀 Environment Variables

Create a `.env.local` file in your project root with these variables:

```env
# MyFatoorah Payment Integration
MYFATOORAH_API_KEY="your_production_myfatoorah_api_key_here"
MYFATOORAH_BASE_URL="https://api.myfatoorah.com"

# App Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
JWT_SECRET="your-super-secure-jwt-secret-key-here"

# Google AI (for story generation)
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Google Sheets Integration (Optional)
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID="your-spreadsheet-id-here"

# Database
DATABASE_URL="file:./database.sqlite"

# Admin Access
ADMIN_PASSWORD="your-secure-admin-password"
```

## 🔧 Development vs Production

### Development
- Uses `src/config/payment-config.ts` for easy configuration
- API key stored in code file
- Local development server

### Production
- Uses environment variables (`.env.local`)
- API key stored securely in environment
- Deployed to production server

## 📦 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Lint and type check
npm run lint
npm run type-check
```

## 🚀 Deployment Checklist

- [ ] Set up production environment variables
- [ ] Configure MyFatoorah production API key
- [ ] Set up domain and SSL certificate
- [ ] Configure database (SQLite or PostgreSQL)
- [ ] Set up email service (SMTP or Google Apps Script)
- [ ] Test payment flow with $1 test package
- [ ] Configure admin access
- [ ] Set up monitoring and logging

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use different API keys for test/production
- Enable HTTPS in production
- Use strong JWT secrets
- Monitor payment transactions regularly

## 📊 Features Ready for Production

✅ **Payment System**: Real MyFatoorah integration
✅ **User Authentication**: JWT-based auth with email verification
✅ **AI Story Generation**: Google AI integration
✅ **Credit System**: User credits and package management
✅ **Admin Dashboard**: User and payment management
✅ **Email System**: SMTP and Google Apps Script support
✅ **Database**: SQLite with user, order, and content management
✅ **Responsive Design**: Mobile-friendly Arabic UI

## 🎯 Ready for Launch!

Your Talween Studio is now production-ready with:
- Real payment processing
- Secure user authentication
- AI-powered story generation
- Complete admin management
- Professional email system
