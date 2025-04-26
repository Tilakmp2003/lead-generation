#!/bin/bash

# Backend deployment script

echo "Preparing backend for deployment..."
cd backend

# Copy production environment variables
cp .env.production .env

echo "Backend is ready for deployment."
echo "You can now deploy to your hosting provider."
echo "For example, to deploy to Render, run: render deploy"
echo "Or to deploy to Heroku, run: git subtree push --prefix backend heroku master"
