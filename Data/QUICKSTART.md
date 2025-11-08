# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password provider
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Choose a location (e.g., us-central1)
   - Set security rules (temporarily allow read/write for testing):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
5. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll down to "Your apps"
   - Click on web icon (</>)
   - Copy the config object

### 3. Update Firebase Config

Edit `src/firebase/config.js` and replace with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Create Admin Account

Option 1: Through the app
1. Run `npm run dev`
2. Go to http://localhost:3000/login
3. Click "Sign Up"
4. Create account with:
   - Email: `datascience1424@gmail.com`
   - Password: `Science@1424`

Option 2: Through Firebase Console
1. Go to Authentication → Users
2. Click "Add user"
3. Email: `datascience1424@gmail.com`
4. Password: `Science@1424`

### 5. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## First Steps After Setup

1. **Login as Admin**:
   - Go to http://localhost:3000/admin/login
   - Use credentials: `datascience1424@gmail.com` / `Science@1424`

2. **Add Sample Topics**:
   - Go to Admin Panel → Lectures
   - Click "Add New Topic"
   - Add topics like:
     - Statistics
     - Machine Learning
     - Deep Learning
     - Generative AI
   - Add YouTube/Vimeo video URLs for each topic

3. **Add Sample Projects**:
   - Go to Admin Panel → Projects
   - Click "Add New Project"
   - Add projects with different difficulty levels

4. **Test as Student**:
   - Create a student account from the login page
   - Explore all features:
     - Dashboard
     - Topics
     - Video Lectures
     - Simulators
     - Project Lab
     - Certificates
     - Leaderboard
     - AI Mentor

## Troubleshooting

### Firebase Authentication Errors
- Make sure Email/Password authentication is enabled
- Check that your Firebase config is correct
- Verify Firestore rules allow authenticated users

### Video Not Playing
- Check that video URLs are valid YouTube or Vimeo links
- Ensure react-player is installed: `npm install react-player`

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v16+)

### Port Already in Use
- Change port in `vite.config.js`:
  ```javascript
  server: {
    port: 3001,
  }
  ```

## Next Steps

1. Customize the theme colors in `tailwind.config.js`
2. Add more sample data through admin panel
3. Integrate real AI API (Gemini) for AI Mentor
4. Set up proper Firestore security rules
5. Deploy to production

## Support

For issues or questions, check the main README.md file or open an issue in the repository.
