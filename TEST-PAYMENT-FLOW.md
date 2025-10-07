# Payment System Test - https://italween.com

## ✅ System Status
- Website: **ONLINE**
- Packages Page: **ONLINE**
- Payment API: **ONLINE**

## 🧪 Manual Test Instructions

### Before You Start:
1. Have a MyFatoorah test/sandbox account ready OR be ready to pay $1
2. Open browser in **Incognito/Private mode** for clean test

### Test Steps:

#### Step 1: Note Current Credits
1. Go to https://italween.com
2. Log in with your account
3. **WRITE DOWN your current credit balance:** `_______` credits

#### Step 2: Initiate Payment
1. Go to https://italween.com/packages
2. Click on **TEST package** ($1, 22 credits)
3. Click "شراء الباقة" (Buy Package) button
4. You should be redirected to MyFatoorah payment portal

#### Step 3: Complete Payment
1. On MyFatoorah portal, enter payment details
2. Complete the payment
3. Wait for redirect back to italween.com

#### Step 4: Verify Success
1. You should land on: `https://italween.com/payment/success?orderId=...`
2. The success page should show:
   - ✅ Payment successful message
   - Order ID
   - Amount: $1
   - Credits: 22
3. Check your credit balance in the header/navbar

#### Step 5: Verify Credits Added
**New credit balance should be:** `[Previous Credits] + 22 = _______`

### Expected Results:
- ✅ Redirected to success page (not error page)
- ✅ Success page shows correct order details
- ✅ Credits increased by exactly 22
- ✅ No console errors

### If Test Fails:
1. Open browser console (F12)
2. Look for errors in Console tab
3. Check Network tab for failed API calls
4. Send me screenshot of:
   - Success/Error page
   - Console errors
   - Network tab showing payment-related calls

## 🔧 Alternative: Automated Test

If you want to test programmatically (without going through the UI):

```powershell
# Replace with your actual user ID from the database
$yourUserId = "YOUR_ACTUAL_USER_ID_HERE"

# Get current credits
$syncBody = "{`"userId`":`"$yourUserId`"}"
$beforeResp = Invoke-WebRequest -Uri "https://italween.com/api/user/sync-credits" -Method POST -Body $syncBody -ContentType "application/json"
$beforeData = $beforeResp.Content | ConvertFrom-Json
Write-Host "Credits BEFORE: $($beforeData.user.credits)"

# Create payment session
$paymentBody = "{`"amount`":1,`"currency`":`"USD`",`"packageId`":`"TEST`",`"credits`":22,`"userId`":`"$yourUserId`"}"
$sessionResp = Invoke-WebRequest -Uri "https://italween.com/api/payment/create-session" -Method POST -Body $paymentBody -ContentType "application/json"
$sessionData = $sessionResp.Content | ConvertFrom-Json
Write-Host "Payment URL: $($sessionData.paymentUrl)"
Write-Host "Order ID: $($sessionData.orderId)"

# Complete payment on MyFatoorah portal...
# Then check credits again
Read-Host "Press Enter after completing payment..."

$afterResp = Invoke-WebRequest -Uri "https://italween.com/api/user/sync-credits" -Method POST -Body $syncBody -ContentType "application/json"
$afterData = $afterResp.Content | ConvertFrom-Json
Write-Host "Credits AFTER: $($afterData.user.credits)"
Write-Host "Credits Added: $($afterData.user.credits - $beforeData.user.credits)"
```

## ✅ What I've Already Tested:
1. ✅ Create-session API works correctly
2. ✅ Payment callback endpoint responds
3. ✅ Idempotency checks are in place (prevents duplicate credits)
4. ✅ All payment packages (TEST, EXPLORER, CREATOR) create sessions successfully
5. ✅ Order IDs are generated correctly
6. ✅ MyFatoorah integration is configured

## 🎯 What Needs Your Manual Test:
- Does the full payment flow work end-to-end?
- Are credits actually added to your account after payment?
- Does the success page show correctly?
- Can you verify in your account that credits increased?

