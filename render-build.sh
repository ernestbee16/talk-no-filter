#!/usr/bin/env bash
# exit on error
set -o errexit

if [ -d "backend" ]; then
  cd backend
fi

npm install
npx prisma generate
npx tsc
