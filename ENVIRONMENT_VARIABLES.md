# Environment Variables for cPanel

## Required Environment Variables

Set these in cPanel → Node.js App → Environment Variables:

### Google AI API
```
GOOGLE_API_KEY=your_google_ai_api_key_here
```

### MyFatoorah Payment Integration
```
MYFATOORAH_API_KEY=your_myfatoorah_api_key_here
MYFATOORAH_BASE_URL=https://api.myfatoorah.com
```

### Admin Access (Optional)
```
ADMIN_PASSWORD=your_secure_admin_password_here
```

### Firebase (if you want to re-enable it later)
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project",...}
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### System
```
NODE_ENV=production
PORT=3000
```

## How to Get These Values

### Google AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the key to `GOOGLE_API_KEY`

### MyFatoorah API Key
1. Go to [MyFatoorah Developer Portal](https://portal.myfatoorah.com/)
2. Sign up for a developer account
3. Create a new API key in your dashboard
4. Copy the key to `MYFATOORAH_API_KEY`
5. Use `https://api.myfatoorah.com` for production or `https://apitest.myfatoorah.com` for testing

### Firebase (Optional - currently disabled)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Project Settings → Service Accounts → Generate new private key
3. Copy the entire JSON content to `FIREBASE_SERVICE_ACCOUNT_KEY`
4. Project Settings → General → Your apps → Web app config
5. Copy the config values to the respective environment variables

## Note
The app currently works without Firebase - only Google AI API key is required for AI generation features.
