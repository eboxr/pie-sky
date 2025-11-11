#!/bin/bash
# Development script for running Hugo with CMS local backend
# This allows you to access the admin section without GitHub OAuth

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

