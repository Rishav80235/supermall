# Deployment Guide - Super Mall Web Application

This guide provides step-by-step instructions for deploying the Super Mall Web Application to Firebase Hosting.

## 🚀 Prerequisites

Before deploying, ensure you have:

1. **Node.js** (v14 or higher) installed
2. **Firebase CLI** installed globally
3. **Firebase project** created
4. **Git** installed (for version control)

## 📋 Pre-Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Authentication enabled in Firebase Console
- [ ] Firestore database created
- [ ] Storage bucket created
- [ ] Firebase configuration updated in `Frontend/index.html`
- [ ] Admin user created in Firestore
- [ ] All code committed to Git repository

## 🔧 Step-by-Step Deployment

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication.

### 3. Initialize Firebase Project

```bash
firebase init
```

Select the following services:
- **Hosting**: Configure files for Firebase Hosting
- **Firestore**: Configure security rules and indexes files
- **Storage**: Configure security rules
- **Functions**: (Optional) Configure a Cloud Functions directory

### 4. Configure Firebase Hosting

When prompted:
- **Public directory**: `Frontend`
- **Single-page app**: `Yes` (for SPA routing)
- **Overwrite index.html**: `No` (we already have one)

### 5. Update Firebase Configuration

Edit `Frontend/index.html` and update the Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### 6. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

### 7. Deploy the Application

```bash
# Deploy everything
firebase deploy

# Or deploy only hosting
firebase deploy --only hosting
```

### 8. Verify Deployment

1. Visit your Firebase Hosting URL
2. Test admin login functionality
3. Verify all features work correctly
4. Check mobile responsiveness

## 🔐 Security Configuration

### Firestore Security Rules

The application includes comprehensive security rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin users can read/write all documents
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Regular users can read public data
    match /shops/{shopId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    // ... more rules
  }
}
```

### Storage Security Rules

Storage rules in `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /product-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 👤 Admin User Setup

### 1. Create Admin User in Firebase Console

1. Go to Firebase Console > Authentication
2. Click "Add user"
3. Enter admin email and password
4. Note the User UID

### 2. Create User Document in Firestore

1. Go to Firebase Console > Firestore Database
2. Create a new collection called `users`
3. Create a document with the User UID as the document ID
4. Add the following fields:

```json
{
  "uid": "user-uid-from-step-1",
  "email": "admin@example.com",
  "displayName": "Admin User",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLoginAt": "2024-01-01T00:00:00.000Z"
}
```

## 🌐 Custom Domain Setup

### 1. Add Custom Domain in Firebase Console

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Enter your domain name
4. Follow the verification steps

### 2. Update DNS Records

Add the following DNS records to your domain:

```
Type: A
Name: @
Value: 151.101.1.195
TTL: 3600

Type: A
Name: @
Value: 151.101.65.195
TTL: 3600

Type: CNAME
Name: www
Value: your-project-id.web.app
TTL: 3600
```

## 📊 Performance Optimization

### 1. Enable Firebase Performance Monitoring

```bash
# Add to your HTML head
<script>
  import { getPerformance } from 'firebase/performance';
  const perf = getPerformance(app);
</script>
```

### 2. Configure Firestore Indexes

The application includes optimized indexes in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "categoryId", "order": "ASCENDING"},
        {"fieldPath": "price", "order": "ASCENDING"}
      ]
    }
  ]
}
```

### 3. Enable Compression

Firebase Hosting automatically enables gzip compression for text files.

## 🔄 Continuous Deployment

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - name: Install Firebase CLI
      run: npm install -g firebase-tools
    - name: Deploy to Firebase
      run: firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

### Environment Variables

Set up the following secrets in GitHub:
- `FIREBASE_TOKEN`: Firebase CI token

Generate token with:
```bash
firebase login:ci
```

## 🐛 Troubleshooting

### Common Deployment Issues

1. **Build Errors**
   ```bash
   # Check Firebase CLI version
   firebase --version
   
   # Update Firebase CLI
   npm install -g firebase-tools@latest
   ```

2. **Permission Errors**
   ```bash
   # Re-authenticate
   firebase logout
   firebase login
   ```

3. **Configuration Errors**
   - Verify Firebase config in `index.html`
   - Check project ID matches Firebase Console
   - Ensure all services are enabled

4. **Security Rule Errors**
   ```bash
   # Test rules locally
   firebase emulators:start --only firestore
   
   # Deploy rules separately
   firebase deploy --only firestore:rules
   ```

### Debug Mode

Enable debug mode by adding `?debug=true` to your URL to see detailed error messages.

## 📈 Monitoring and Analytics

### 1. Firebase Analytics

Add to your HTML:

```html
<script>
  import { getAnalytics } from 'firebase/analytics';
  const analytics = getAnalytics(app);
</script>
```

### 2. Error Monitoring

The application includes comprehensive error logging to Firestore for debugging.

### 3. Performance Monitoring

Monitor Core Web Vitals and performance metrics in Firebase Console.

## 🔄 Rollback Strategy

### Quick Rollback

```bash
# List previous deployments
firebase hosting:releases

# Rollback to previous version
firebase hosting:rollback
```

### Database Rollback

For Firestore changes, use the Firebase Console to restore from backups.

## 📞 Support

For deployment issues:
1. Check Firebase Console for error logs
2. Review Firebase documentation
3. Check GitHub issues
4. Contact support team

---

**Deployment completed successfully!** 🎉

Your Super Mall Web Application is now live and ready for users.
