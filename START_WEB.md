# Starting the Project on Web

This guide will walk you through starting both the backend API and the web frontend.

## Prerequisites

Before starting, make sure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ PostgreSQL database running
- ✅ Environment variables configured (see `ENV_SETUP.md`)
- ✅ Database migrations run

## Step-by-Step Instructions

### Step 1: Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Mobile/Web Dependencies
```bash
cd mobile
npm install
```

### Step 2: Setup Database

Make sure PostgreSQL is running and create the database:

```bash
# Connect to PostgreSQL (adjust as needed)
psql -U postgres

# Create database
CREATE DATABASE aimakeup;

# Exit psql
\q
```

Then run migrations:
```bash
cd backend
npm run migrate
```

This will create all necessary tables (users, plans, tasks, etc.).

### Step 3: Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 3000
Environment: development
Connected to PostgreSQL database
```

The backend API will be available at: `http://localhost:3000`

You can test it by visiting: `http://localhost:3000/health`

### Step 4: Start the Web App

Open a **new terminal** (keep the backend running) and run:

```bash
cd mobile
npm run web
```

Or alternatively:
```bash
npm start
# Then press 'w' to open web
```

This will:
1. Start the Expo development server
2. Open your default browser automatically
3. The app will be available at: `http://localhost:8081` (or the port shown)

### Step 5: Access the Application

- **Web App**: `http://localhost:8081` (or the port shown in terminal)
- **Backend API**: `http://localhost:3000`
- **API Health Check**: `http://localhost:3000/health`

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change PORT in backend/.env to a different port (e.g., 3001)
PORT=3001
```

**Database connection error:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `backend/.env`
- Ensure database exists: `CREATE DATABASE aimakeup;`

**Migration errors:**
```bash
# Drop and recreate database if needed
DROP DATABASE aimakeup;
CREATE DATABASE aimakeup;
npm run migrate
```

### Web App Issues

**Port already in use:**
- Expo will automatically use the next available port
- Check the terminal output for the actual URL

**Module not found errors:**
```bash
cd mobile
rm -rf node_modules
npm install
```

**Expo web not working:**
```bash
# Install web dependencies
npx expo install react-dom react-native-web @expo/metro-runtime
```

**CORS errors:**
- Make sure `FRONTEND_URL` in `backend/.env` matches your web app URL
- Default should be: `FRONTEND_URL=http://localhost:8081`

### Environment Variables

**Backend can't find variables:**
- Ensure `backend/.env` exists (copy from `backend/.env.example`)
- Restart the backend server after changing `.env`

**Web app can't connect to API:**
- Check `EXPO_PUBLIC_API_URL` in `mobile/.env`
- Should be: `EXPO_PUBLIC_API_URL=http://localhost:3000/api`
- Restart Expo after changing `.env`

## Quick Start Commands

### Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

### Terminal 2 (Web App):
```bash
cd mobile
npm run web
```

## Development Tips

1. **Hot Reload**: Both backend and frontend support hot reload
   - Backend: Changes auto-restart (with nodemon)
   - Frontend: Changes auto-refresh in browser

2. **API Testing**: Use the health endpoint to verify backend is running:
   ```bash
   curl http://localhost:3000/health
   ```

3. **Browser DevTools**: Open browser DevTools (F12) to see:
   - Console logs
   - Network requests
   - React component tree

4. **Backend Logs**: Check the backend terminal for:
   - API requests
   - Database queries
   - Error messages

## Production Build (Optional)

### Build Web App for Production:
```bash
cd mobile
npx expo export:web
```

This creates a production build in `mobile/web-build/` that can be deployed to any static hosting.

### Build Backend for Production:
```bash
cd backend
NODE_ENV=production npm start
```

## Next Steps

Once both servers are running:
1. Open the web app in your browser
2. Try logging in with Google or Facebook
3. Test the skin analysis feature
4. Try the makeup try-on features

For more information, see:
- `ENV_SETUP.md` - Environment variables setup
- `README.md` - Project overview
- `backend/README.md` - API documentation
