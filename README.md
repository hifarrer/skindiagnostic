# AiMakeup - Beauty SAAS Platform

A cross-platform beauty application with AI-powered skin analysis and virtual makeup try-on features.

## Tech Stack

- **Frontend**: React Native with Expo (Web, iOS, Android)
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Image Storage**: Cloudinary
- **Payment**: Stripe
- **APIs**: Perfect Corp (skin analysis, makeup VTO, look VTO)

## Project Structure

```
AiMakeup/
├── mobile/          # React Native Expo app
├── backend/         # Node.js Express API
└── README.md
```

## Getting Started

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example` and fill in your credentials

4. Setup PostgreSQL database and update `DATABASE_URL` in `.env`

5. Run migrations:
```bash
npm run migrate
```

6. Start development server:
```bash
npm run dev
```

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

4. Start Expo for web:
```bash
npm run web
```

Or use the interactive menu:
```bash
npm start
# Then press 'w' for web
```

## Features

- **OAuth Authentication**: Google and Facebook login
- **AI Skin Analysis**: Upload photos for detailed skin condition analysis
- **Virtual Makeup Try-On**: Try on makeup with real-time preview
- **AI Look Try-On**: Apply complete makeup looks instantly
- **Subscription Management**: Stripe-powered subscription plans

## API Endpoints

See `backend/README.md` for detailed API documentation.

## Design

The app uses a pink, purple, and white color scheme perfect for a beauty platform.

## License

MIT

cd mobile
npx expo start --web