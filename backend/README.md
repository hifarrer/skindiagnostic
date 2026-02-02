# AiMakeup Backend

Beauty SAAS Platform Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example` and fill in your credentials

3. Setup PostgreSQL database and update `DATABASE_URL` in `.env`

4. Add Google Places API key:
   - Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Places API in your project
   - Add `GOOGLE_PLACES_API_KEY=your_api_key_here` to your `.env` file
   - Note: Google Places API requires billing to be enabled (free tier provides $200 credit/month)

5. Run migrations:
```bash
npm run migrate
```

6. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/oauth/google` - Google OAuth
- `POST /api/auth/oauth/facebook` - Facebook OAuth
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout (protected)

### Skin Analysis
- `POST /api/skin-analysis/upload` - Upload image for analysis (protected)
- `GET /api/skin-analysis/:taskId` - Get task status (protected)
- `GET /api/skin-analysis/history` - Get analysis history (protected)

### Makeup VTO
- `POST /api/makeup-vto/apply` - Apply makeup (protected)
- `GET /api/makeup-vto/:taskId` - Get task status (protected)

### Look VTO
- `POST /api/look-vto/apply` - Apply look (protected)
- `GET /api/look-vto/:taskId` - Get task status (protected)

### Plans
- `GET /api/plans` - Get all plans

### Subscriptions
- `POST /api/subscriptions/create` - Create subscription (protected)
- `GET /api/subscriptions/current` - Get current subscription (protected)

### Dermatologists
- `GET /api/dermatologists/search?zipcode=XXXXX` - Search for dermatologists by zipcode (public)