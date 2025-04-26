#!/bin/bash

# Frontend deployment script

echo "Building frontend for production..."
npm run build

echo "Frontend build completed. The build files are in the 'dist' directory."
echo "You can now deploy these files to your hosting provider."
echo "For example, to deploy to Vercel, run: vercel --prod"
echo "Or to deploy to Netlify, run: netlify deploy --prod"
