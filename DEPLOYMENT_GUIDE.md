# Deployment Guide for Lead Generation Application

This guide provides step-by-step instructions for deploying both the frontend and backend components of the Lead Generation application.

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git
- Accounts on deployment platforms (Vercel/Netlify for frontend, Render/Heroku for backend)

## Environment Setup

The application uses environment variables for configuration. Production environment files have been created:

- `.env.production` - Frontend production environment variables
- `backend/.env.production` - Backend production environment variables

Review these files and update any values as needed before deployment.

## Backend Deployment

### Option 1: Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: lead-generation-backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node src/index.js`
   - **Environment Variables**: Copy from `backend/.env.production`

### Option 2: Deploy to Heroku

1. Create a new Heroku app
2. Add the Heroku remote to your Git repository:
   ```
   heroku git:remote -a your-app-name
   ```
3. Deploy the backend subdirectory:
   ```
   git subtree push --prefix backend heroku master
   ```
4. Set environment variables:
   ```
   heroku config:set NODE_ENV=production
   heroku config:set GOOGLE_PLACES_API_KEY=your_api_key
   # Add all other variables from backend/.env.production
   ```

## Frontend Deployment

### Option 1: Deploy to Vercel

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```
2. Build the frontend:
   ```
   npm run build
   ```
3. Deploy to Vercel:
   ```
   vercel --prod
   ```
4. Configure environment variables in the Vercel dashboard

### Option 2: Deploy to Netlify

1. Install Netlify CLI:
   ```
   npm install -g netlify-cli
   ```
2. Build the frontend:
   ```
   npm run build
   ```
3. Deploy to Netlify:
   ```
   netlify deploy --prod
   ```
4. When prompted, specify `dist` as the publish directory
5. Configure environment variables in the Netlify dashboard

## Post-Deployment Configuration

After deploying both the frontend and backend:

1. Update the `VITE_BACKEND_API_URL` in the frontend environment to point to your deployed backend URL
2. Update the `ALLOWED_ORIGINS` in the backend environment to include your deployed frontend URL
3. Test the complete application to ensure everything is working correctly

## Troubleshooting

### CORS Issues

If you encounter CORS errors:

1. Verify that your frontend URL is included in the `ALLOWED_ORIGINS` environment variable on the backend
2. Check that the backend URL in the frontend environment is correct
3. Ensure the backend is properly handling CORS headers

### API Connection Issues

If the frontend cannot connect to the backend:

1. Check that the backend is running and accessible
2. Verify that the `VITE_BACKEND_API_URL` is set correctly
3. Check for any network restrictions or firewall issues

### Authentication Issues

If users cannot log in:

1. Verify that the Supabase configuration is correct
2. Check that the authentication flow is working properly
3. Ensure that the backend is correctly validating authentication tokens

## Maintenance

- Regularly update dependencies to ensure security and performance
- Monitor application logs for errors and issues
- Set up alerts for downtime or performance degradation
- Implement a CI/CD pipeline for automated deployments
