# Database Connection Troubleshooting

If you're getting `ECONNREFUSED` or other connection errors, follow these steps:

## Step 1: Test Your Database Connection

Run the connection test script:

```bash
cd backend
npm run test-db
```

This will show you:
- If DATABASE_URL is set
- Connection details (host, port, database name)
- Specific error messages
- Troubleshooting tips

## Step 2: Verify Your DATABASE_URL Format

Your `DATABASE_URL` in `backend/.env` should be in this format:

```
postgresql://username:password@host:port/database
```

### Examples:

**Local PostgreSQL:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/aimakeup
```

**External/Cloud Database (Heroku, AWS RDS, etc.):**
```
DATABASE_URL=postgresql://user:pass@host.example.com:5432/dbname
```

**With SSL (most external databases require this):**
```
DATABASE_URL=postgresql://user:pass@host.example.com:5432/dbname?sslmode=require
```

## Step 3: Common Issues and Solutions

### Issue: ECONNREFUSED

**Possible causes:**
1. Database host is incorrect
2. Database port is wrong (default is 5432)
3. Database server is not running
4. Firewall blocking the connection
5. IP address not whitelisted (for cloud databases)

**Solutions:**
- Verify the host and port in your DATABASE_URL
- For cloud databases, check your IP whitelist settings
- Try connecting with a PostgreSQL client (pgAdmin, DBeaver) to verify credentials
- Check if the database service is running

### Issue: SSL Required

**For external databases (AWS RDS, Heroku, DigitalOcean, etc.):**

Add to your `backend/.env`:
```
DATABASE_SSL=true
```

Or include SSL in your connection string:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
```

### Issue: Authentication Failed

**Check:**
- Username is correct
- Password is correct (no extra spaces)
- User has permissions to access the database

### Issue: Database Does Not Exist

**Create the database:**
```sql
CREATE DATABASE aimakeup;
```

Or update your DATABASE_URL to point to an existing database.

## Step 4: Enable SSL for External Databases

If you're using an external database, add this to `backend/.env`:

```
DATABASE_SSL=true
```

The code will automatically detect common external database hosts, but you can force SSL with this variable.

## Step 5: Verify Environment File Location

Make sure your `.env` file is in the `backend/` directory:

```
backend/
  ├── .env          ← Should be here
  ├── .env.example
  ├── package.json
  └── src/
```

## Step 6: Test Connection Manually

You can test your connection string with `psql`:

```bash
# For local
psql postgresql://user:pass@localhost:5432/dbname

# For external
psql "postgresql://user:pass@host.example.com:5432/dbname?sslmode=require"
```

## Step 7: Check Database Provider Settings

### For AWS RDS:
- Check Security Groups allow your IP
- Verify VPC settings
- Check if database is publicly accessible (if needed)

### For Heroku:
- Heroku provides DATABASE_URL automatically
- Make sure you're using the correct addon

### For DigitalOcean:
- Check firewall rules
- Verify trusted sources include your IP

### For Other Cloud Providers:
- Check IP whitelist/allowlist
- Verify SSL requirements
- Check connection limits

## Quick Fixes

### Force SSL:
```bash
# Add to backend/.env
DATABASE_SSL=true
```

### Test connection:
```bash
cd backend
npm run test-db
```

### Run migrations after fixing connection:
```bash
cd backend
npm run migrate
```

## Still Having Issues?

1. Run `npm run test-db` and share the error message
2. Verify your DATABASE_URL format
3. Check if you can connect with a PostgreSQL client
4. Verify firewall/network settings
5. Contact your database provider's support
