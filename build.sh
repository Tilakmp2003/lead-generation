#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Frontend ---
echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
# Use the existing build script from package.json which also handles copying files
npm run build

# --- Backend ---
echo "Navigating to backend directory..."
cd backend

echo "Installing backend dependencies..."
npm install
# No backend build step seems necessary based on backend/package.json

echo "Navigating back to root directory..."
cd ..

echo "Build process completed for frontend and backend dependencies installed."
