# 🎯 TESTER PROMOTIONAL CODE SYSTEM - IMPLEMENTATION GUIDE

## 🔐 **Secret Tester Code**
```
TESTER_CROW_2024_LIFETIME_$7d91f3a8
```

**⚠️ IMPORTANT: Keep this code secure! Only share with trusted testers.**

---

## 🚀 **What's Been Implemented (Frontend)**

### ✅ **1. Pricing Page Updates**
- Added the secure tester promotional code to the validation system
- Creates special "lifetime_pro" tier for the secret code
- Stores promo information in localStorage for signup process
- Shows special success message: "🎉 LIFETIME ACCESS GRANTED! You now have Pro plan features for life."

### ✅ **2. Signup Page Enhancements**
- Detects when a promotional code has been applied
- Shows special banner for lifetime access: "🎉 LIFETIME PRO ACCESS ACTIVATED!"
- Enhanced success messages based on promo tier
- Automatically clears promo codes after successful signup

### ✅ **3. Authentication Context Updates**
- Reads promo codes during signup process
- Maps promo tiers to subscription levels:
  - `lifetime_pro` → Pro plan features
  - Other promo codes → Creator plan features
- Sends subscription tier to backend during registration

### ✅ **4. API Service Integration**
- Updated registration payload to include:
  - `subscriptionTier`: The user's plan level
  - `metadata.promo_applied`: Boolean if promo was used
  - `metadata.original_promo_code`: The code that was entered
  - `metadata.promo_tier`: The tier granted (lifetime_pro, etc.)

---

## 🛠 **Backend Implementation Required**

### **1. Update User Registration Endpoint**

Your backend needs to handle the new registration payload:

```javascript
// Example registration payload from frontend
{
  email: "tester@example.com",
  password: "securePassword123",
  displayName: "Test User",
  subscriptionTier: "pro",  // ← NEW
  metadata: {               // ← NEW
    promo_applied: true,
    original_promo_code: "LIFETIME_TESTER",
    promo_tier: "lifetime_pro"
  }
}
```

### **2. Database Schema Updates**

Add these fields to your user table:

```sql
-- Add subscription fields
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN subscription_expires TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN promo_code_used VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN is_lifetime_user BOOLEAN DEFAULT FALSE;

-- Index for performance
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_lifetime ON users(is_lifetime_user);
```

### **3. Registration Logic Updates**

```python
# Example Python/Django implementation
def register_user(request_data):
    subscription_tier = request_data.get('subscriptionTier', 'free')
    metadata = request_data.get('metadata', {})
    
    # Handle lifetime promo code
    is_lifetime = False
    subscription_expires = None
    
    if metadata.get('promo_tier') == 'lifetime_pro':
        is_lifetime = True
        subscription_tier = 'pro'
        # No expiration for lifetime users
    elif subscription_tier != 'free':
        # Set trial period for other promo codes
        subscription_expires = datetime.now() + timedelta(days=7)
    
    user = User.objects.create(
        email=request_data['email'],
        name=request_data['displayName'],
        subscription_tier=subscription_tier,
        subscription_status='active',
        subscription_expires=subscription_expires,
        promo_code_used=metadata.get('original_promo_code'),
        is_lifetime_user=is_lifetime
    )
    
    return user
```

### **4. Access Control Logic**

```python
# Example access control check
def check_user_access(user, feature):
    # Lifetime users always have Pro access
    if user.is_lifetime_user:
        return check_pro_plan_access(feature)
    
    # Check if subscription is expired
    if user.subscription_expires and user.subscription_expires < datetime.now():
        return check_free_plan_access(feature)
    
    # Regular subscription check
    if user.subscription_tier == 'pro':
        return check_pro_plan_access(feature)
    elif user.subscription_tier == 'creator':
        return check_creator_plan_access(feature)
    else:
        return check_free_plan_access(feature)
```

### **5. API Response Updates**

Make sure your user API responses include the subscription information:

```javascript
// Example user object returned from /api/v1/auth/me
{
  id: "user123",
  email: "tester@example.com",
  name: "Test User",
  subscription_tier: "pro",
  subscription_status: "active",
  subscription_expires: null, // null for lifetime users
  is_lifetime_user: true,
  usage_limits: {
    linked_accounts: 10,        // Pro plan limits
    max_linked_accounts: 10,
    ai_credits: 750,
    max_ai_credits: 750,
    // ... other pro plan limits
  },
  plan_features: {
    // All Pro plan features enabled
    basic_content_tools: true,
    advanced_content: true,
    analytics: "advanced",
    team_collaboration: true,
    custom_branding: true,
    api_access: true,
    priority_support: true
  }
}
```

---

## 🔒 **Security Considerations**

### **1. Code Validation**
- The tester code is deliberately complex and non-obvious
- Consider adding rate limiting to promo code attempts
- Log all promo code usage for monitoring

### **2. Lifetime User Management**
```python
# Add admin endpoints to manage lifetime users
def admin_revoke_lifetime_access(user_id):
    user = User.objects.get(id=user_id)
    user.is_lifetime_user = False
    user.subscription_tier = 'free'
    user.save()

def admin_grant_lifetime_access(user_id):
    user = User.objects.get(id=user_id)
    user.is_lifetime_user = True
    user.subscription_tier = 'pro'
    user.subscription_expires = None
    user.save()
```

### **3. Monitoring and Analytics**
```python
# Track promo code usage
def log_promo_usage(user_id, promo_code, promo_tier):
    PromoCodeUsage.objects.create(
        user_id=user_id,
        code=promo_code,
        tier_granted=promo_tier,
        used_at=datetime.now()
    )
```

---

## 🎯 **How Testers Will Use It**

1. **Tester visits** `/pricing`
2. **Clicks** "Start 7-Day Free Trial" on Pro plan
3. **Enters the secret code**: `TESTER_CROW_2024_LIFETIME_$7d91f3a8`
4. **Sees confirmation**: "🎉 LIFETIME ACCESS GRANTED!"
5. **Clicks** Pro plan button → redirected to signup
6. **Signs up** with special banner showing lifetime access
7. **Gets Pro plan features permanently** with no expiration

---

## ✨ **Features for Lifetime Users**

Lifetime users get **full Pro plan access** including:
- ✅ 10 linked social accounts
- ✅ 750+ AI credits per month
- ✅ Unlimited scheduled posts
- ✅ 50GB storage
- ✅ Full video suite + AI
- ✅ Advanced analytics + custom reports
- ✅ Team collaboration (up to 3 members)
- ✅ Full custom branding
- ✅ API access
- ✅ Priority support

---

## 🚧 **Next Steps for You**

1. **Update your backend** registration endpoint to handle the new fields
2. **Add database columns** for subscription management
3. **Implement access control** logic for lifetime users
4. **Test the flow** end-to-end
5. **Share the secret code** only with trusted testers
6. **Monitor usage** through your admin panel

---

## 💡 **Testing the Implementation**

1. Go to `/pricing`
2. Enter: `TESTER_CROW_2024_LIFETIME_$7d91f3a8`
3. Click "Apply" → Should see "LIFETIME ACCESS GRANTED!"
4. Click "Start 7-Day Free Trial" on Pro plan
5. Complete signup → Should see lifetime access confirmation
6. Check user in database → Should have `is_lifetime_user: true`

The promotional code system is now fully implemented on the frontend and ready for your backend integration! 🎉 