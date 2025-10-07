# 🚨 CRITICAL BUG: Credits Being ADDED Instead of DEDUCTED

## Problem Report
User generated an image (text-to-coloring) and received **+700 credits** instead of having 35 credits deducted!

## Expected Behavior
- Cost: 35 credits (TEXT_TO_COLORING)
- Action: DEDUCT 35 credits
- Result: `user.credits = user.credits - 35`

## Actual Behavior  
- User got **+700 credits** added to their account!

## Possible Causes

### 1. Wrong Action Being Called
- Maybe `addCredits` is being called instead of `deductCredits`
- **STATUS:** ✅ Code analysis shows correct `deductCredits` calls

### 2. Sign Error (Negative becomes Positive)
- Maybe passing `-35` which becomes `+35` somewhere
- **NEED TO CHECK:** Actual API calls and Google Sheets logs

### 3. Multiplication Error
- 700 / 35 = 20x multiplication
- Maybe looping 20 times?
- **NEED TO CHECK:** Execution logs

### 4. Google Sheets Script Error
- Maybe the Apps Script has the wrong logic
- **STATUS:** ✅ Apps Script code looks correct (line 586: `newCredits = currentCredits - deductAmount`)

### 5. Local DB vs Sheets Mismatch
- Maybe deducting from one but adding to another
- **NEED TO CHECK:** Both databases

## Diagnostic Steps

### Step 1: Check Current User Credits
```powershell
# Replace with actual user ID
$userId = "YOUR_USER_ID"
$body = "{`"userId`":`"$userId`"}"
$response = Invoke-WebRequest -Uri "https://italween.com/api/user/sync-credits" -Method POST -Body $body -ContentType "application/json"
$data = $response.Content | ConvertFrom-Json
Write-Host "Current Credits: $($data.user.credits)"
```

### Step 2: Check Google Sheets Directly
1. Open your Google Sheets spreadsheet
2. Find the user's row
3. Check the Credits column value
4. Note the exact number

### Step 3: Test Deduction Manually
```powershell
# Test deducting 35 credits
$userId = "YOUR_USER_ID"
$body = "{`"userId`":`"$userId`",`"amount`":35}"
$response = Invoke-WebRequest -Uri "https://italween.com/api/user/deduct-credits" -Method POST -Body $body -ContentType "application/json"
$data = $response.Content | ConvertFrom-Json
Write-Host "Result: $($data | ConvertTo-Json -Depth 5)"
```

### Step 4: Check Browser Console Logs
When you generate an image, open browser console (F12) and look for:
- `🔍 CLIENT CREDIT CHECK`
- `💳 DEDUCT CREDITS API`
- `➖ [GS] deductCredits`
- Any credit-related logs

Look for:
- What amount is being passed?
- Is it positive or negative?
- What's the response?

### Step 5: Check Server Logs (Vercel)
1. Go to Vercel dashboard
2. Check the logs for the last generation
3. Search for keywords: "deductCredits", "addCredits", "credits"
4. Look for the actual API calls and responses

## Quick Fixes to Try

### Fix 1: Add Validation to Prevent Negative Deductions
Update `src/lib/google-sheets-server.ts`:
```typescript
async deductCredits(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  // VALIDATION: Ensure amount is positive
  if (amount <= 0) {
    console.error('❌ Invalid deduction amount:', amount);
    return { success: false, error: 'Deduction amount must be positive' };
  }
  
  try {
    console.log('➖ [GS] deductCredits:', { userId, amount });
    // ... rest of code
```

### Fix 2: Add Detailed Logging
Update `src/app/create/word/server-actions.ts` (TEXT_TO_COLORING):
```typescript
const creditCheck = await checkAndDeductCreditsForFeature(
  values.userId, 
  'TEXT_TO_COLORING',
  `تحويل فكرة نصية إلى صفحة تلوين: ${values.description}`,
  values.userEmail
);
console.log('🔍 DETAILED CREDIT CHECK:', {
  userId: values.userId,
  feature: 'TEXT_TO_COLORING',
  cost: 35,
  result: creditCheck,
  timestamp: new Date().toISOString()
});
```

### Fix 3: Check if Multiple Requests
Maybe the generation is happening multiple times? Add request tracking:
```typescript
// At the top of server-actions.ts
const processingRequests = new Set<string>();

export async function generateImageAction(values) {
  const requestKey = `${values.userId}-${Date.now()}`;
  
  if (processingRequests.has(values.userId)) {
    console.log('⚠️ DUPLICATE REQUEST DETECTED for user:', values.userId);
    return { success: false, error: 'Request already processing' };
  }
  
  processingRequests.add(values.userId);
  try {
    // ... normal processing
  } finally {
    processingRequests.delete(values.userId);
  }
}
```

## Immediate Action Required

**I need you to provide:**
1. Your user ID
2. Your current credit balance (check on the website)
3. Your credit balance in Google Sheets (check the spreadsheet directly)
4. Any browser console errors/logs when you generated the image
5. What happened exactly - did it generate successfully?

**Then I can:**
- Test the exact scenario
- Check the logs
- Identify the root cause
- Deploy a fix immediately

## Prevention Measures

Once we fix this, we should add:
1. ✅ Input validation (amount must be positive)
2. ✅ Detailed logging for all credit operations
3. ✅ Request deduplication
4. ✅ Credit operation audit log
5. ✅ Alerts for abnormal credit changes (> 100 credits)

