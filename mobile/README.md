# AiMakeup Mobile App

React Native Expo app for web, iOS, and Android

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

3. Start development server:
```bash
npm start
```

## Features

- OAuth authentication (Google, Facebook)
- AI Skin Analysis
- Virtual Makeup Try-On
- AI Look Try-On
- Subscription management

cd mobile
npx expo start --web