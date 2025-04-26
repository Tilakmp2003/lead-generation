#!/bin/bash

# Build the application
npm run build

# Copy the _redirects file to the dist directory
cp public/_redirects dist/

# Copy the vercel.json file to the dist directory
cp vercel.json dist/

echo "Build completed and configuration files copied to dist directory."
