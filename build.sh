#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Frontend ---
echo "Installing frontend dependencies..."
npm install

# --- Backend ---
echo "Navigating to backend directory..."
cd backend

echo "Installing backend dependencies..."
npm install

echo "Navigating back to root directory..."
cd ..

# --- Build Frontend (after all installs) ---
echo "Building frontend..."
# Use npx to ensure vite is found in local node_modules
npx vite build

# Copy necessary files after build
echo "Copying configuration files to dist..."
cp public/_redirects dist/
cp vercel.json dist/

echo "Build process completed for frontend and backend dependencies installed."
