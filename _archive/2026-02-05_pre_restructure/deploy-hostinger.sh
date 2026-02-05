#!/bin/bash
# Deploy script for Hostinger - Copies dist files to root for deployment

echo "Building production version..."
npm run build

echo "Copying dist files to root for Hostinger deployment..."
cp -r dist/* .

echo "Done! Files are ready at root level."
echo "Now commit and push to deploy."
