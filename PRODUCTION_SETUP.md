# Production Setup Guide - MyFatoorah Integration

## 🚀 Quick Start

1. **Get MyFatoorah API Key**:
   - Go to [MyFatoorah Portal](https://portal.myfatoorah.com/)
   - Sign up for a developer account
   - Create a new API key in your dashboard
   - Copy the API key

2. **Configure Environment**:
   ```bash
   # Run the setup script
   node setup-production.js
   
   # Or manually add to .env.local:
   MYFATOORAH_API_KEY="your_actual_api_key_here"
   MYFATOORAH_BASE_URL="https://api.myfatoorah.com"
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   ```

3. **Test Payment**:
   - Use the $1 TEST package to verify payments
   - This will process a real $1 charge
   - Check your MyFatoorah dashboard for transactions

## 🔧 Environment Variables

### Required for Production
```env
# MyFatoorah Payment Integration
MYFATOORAH_API_KEY="your_myfatoorah_api_key_here"
MYFATOORAH_BASE_URL="https://api.myfatoorah.com"

# App Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
JWT_SECRET="your-super-secret-jwt-key-here"

# Google AI (for story generation)
GOOGLE_AI_API_KEY="your-google-ai-api-key"
```

### Optional (for emails)
```env
# SMTP Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Google Sheets Integration
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID="your-spreadsheet-id-here"
```

## 💳 Payment Flow

### How It Works
1. User selects a package on `/packages`
2. System creates order in database
3. MyFatoorah payment session is created
4. User is redirected to `/payment` page
5. User clicks "الانتقال إلى صفحة الدفع" button
6. MyFatoorah payment page opens in new tab
7. User completes payment on MyFatoorah
8. MyFatoorah redirects to success/error pages
9. System processes payment callback and adds credits

### Test Package
- **$1 TEST package** is available for testing
- This processes a real $1 charge
- Perfect for verifying the payment flow works

## 🔒 Security Features

- ✅ Real MyFatoorah integration (no mocks)
- ✅ SSL encryption for all transactions
- ✅ PCI DSS compliant payment processing
- ✅ No credit card data stored on your servers
- ✅ Secure API key management
- ✅ JWT-based authentication

## 🚨 Important Notes

### Before Going Live
1. **Test thoroughly** with the $1 package
2. **Verify API key** is correct and active
3. **Check callback URLs** are properly configured
4. **Monitor transactions** in MyFatoorah dashboard
5. **Set up proper error handling** for failed payments

### Production Checklist
- [ ] MyFatoorah API key configured
- [ ] Domain URL set in environment
- [ ] Payment callbacks working
- [ ] Success/error pages functional
- [ ] Database properly initialized
- [ ] SSL certificate installed
- [ ] Error monitoring set up

## 🐛 Troubleshooting

### Common Issues

**"MyFatoorah API key not configured"**
- Add `MYFATOORAH_API_KEY` to your `.env.local`
- Restart your development server

**"HTTP error! status: 401"**
- Check your API key is correct
- Verify you're using the right environment (test vs production)
- Ensure your MyFatoorah account is active

**Payment button doesn't work**
- Check browser console for errors
- Verify payment URL is generated correctly
- Ensure popup blockers aren't blocking the payment page

**Payment success but no credits added**
- Check payment callback is working
- Verify order exists in database
- Check MyFatoorah webhook configuration

## 📞 Support

- **MyFatoorah Support**: [portal.myfatoorah.com](https://portal.myfatoorah.com/)
- **Documentation**: [MyFatoorah API Docs](https://myfatoorah.readme.io/)
- **Test Cards**: Use MyFatoorah test card numbers for testing

## 🎯 Ready for Production!

Once you've configured your MyFatoorah API key and tested with the $1 package, your payment system is ready for live transactions!
