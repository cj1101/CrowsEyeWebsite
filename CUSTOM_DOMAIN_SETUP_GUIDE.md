# Custom Domain Setup for Crow's Eye Website

## Current Configuration
- **Domain**: `crowseyewebsite.com`
- **Hosting**: Firebase Hosting
- **Current DNS**: Needs to be updated for Firebase

## Firebase Hosting Domain Setup

### **Step 1: Add Custom Domain in Firebase Console**

1. **Go to Firebase Console**
   - Navigate to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `crows-eye-website`

2. **Add Custom Domain**
   - Go to **Hosting** section
   - Click **Add custom domain**
   - Enter: `crowseyewebsite.com`
   - Follow the verification steps

### **Step 2: Update DNS Records**

Firebase will provide you with specific DNS records to add. Typically:

#### **A Records** (for root domain)
```
Type: A
Name: @
Value: [Firebase IP addresses provided]
TTL: 3600
```

#### **CNAME Record** (for www subdomain)
```
Type: CNAME
Name: www
Value: [Firebase hosting URL provided]
TTL: 3600
```

### **Step 3: Configure DNS at Your Registrar**

1. **Login to your domain registrar**
2. **Go to DNS management**
3. **Update nameservers** (if currently using third-party DNS)
4. **Add the DNS records** provided by Firebase

### **Step 4: SSL Certificate**

Firebase automatically provisions SSL certificates for custom domains. This may take up to 24 hours to complete.

## Verification

After DNS propagation (24-48 hours):

1. **Check domain status** in Firebase Console
2. **Test the website**: `https://crowseyewebsite.com`
3. **Verify SSL**: Ensure HTTPS is working

## Troubleshooting

### Common Issues

1. **DNS Propagation Delay**
   - Wait 24-48 hours for full propagation
   - Use [DNS Checker](https://dnschecker.org/) to verify

2. **SSL Certificate Issues**
   - Firebase handles SSL automatically
   - May take up to 24 hours to provision

3. **Domain Verification Failed**
   - Double-check DNS records match Firebase requirements
   - Ensure no conflicting records exist

## Resources

- [Firebase Hosting Custom Domain Guide](https://firebase.google.com/docs/hosting/custom-domain)
- [DNS Checker Tool](https://dnschecker.org/)
- [Firebase Console](https://console.firebase.google.com/)

## Quick Checklist

### Before Starting
- [ ] Firebase project is set up and deployed
- [ ] Domain registrar access available
- [ ] DNS management access confirmed

### Setup Process
- [ ] Add custom domain in Firebase Console
- [ ] Get DNS records from Firebase
- [ ] Update DNS records at registrar
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Verify domain in Firebase Console
- [ ] Test HTTPS functionality

### Post-Setup
- [ ] SSL certificate is active
- [ ] Website loads correctly on custom domain
- [ ] All redirects work properly
- [ ] Firebase Analytics updated (if used) 