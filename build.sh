#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Frontend ---
echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
# Directly build the frontend using npx vite
npx vite build

# Copy necessary files after build
echo "Copying configuration files to dist..."
cp public/_redirects dist/
cp vercel.json dist/

# --- Backend ---
echo "Navigating to backend directory..."
cd backend

echo "Installing backend dependencies..."
npm install
# No backend build step seems necessary based on backend/package.json

echo "Navigating back to root directory..."
cd ..

echo "Build process completed for frontend and backend dependencies installed."
