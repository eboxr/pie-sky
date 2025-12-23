#!/bin/bash
# Development script for running Hugo with CMS local backend
# This allows you to access the admin section without GitHub OAuth

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not found"
    echo ""
    echo "To use the local CMS backend, you need Node.js and npm installed."
    echo ""
    echo "Installation options:"
    echo "1. Install Node.js from https://nodejs.org/ (includes npm and npx)"
    echo "2. Or use Homebrew: brew install node"
    echo ""
    echo "After installing Node.js, run this script again."
    echo ""
    echo "Starting Hugo server only (admin section will require GitHub authentication)..."
    hugo server
    exit 1
fi

echo "Starting Hugo development server..."
hugo server &
HUGO_PID=$!

echo "Waiting for Hugo to start..."
sleep 2

echo "Starting Netlify CMS proxy server..."
echo "You can now access the CMS at http://localhost:1313/admin (no authentication required)"
npx netlify-cms-proxy-server &
CMS_PID=$!

echo ""
echo "Hugo server PID: $HUGO_PID"
echo "CMS proxy PID: $CMS_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $HUGO_PID $CMS_PID 2>/dev/null; exit" INT TERM
wait

