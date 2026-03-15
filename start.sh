#!/bin/bash
# ─────────────────────────────────────────────────────────
#  AgriAssist — One-Command Startup Script
# ─────────────────────────────────────────────────────────

echo ""
echo "🌿 AgriAssist – AI Smart Farming Assistant"
echo "──────────────────────────────────────────"
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org (v18+)"
  exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend && npm install --silent
cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install --silent
cd ..

echo ""
echo "🚀 Starting AgriAssist..."
echo "   Backend  → http://localhost:5000"
echo "   Frontend → http://localhost:3000"
echo ""
echo "📧 Demo Login:"
echo "   Email:    rajesh@farm.com"
echo "   Password: farmer123"
echo ""

# Start backend in background
cd backend && node server.js &
BACKEND_PID=$!

# Start frontend
cd ../frontend && npm start

# Cleanup
kill $BACKEND_PID 2>/dev/null
