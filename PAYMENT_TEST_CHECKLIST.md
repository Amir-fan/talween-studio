# 🧪 PAYMENT FLOW TEST CHECKLIST

## ✅ Pre-Test Verification (Code Analysis)

### 1. Package Definition ✅
- **TEST Package**: $0.10, 22 credits
- **Location**: `src/app/packages/page.tsx` line 17
- **API Match**: `src/app/api/payment/add-credits/route.ts` line 7

### 2. Payment Session Creation ✅
- **Endpoint**: `/api/payment/create-session`
- **Creates order in Google Sheets**: ✅
- **Returns URL with params**: 
  ```
  /payment/success?orderId=...&amount=0.10&credits=22&packageId=TEST&userId=...
  ```

### 3. MyFatoorah Callback ✅
- **Endpoint**: `/api/payment/callback`
- **Verifies payment**: ✅
- **Adds credits to Google Sheets**: ✅
- **Redirects with ALL params**: ✅
  ```
  orderId, amount, credits, packageId, userId
  ```

### 4. Success Page ✅
- **Validates all parameters**: ✅
- **Calls add-credits API**: ✅
- **Refreshes user data**: ✅
- **Displays correct amounts**: ✅

### 5. Add Credits API ✅
- **Uses package definitions**: ✅
- **Adds to local DB**: ✅
- **Adds to Google Sheets**: ✅ (using googleSheetsUserDb.addCredits)
- **Returns success with amounts**: ✅

---

## 🧪 MANUAL TEST STEPS

### Step 1: Navigate to Packages Page
1. Go to: `https://italween.com/packages`
2. **Expected**: See TEST package showing **$0.10**
3. **Check**: Package shows "22 نقطة للاختبار"

### Step 2: Click TEST Package
1. Click "شراء الآن" on TEST package
2. **Expected**: Console shows:
   ```
   🔍 [PACKAGES PAGE] === PURCHASE BUTTON CLICKED ===
   🔍 [PACKAGES PAGE] Package ID: TEST
   🔍 [PACKAGES PAGE] Selected package: {id: 'TEST', price: 0.10, credits: 22}
   ```
3. **Expected**: Redirects to payment gateway (MyFatoorah)

### Step 3: Complete Payment
1. Use MyFatoorah test card or real payment
2. **Amount should show**: $0.10 (or equivalent in KWD)
3. Complete the payment

### Step 4: Return to Success Page
1. **Expected URL**:
   ```
   https://italween.com/payment/success?orderId=order_...&amount=0.10&credits=22&packageId=TEST&userId=...
   ```

2. **Expected Console Logs**:
   ```
   🔍 [SUCCESS PAGE] === USEEFFECT TRIGGERED ===
   🔍 [SUCCESS PAGE] URL Search Params: {orderId: "order_...", amount: "0.10", credits: "22", packageId: "TEST", userId: "..."}
   🔍 [SUCCESS PAGE] All validations passed, starting payment completion process...
   🔍 [SUCCESS PAGE] Calling /api/payment/add-credits with: {...}
   🔍 [SUCCESS PAGE] ✅ Add credits API call successful
   🔍 [SUCCESS PAGE] ✅ Credits added successfully
   ```

3. **Expected Display**:
   - ✅ "تم الدفع بنجاح!"
   - ✅ Package name: "اختبار الدفع"
   - ✅ Amount: "$0.10"
   - ✅ Credits: "+22"
   - ✅ Date in Gregorian format (not Hijri)

### Step 5: Verify Credits Added
1. Check your credits in the header
2. **Expected**: Credits increased by 22
3. Check Google Sheets
4. **Expected**: New row in Orders sheet with status "paid"
5. **Expected**: User credits increased by 22

---

## 🔍 DEBUGGING STEPS (If Issues Occur)

### If Redirected to Packages Page:
- **Check Console**: Look for "Missing required parameters" or "Invalid order ID format"
- **Check URL**: Ensure all 5 parameters are present

### If Shows $0 and 0 Credits:
- **Check Console**: Look for add-credits API errors
- **Check Vercel Logs**: Search for "ADD CREDITS API" logs
- **Verify**: Google Sheets API key is correct

### If Credits Not Added:
- **Check Google Sheets**: Look for order in Orders sheet
- **Check User Sheet**: Verify credits column updated
- **Check Console**: Look for Google Sheets errors

---

## ✅ SUCCESS CRITERIA

- [ ] TEST package shows $0.10
- [ ] Payment gateway shows $0.10
- [ ] Success page displays correctly
- [ ] Success page shows $0.10 and 22 credits
- [ ] User credits increase by 22
- [ ] Google Sheets Orders sheet has new row
- [ ] Google Sheets User credits updated
- [ ] No console errors
- [ ] Date shows in Gregorian format

---

## 🚀 CODE VERIFICATION STATUS

| Component | Status | Notes |
|-----------|--------|-------|
| Package Definition | ✅ | $0.10, 22 credits |
| Create Session API | ✅ | All params in URL |
| Callback Route | ✅ | All params passed |
| Success Page | ✅ | React error fixed |
| Add Credits API | ✅ | Import fixed |
| Google Sheets | ✅ | Correct method call |

**ALL CODE CHECKS PASSED! ✅**

The payment flow should work correctly now. Test with the TEST package ($0.10) and verify all steps above.

