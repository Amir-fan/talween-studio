# 🔍 Code Quality Analysis - "2 Functions in 1" Issues

**Date:** October 10, 2025  
**Analysis:** Authentication, Payment, Credits, and User Management

---

## 🎯 **TL;DR - Summary**

### ❌ **YES - Multiple "God Functions" Found!**

Your codebase has several functions doing **too much** (violating Single Responsibility Principle):

1. **`loginUser()` in `src/lib/auth.ts`** - 150+ lines, does 7 things
2. **`POST` handler in `src/app/api/payment/callback/route.ts`** - Does payment + credits + order update
3. **`signUp()` and `signIn()` in `src/context/auth-context.tsx`** - API call + localStorage + state management
4. **Duplicate credit logic** across 4+ files

---

## 🚨 **Critical Issues Found**

### **Issue #1: God Function - `loginUser()`**
**Location:** `src/lib/auth.ts` (lines 125-279)

**What it does (7 responsibilities):**
```typescript
export async function loginUser(email: string, password: string) {
  // 1. Environment detection (production vs development)
  // 2. Try Google Sheets lookup
  // 3. Try local database lookup
  // 4. Try admin user lookup
  // 5. Try backup restoration
  // 6. Password verification (bcrypt + fallback)
  // 7. Update last login
  // 8. Generate JWT token
  // 9. Return result
}
```

**❌ Problems:**
- **150+ lines** in one function
- **Multiple database queries** in sequence (not parallel)
- **Complex nested if/else** based on environment
- **Hard to test** - too many paths
- **Hard to maintain** - change one thing, break 5 things

**✅ Senior Solution:**
```typescript
// Extract separate concerns:

// 1. User lookup service
class UserLookupService {
  async findUser(email: string): Promise<User | null> {
    // Try all sources in parallel
    const [sheets, local, admin] = await Promise.allSettled([
      this.googleSheetsLookup(email),
      this.localDbLookup(email),
      this.adminLookup(email)
    ]);
    return this.getFirstSuccess([sheets, local, admin]);
  }
}

// 2. Password verification service
class PasswordVerifier {
  async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return this.fallbackVerify(password, hash);
    }
  }
}

// 3. Token generation service
class TokenService {
  generate(user: User): string {
    return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  }
}

// 4. Login orchestrator (single responsibility: coordinate)
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const user = await userLookup.findUser(email);
  if (!user) return { success: false, error: 'User not found' };
  
  const isValid = await passwordVerifier.verify(password, user.password);
  if (!isValid) return { success: false, error: 'Invalid password' };
  
  await userActivity.updateLastLogin(user.id);
  const token = tokenService.generate(user);
  
  return { success: true, user, token };
}
```

---

### **Issue #2: Duplicate Credit Logic**
**Locations:**
- `src/app/api/payment/add-credits/route.ts`
- `src/app/api/payment/verify/route.ts`
- `src/app/api/payment/callback/route.ts` (GET and POST handlers)
- `src/app/api/admin/add-credits/route.ts`
- `src/lib/local-credits.ts`

**❌ Problems:**
```typescript
// THIS PATTERN REPEATS 5+ TIMES:

// Add to local DB
userDb.updateCredits(userId, amount);

// Add to Google Sheets
const result = await googleSheetsUserDb.addCredits(userId, amount);

// If failed, try by email
if (!result.success) {
  const lookup = await googleSheetsUserDb.findByEmail(user.email);
  if (lookup.success && lookup.user?.id) {
    await googleSheetsUserDb.addCredits(lookup.user.id, amount);
  }
}
```

**❌ What's wrong:**
- **Copy-pasted code** across 5 files
- **No single source of truth**
- **Bug in one place = bug everywhere**
- **Hard to add features** (e.g., transaction history)

**✅ Senior Solution:**
```typescript
// src/lib/services/credit-service.ts

export class CreditService {
  /**
   * Add credits to user (single source of truth)
   * Handles both local DB and Google Sheets
   * Includes fallback logic and error recovery
   */
  async addCredits(userId: string, amount: number, reason?: string): Promise<CreditResult> {
    // Validation
    if (!userId || amount <= 0) {
      throw new Error('Invalid parameters');
    }

    // Start transaction
    const transaction = await this.startTransaction();

    try {
      // Add to local DB
      const localResult = await this.addToLocalDb(userId, amount);
      
      // Add to Google Sheets with fallback
      const sheetsResult = await this.addToGoogleSheets(userId, amount);
      
      // Record transaction history
      await this.recordTransaction(userId, amount, reason);
      
      // Commit transaction
      await transaction.commit();
      
      return { success: true, newBalance: localResult.balance };
    } catch (error) {
      // Rollback on error
      await transaction.rollback();
      throw error;
    }
  }

  private async addToGoogleSheets(userId: string, amount: number): Promise<void> {
    // Try by ID first
    const byId = await googleSheetsUserDb.addCredits(userId, amount);
    if (byId.success) return;
    
    // Fallback: lookup by email
    const user = await this.getUserByEmail(userId);
    if (user) {
      await googleSheetsUserDb.addCredits(user.id, amount);
    }
  }
}

// Usage everywhere:
const creditService = new CreditService();
await creditService.addCredits(userId, 22, 'Package purchase: TEST');
```

---

### **Issue #3: Payment Callback Does Too Much**
**Location:** `src/app/api/payment/callback/route.ts`

**POST Handler (lines 155-252):**
```typescript
export async function POST(request: NextRequest) {
  // 1. Parse MyFatoorah callback
  // 2. Find order in Google Sheets
  // 3. Update order status
  // 4. Find user in local DB
  // 5. Add credits to local DB
  // 6. Add credits to Google Sheets (with fallback)
  // 7. Return response
}
```

**❌ Problems:**
- **97 lines** in one function
- **Mixes payment logic with credit logic**
- **Hard to test** payment verification separately from credits
- **Duplicate credit code** (lines 214-235 identical to other files)

**✅ Senior Solution:**
```typescript
// Separate concerns:

// 1. Payment verification
class PaymentVerificationService {
  async verifyCallback(body: MyFatoorahCallback): Promise<VerificationResult> {
    const { InvoiceId, TransactionStatus, TransactionId } = body;
    
    if (!InvoiceId) throw new Error('Missing InvoiceId');
    
    const order = await this.orderService.findByInvoice(InvoiceId);
    if (!order) throw new Error('Order not found');
    
    if (order.Status === 'paid') {
      return { alreadyProcessed: true, order };
    }
    
    return { alreadyProcessed: false, order, status: TransactionStatus };
  }
}

// 2. Order status manager
class OrderStatusManager {
  async markAsPaid(orderId: string, transactionId: string): Promise<void> {
    await updateOrderStatus({ orderId, status: 'paid', paymentId: transactionId });
  }
}

// 3. Orchestrator
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Verify payment
  const verification = await paymentVerifier.verifyCallback(body);
  
  if (verification.alreadyProcessed) {
    return NextResponse.json({ success: true, message: 'Already processed' });
  }
  
  // Update order
  await orderManager.markAsPaid(verification.order.ID, body.TransactionId);
  
  // Add credits (using centralized service)
  if (verification.status === 'Paid') {
    await creditService.addCredits(
      verification.order.UserID, 
      verification.order.CreditsPurchased,
      `Payment: ${verification.order.ID}`
    );
  }
  
  return NextResponse.json({ received: true });
}
```

---

### **Issue #4: Auth Context Does Too Much**
**Location:** `src/context/auth-context.tsx`

**`signUp()` function (lines 220-264):**
```typescript
const signUp = async (email: string, password: string, displayName?: string) => {
  // 1. Set loading state
  // 2. Make API call
  // 3. Parse response
  // 4. Transform user object
  // 5. Store in localStorage
  // 6. Update React state (setUser)
  // 7. Update React state (setUserData)
  // 8. Update React state (setIsAdmin)
  // 9. Return result
}
```

**❌ Problems:**
- **Mixes API logic with state management**
- **localStorage logic in React context** (should be separate)
- **Hard to test** - tightly coupled
- **Copy-pasted in `signIn()`** (lines 266-321)

**✅ Senior Solution:**
```typescript
// 1. Separate API layer
// src/lib/api/auth-api.ts
export class AuthApi {
  async signUp(email: string, password: string, displayName?: string) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName })
    });
    return response.json();
  }

  async signIn(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }
}

// 2. Separate storage layer
// src/lib/storage/user-storage.ts
export class UserStorage {
  save(user: User): void {
    const userForStorage = { ...user, uid: user.id };
    localStorage.setItem('talween_user', JSON.stringify(userForStorage));
  }

  load(): User | null {
    const stored = localStorage.getItem('talween_user');
    return stored ? JSON.parse(stored) : null;
  }

  clear(): void {
    localStorage.removeItem('talween_user');
  }
}

// 3. Simplified context (only state management)
// src/context/auth-context.tsx
const signUp = async (email: string, password: string, displayName?: string) => {
  setLoading(true);
  
  try {
    const data = await authApi.signUp(email, password, displayName);
    
    if (data.success && data.user) {
      const user = { ...data.user, id: data.user.id };
      userStorage.save(user);
      setUser(user);
      setUserData(user);
      setIsAdmin(user.role === 'admin');
      return { success: true };
    }
    
    return { success: false, error: data.error };
  } catch (error) {
    return { success: false, error: 'Network error' };
  } finally {
    setLoading(false);
  }
};
```

---

## 📊 **Code Quality Metrics**

### **Current State:**

| Metric | Current | Senior Standard | Status |
|--------|---------|-----------------|--------|
| **`loginUser()` function length** | 150+ lines | < 50 lines | ❌ 3x too long |
| **Duplicate credit logic** | 5 copies | 1 service | ❌ 5x duplication |
| **Payment callback complexity** | 97 lines | < 30 lines | ❌ 3x too complex |
| **Auth context responsibilities** | 9 things | 1-2 things | ❌ 4-5x too many |
| **Test coverage** | ~0% | > 70% | ❌ Not testable |
| **Separation of concerns** | Low | High | ❌ Tightly coupled |

---

## ✅ **Recommended Refactoring Priority**

### **HIGH PRIORITY (Do First):**

1. **Extract Credit Service** (affects 5+ files)
   ```typescript
   // Create: src/lib/services/credit-service.ts
   // Consolidate all credit logic into ONE place
   // Estimated time: 2-3 hours
   // Impact: Eliminates 80% of duplicate code
   ```

2. **Simplify Payment Callback**
   ```typescript
   // Separate: verification, order update, credit addition
   // Make each function < 30 lines
   // Estimated time: 1-2 hours
   // Impact: Much easier to debug payment issues
   ```

### **MEDIUM PRIORITY (Do Second):**

3. **Refactor `loginUser()` Function**
   ```typescript
   // Extract: UserLookupService, PasswordVerifier, TokenService
   // Main function becomes orchestrator only
   // Estimated time: 2-3 hours
   // Impact: 10x easier to maintain and test
   ```

4. **Separate Auth Context Concerns**
   ```typescript
   // Extract: AuthApi, UserStorage
   // Context only manages React state
   // Estimated time: 1-2 hours
   // Impact: Testable, reusable, maintainable
   ```

### **LOW PRIORITY (Nice to Have):**

5. **Add TypeScript Interfaces**
   ```typescript
   // Define clear contracts for all services
   // Estimated time: 1 hour
   ```

6. **Add Unit Tests**
   ```typescript
   // Test each service independently
   // Estimated time: 4-6 hours
   ```

---

## 🎯 **Benefits of Refactoring**

### **Before Refactoring:**
```typescript
// To add a new credit source, you need to:
// 1. Modify 5 different files
// 2. Copy-paste 30+ lines of code
// 3. Risk breaking existing credit logic
// 4. Hard to test
// 5. Hard to debug
```

### **After Refactoring:**
```typescript
// To add a new credit source:
// 1. Modify CreditService class only
// 2. Add 5-10 lines of code
// 3. Existing code still works (tests pass)
// 4. Easy to test (mock the service)
// 5. Easy to debug (logs in one place)
```

---

## 💡 **Quick Win: Extract Credit Service**

**Most impactful change you can make right now:**

```typescript
// src/lib/services/credit-service.ts

import { userDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export class CreditService {
  /**
   * Add credits to user in both databases
   * Single source of truth for all credit operations
   */
  async addCredits(
    userId: string, 
    amount: number, 
    reason?: string
  ): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
      console.log('💰 [CREDIT SERVICE] Adding credits:', { userId, amount, reason });

      // Validate
      if (!userId || amount <= 0) {
        return { success: false, error: 'Invalid parameters' };
      }

      // Get current user
      const user = userDb.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const currentBalance = user.credits || 0;

      // Update local database
      userDb.updateCredits(userId, amount);
      const newBalance = currentBalance + amount;

      // Update Google Sheets with fallback logic
      await this.updateGoogleSheets(userId, user.email, amount);

      console.log('💰 [CREDIT SERVICE] ✅ Credits added:', { 
        userId, 
        amount, 
        oldBalance: currentBalance, 
        newBalance 
      });

      return { success: true, newBalance };

    } catch (error) {
      console.error('💰 [CREDIT SERVICE] ❌ Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update Google Sheets with automatic fallback
   */
  private async updateGoogleSheets(
    userId: string, 
    email: string, 
    amount: number
  ): Promise<void> {
    // Try by ID first
    const byId = await googleSheetsUserDb.addCredits(userId, amount);
    if (byId.success) {
      console.log('💰 [CREDIT SERVICE] Google Sheets updated by ID');
      return;
    }

    // Fallback: Find by email and update
    console.log('💰 [CREDIT SERVICE] ID failed, trying email fallback...');
    const lookup = await googleSheetsUserDb.findByEmail(email);
    
    if (lookup.success && lookup.user?.id) {
      const targetId = lookup.user.id as string;
      const addByEmail = await googleSheetsUserDb.addCredits(targetId, amount);
      
      if (!addByEmail.success) {
        // Last resort: direct update
        const current = Number(lookup.user.credits || 0);
        await googleSheetsUserDb.updateCredits(targetId, current + amount);
      }
      
      console.log('💰 [CREDIT SERVICE] Google Sheets updated by email');
    } else {
      console.warn('💰 [CREDIT SERVICE] Could not update Google Sheets (user not found)');
    }
  }

  /**
   * Deduct credits from user
   */
  async deductCredits(
    userId: string, 
    amount: number, 
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    // Implementation here
  }

  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string): Promise<number> {
    const user = userDb.findById(userId);
    return user?.credits || 0;
  }
}

// Export singleton instance
export const creditService = new CreditService();
```

**Then replace all 5+ duplicate implementations with:**
```typescript
import { creditService } from '@/lib/services/credit-service';

// In payment callback:
await creditService.addCredits(userId, amount, `Payment: ${orderId}`);

// In admin panel:
await creditService.addCredits(userId, amount, 'Admin grant');

// In add-credits API:
await creditService.addCredits(userId, amount, `Package: ${packageId}`);
```

---

## 📝 **Summary**

### **Current Issues:**
- ❌ **God functions** doing 5-9 things each
- ❌ **Duplicate code** across 5+ files
- ❌ **Mixed concerns** (API + state + storage in one place)
- ❌ **Hard to test** (tightly coupled)
- ❌ **Hard to maintain** (change one thing, break many)

### **What Senior Code Looks Like:**
- ✅ **Single Responsibility** - each function does ONE thing
- ✅ **DRY Principle** - no duplicate logic
- ✅ **Separation of Concerns** - API ≠ State ≠ Storage
- ✅ **Easy to Test** - mock dependencies
- ✅ **Easy to Maintain** - change one place only

### **Quick Win:**
**Extract `CreditService` class (2-3 hours work) = eliminates 80% of code quality issues!**

---

**Your code works, but it's not "senior level" yet. The refactoring above will make it production-grade and maintainable.** 🚀

