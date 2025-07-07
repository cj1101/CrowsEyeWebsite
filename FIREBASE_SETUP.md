# Firebase Environment Variable Setup

This document outlines the necessary environment variables to run the Crow's Eye Website application, separating them into client-side (public) and server-side (private) variables.

---

## 1. Client-Side (Public) Variables

These variables are used by the Next.js frontend and are safe to be exposed to the browser. They should be prefixed with `NEXT_PUBLIC_`.

Create a `.env.local` file in the root of the project and add the following variables:

```env
# Your project's Firebase configuration details
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Base URL for OAuth redirects (e.g., http://localhost:3000 for local development)
NEXT_PUBLIC_OAUTH_REDIRECT_BASE_URL=

# Set to "true" to use local Firebase emulators
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

---

## 2. Server-Side (Private) Variable

This variable is used by the Firebase Admin SDK on the server and is highly sensitive. **It must never be exposed to the client.**

This credential is required for backend operations like creating custom tokens, managing users, or interacting with Google Cloud services.

Add this variable to your `.env.local` file:

```env
# Firebase Admin SDK Credentials
# Paste the entire content of your service account JSON file here.
# See "How to get your credentials" below.

FIREBASE_PRIVATE_KEY=
```

### How to get your credentials:

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  Go to **Project settings** (click the gear icon ⚙️).
4.  Navigate to the **Service accounts** tab.
5.  Click the **"Generate new private key"** button. A JSON file will be downloaded.
6.  Open the JSON file and copy its entire content.
7.  Paste the full JSON content as the value for `FIREBASE_PRIVATE_KEY`.

**Important:** The value of this variable should be the complete JSON object, as a single line.
