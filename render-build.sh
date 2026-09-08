#!/usr/bin/env bash
set -e

if [ -d "backend" ]; then
  cd backend
fi

npm install --include=dev
npx prisma generate
npx tsc
