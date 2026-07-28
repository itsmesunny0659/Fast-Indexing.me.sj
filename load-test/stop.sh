#!/bin/bash
echo "🛑 Gracefully stopping k6 Load-Testing Worker..."
docker-compose down --volumes --remove-orphans
echo "✅ Stopped cleanly."
