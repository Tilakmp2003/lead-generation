# Google Places API Key Setup Guide

This guide will help you set up a Google Places API key without restrictions to use with the Lead Generation application.

## Step 1: Create or Access Your Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select an existing project or create a new one by clicking "New Project" at the top right

## Step 2: Enable the Required APIs

1. In the left sidebar, navigate to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - Places API
   - Maps JavaScript API
   - Geocoding API

## Step 3: Create an API Key

1. In the left sidebar, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" at the top of the page
3. Select "API Key" from the dropdown menu
4. Your new API key will be displayed. Copy this key.

## Step 4: Configure API Key Restrictions (Optional but Recommended)

For better security, you can add restrictions to your API key:

1. In the "API keys" section, find your newly created key and click on it
2. Under "Application restrictions", you can choose:
   - "None" (for development)
   - "HTTP referrers" (for production, add your domain)
   - "IP addresses" (if you have a static IP)
3. Under "API restrictions", select "Restrict key" and choose the APIs you enabled (Places API, Maps JavaScript API, Geocoding API)
4. Click "Save"

## Step 5: Update Your .env File

1. Open the `backend/.env` file in your project
2. Replace the placeholder API key with your new key:
   ```
   GOOGLE_PLACES_API_KEY=YOUR_NEW_API_KEY
   ```
3. Save the file

## Step 6: Restart the Backend Server

1. Stop the current backend server (if running)
2. Start it again with:
   ```
   cd backend
   npm run dev
   ```

## Troubleshooting

If you encounter issues with your API key:

1. **Billing**: Make sure billing is enabled for your Google Cloud project
2. **Quota Limits**: Check if you've exceeded your quota limits
3. **API Activation**: Ensure the APIs are properly enabled
4. **Restrictions**: Verify that your restrictions (if any) allow requests from your development environment
5. **Wait Time**: Sometimes it takes a few minutes for a new API key to become active

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
