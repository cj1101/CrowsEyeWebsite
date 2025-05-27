# 🌐 Custom Domain Setup Guide: crowseye.tech → Firebase Hosting

## 🎯 Current Situation

- **Domain**: `crowseye.tech`
- **Current DNS**: Managed by Vercel (`ns1.vercel-dns.com`)
- **Current A Records**: `66.33.60.193`, `66.33.60.129` (old Vercel IPs)
- **Target**: Firebase Hosting (`crows-eye-website.web.app`)

## 🔧 DNS Records Required by Firebase

Based on your Firebase Hosting setup, you need these DNS records:

### **Records to ADD:**
```
Type: A
Name: @ (root domain)
Value: 199.36.158.100

Type: TXT  
Name: @ (root domain)
Value: hosting-site=crows-eye-website
```

### **Records to REMOVE:**
```
Type: A
Name: @ 
Value: 66.33.60.130 ❌

Type: A
Name: @
Value: 66.33.60.34 ❌
```

## 🚀 Step-by-Step Setup

### **Option 1: Update DNS in Vercel Dashboard (Recommended)**

Since your domain uses Vercel's nameservers, update DNS records there:

1. **Login to Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Navigate to **Domains** section

2. **Find crowseye.tech domain**
   - Click on `crowseye.tech` in your domains list

3. **Update DNS Records**
   - **Remove existing A records**:
     - Delete A record pointing to `66.33.60.130`
     - Delete A record pointing to `66.33.60.34`
   
   - **Add new A record**:
     - Type: `A`
     - Name: `@` (or leave blank for root domain)
     - Value: `199.36.158.100`
     - TTL: `Auto` or `3600`

   - **Add TXT record for verification**:
     - Type: `TXT`
     - Name: `@` (or leave blank)
     - Value: `hosting-site=crows-eye-website`
     - TTL: `Auto` or `3600`

4. **Save Changes**
   - Click **Save** or **Update** for each record

### **Option 2: Transfer DNS to Domain Registrar**

If you prefer to manage DNS directly:

1. **Change Nameservers**
   - Login to your domain registrar (where you bought crowseye.tech)
   - Change nameservers from Vercel's to your registrar's default
   - Remove: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`

2. **Wait for Propagation**
   - DNS changes take 24-48 hours to fully propagate

3. **Add DNS Records at Registrar**
   - Add the same A and TXT records listed above

## 🔍 Verification Steps

### **1. Check DNS Propagation**
```bash
# Check A record
nslookup crowseye.tech

# Check TXT record  
nslookup -type=TXT crowseye.tech

# Online tools
# https://dnschecker.org/
# https://whatsmydns.net/
```

### **2. Expected Results After Setup**
```bash
# A record should show:
crowseye.tech → 199.36.158.100

# TXT record should show:
crowseye.tech → "hosting-site=crows-eye-website"
```

### **3. Firebase Verification**
1. Go to [Firebase Console](https://console.firebase.google.com/project/crows-eye-website/hosting/main)
2. Navigate to **Hosting** → **Custom domains**
3. Click **Verify** next to crowseye.tech
4. Should show ✅ **Verified** status

## ⏱️ Timeline Expectations

- **DNS Record Updates**: 5-15 minutes
- **DNS Propagation**: 1-24 hours (usually within 1 hour)
- **SSL Certificate**: 24-48 hours after verification
- **Full Activation**: 24-48 hours total

## 🛠️ Troubleshooting

### **Issue: "Records not found" in Firebase**
**Solution**: DNS hasn't propagated yet
- Wait 1-2 hours and try verification again
- Check DNS propagation with online tools

### **Issue: "Wrong IP address detected"**
**Solution**: Old records still cached
- Clear DNS cache: `ipconfig /flushdns` (Windows)
- Wait for global DNS propagation
- Check from different locations using dnschecker.org

### **Issue: "TXT record not found"**
**Solution**: TXT record missing or incorrect
- Verify exact TXT value: `hosting-site=crows-eye-website`
- No quotes needed in most DNS providers
- Check TXT record propagation

### **Issue: SSL Certificate not issued**
**Solution**: Domain not fully verified
- Ensure both A and TXT records are correct
- Wait 24-48 hours for automatic SSL provisioning
- Check Firebase Console for certificate status

## 📋 Quick Checklist

- [ ] Remove old A records (`66.33.60.130`, `66.33.60.34`)
- [ ] Add new A record (`199.36.158.100`)
- [ ] Add TXT record (`hosting-site=crows-eye-website`)
- [ ] Wait for DNS propagation (1-24 hours)
- [ ] Verify domain in Firebase Console
- [ ] Wait for SSL certificate (24-48 hours)
- [ ] Test website at `https://crowseye.tech`

## 🔗 Useful Links

- [Firebase Console - Hosting](https://console.firebase.google.com/project/crows-eye-website/hosting/main)
- [Vercel Dashboard - Domains](https://vercel.com/dashboard)
- [DNS Checker Tool](https://dnschecker.org/)
- [What's My DNS](https://whatsmydns.net/)

## 📞 Next Steps

1. **Update DNS records** using Option 1 (Vercel) or Option 2 (Registrar)
2. **Wait for propagation** (check with `nslookup crowseye.tech`)
3. **Verify in Firebase Console** once DNS shows correct records
4. **Monitor SSL certificate** provisioning (24-48 hours)
5. **Test final website** at `https://crowseye.tech`

---

**Note**: The specific IP addresses and TXT values shown are based on your Firebase Hosting configuration. Always use the exact values shown in your Firebase Console for the most accurate setup. 