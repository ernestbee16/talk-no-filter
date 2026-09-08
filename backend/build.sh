#!/usr/bin/env bash
set -e
if [ -d "backend" ]; then
  cd backend
fi
npm install
npx prisma generate
npx tsc
