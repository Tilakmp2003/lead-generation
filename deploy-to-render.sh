#!/bin/bash

# Script to deploy backend changes to Render
# This script assumes you have Git configured and have access to push to your repository

echo "Preparing to deploy backend changes to Render..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git and try again."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo "Not in a git repository. Please run this script from within your git repository."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

# Stage changes
echo "Staging changes..."
git add backend/src/services/googlePlacesService.js
git add backend/src/services/leadService.js
git add backend/src/controllers/leadController.js

# Commit changes
echo "Committing changes..."
git commit -m "Fix: Add Madurai coordinates and improve error handling for lead search"

# Push changes to remote repository
echo "Pushing changes to remote repository..."
git push origin $CURRENT_BRANCH

echo "Changes pushed to remote repository."
echo "Render should automatically deploy the changes if you have continuous deployment set up."
echo "If not, please manually deploy from the Render dashboard."
echo "Done!"
