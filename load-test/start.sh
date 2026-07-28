#!/bin/bash
echo "🚀 Starting Production-Grade k6 Load-Testing Worker..."
if [ ! -f .env ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
fi

docker-compose up --build --abort-on-container-exit
echo "✅ Load-test complete."
