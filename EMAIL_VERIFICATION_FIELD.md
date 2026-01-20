# Email Verification Field Documentation

## Answer: `emailVerified`

The field that checks if an email is verified is: **`emailVerified`**

---

## Field Details

### Field Name: `emailVerified`

**Type:** `boolean` (optional)

**Location:** User document in Firestore `users` collection

**Possible Values:**
- `true` - Email is verified ✅
- `false` - Email is NOT verified ❌
- `undefined` - Field not set (treated as not verified)

---

## Type Definition

**File:** `src/shared/types/common.ts` (Line 60)

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  emailVerified?: boolean;  // ← This field
  createdAt?: string;
  lastLogin?: string;
  organizationId?: string;
  organizationName?: string;
  photoURL?: string;
}
```

---

## When It's Set

### 1. On Signup (Set to `false`)

**File:** `src/features/auth-by-email/api/authApi.ts` (Line 111)

```typescript
const userData = {
  username: `${credentials.firstName} ${credentials.lastName}`,
  email: credentials.email,
  role: 'admin',
  permissions: [...],
  isActive: true,
  emailVerified: false,  // ← Initially false
  createdAt: new Date().toISOString(),
  organizationId: credentials.organizationId,
};

await setDoc(doc(db, 'users', userId), userData);
```

**When:** User signs up for the first time

**Value:** `false`

### 2. On Email Verification (Set to `true`)

**File:** `src/features/auth-by-email/api/authApi.ts` (Line 248)

```typescript
async verifyEmailCode(code: string): Promise<void> {
  try {
    await applyActionCode(auth, code);
    
    // Update Firestore user document
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        emailVerified: true  // ← Set to true after verification
      });
    }
  } catch (error: unknown) {
    console.error('Error verifying email code:', error);
    throw error;
  }
}
```

**When:** User clicks verification link in email

**Value:** `true`

---

## Where It's Checked

### 1. Login Check

**File:** `src/features/auth-by-email/api/authApi.ts` (Line 30)

```typescript
async checkEmailVerification(email: string): Promise<{ exists: boolean; verified: boolean }> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { exists: false, verified: false };
    }
    
    const userData = querySnapshot.docs[0].data();
    return { 
      exists: true, 
      verified: userData.emailVerified === true  // ← Check here
    };
  } catch (error: unknown) {
    console.error('Error checking email verification:', error);
    return { exists: false, verified: false };
  }
}
```

### 2. Login Hook

**File:** `src/features/auth-by-email/hooks/useAdminLogin.ts` (Line 36)

```typescript
const checkEmailVerification = useCallback(async () => {
  // ...
  const result = await authApi.checkEmailVerification(email);
  
  if (!result.exists) {
    setEmailVerified(true);
  } else if (!result.verified) {
    setEmailVerificationError('This email is not verified yet. Please verify your email before logging in.');
    setEmailVerified(false);  // ← Block login
  } else {
    setEmailVerified(true);
  }
}, [email]);
```

### 3. Auth Provider

**File:** `src/shared/lib/auth-provider.tsx` (Line 135)

```typescript
// Only establish session if email is verified
if (userData.emailVerified !== false) {
  setUserRole(userData.role)
  setCurrentAdminSession({
    user: userData,
    loginTime: new Date().toISOString(),
    permissions: userData.permissions || []
  })
}
```

### 4. Login Page

**File:** `app/login/page.tsx` (Line 23)

```typescript
if (adminSession && adminSession.user.emailVerified === false) {
  showToast('Please verify your email before logging in', 'error', 4000)
  router.push(`/auth/verify-email?email=${encodeURIComponent(adminSession.user.email)}`)
  return
}
```

### 5. Admin Page

**File:** `app/admin/page.tsx` (Line 14, 33)

```typescript
// Check email verification
useEffect(() => {
  if (currentAdminSession && currentAdminSession.user.emailVerified === false) {
    router.push(`/auth/verify-email?email=${encodeURIComponent(currentAdminSession.user.email)}`)
  }
}, [currentAdminSession, router])

// Don't render if email not verified
if (currentAdminSession.user.emailVerified === false) {
  return null
}
```

---

## Verification Flow

### Complete Process:

```
1. User signs up
   ↓
   emailVerified = false
   ↓
2. Verification email sent
   ↓
3. User clicks link in email
   ↓
4. verifyEmailCode() called
   ↓
   emailVerified = true
   ↓
5. User can now log in
```

---

## Database Structure

### Firestore Document Path:
```
users/{userId}
```

### Document Structure:
```javascript
{
  id: "user_123",
  username: "John Smith",
  email: "john@example.com",
  role: "admin",
  permissions: [...],
  isActive: true,
  emailVerified: false,  // ← This field
  createdAt: "2024-01-20T10:30:00.000Z",
  organizationId: "org_456"
}
```

---

## Checking Email Verification Status

### Method 1: Direct Firestore Query

```typescript
const userDoc = await getDoc(doc(db, 'users', userId));
const isVerified = userDoc.data()?.emailVerified === true;
```

### Method 2: Using API Method

```typescript
const result = await authApi.checkEmailVerification(email);
if (result.verified) {
  // Email is verified
} else {
  // Email is not verified
}
```

### Method 3: From Session

```typescript
if (currentAdminSession?.user.emailVerified === true) {
  // Email is verified
}
```

---

## Security Implications

### Why This Field Matters:

1. **Prevents Fake Signups:**
   - Ensures user owns the email address
   - Reduces spam accounts

2. **Account Security:**
   - Confirms user can receive important notifications
   - Enables password reset functionality

3. **Access Control:**
   - Blocks unverified users from accessing admin features
   - Protects sensitive organization data

---

## Common Issues

### Issue 1: User Can't Login
**Cause:** `emailVerified` is `false`

**Solution:** 
- Resend verification email
- Check spam folder
- Manually set to `true` in Firestore (for testing only)

### Issue 2: Field is `undefined`
**Cause:** Old user documents created before field was added

**Solution:**
```typescript
// Treat undefined as false
const isVerified = userData.emailVerified === true;
```

### Issue 3: Verification Email Not Received
**Cause:** Email service issues or spam filters

**Solution:**
- Check Firebase Auth email templates
- Verify email service is configured
- Check spam/junk folder

---

## Testing

### Test Scenarios:

1. **New User Signup:**
   - Create account
   - Check Firestore: `emailVerified` should be `false`
   - Try to login: Should be blocked

2. **Email Verification:**
   - Click verification link
   - Check Firestore: `emailVerified` should be `true`
   - Try to login: Should succeed

3. **Unverified Login Attempt:**
   - Create account but don't verify
   - Try to login
   - Should see: "Please verify your email before logging in"

---

## Manual Override (Testing Only)

### Set Email as Verified in Firestore:

```javascript
// In Firebase Console or using Admin SDK
await db.collection('users').doc(userId).update({
  emailVerified: true
});
```

**⚠️ Warning:** Only use for testing! In production, users should verify via email.

---

## Related Files

| File | Purpose |
|------|---------|
| `src/shared/types/common.ts` | Type definition |
| `src/features/auth-by-email/api/authApi.ts` | Set/check verification |
| `src/features/auth-by-email/hooks/useAdminLogin.ts` | Login verification check |
| `src/shared/lib/auth-provider.tsx` | Session establishment |
| `app/login/page.tsx` | Login page check |
| `app/admin/page.tsx` | Admin page protection |

---

## Summary

**Field Name:** `emailVerified`

**Type:** `boolean` (optional)

**Default Value:** `false` (on signup)

**Set to `true`:** When user clicks verification link

**Checked:** 
- During login
- When establishing session
- On admin page access
- In auth provider

**Purpose:** Ensure users own their email address before accessing the platform
