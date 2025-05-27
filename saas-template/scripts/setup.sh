#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Setting up SaaS Template...${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  Please update .env with your credentials before continuing${NC}"
    exit 1
fi

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install

# Generate Prisma client
echo -e "${GREEN}🔧 Generating Prisma client...${NC}"
npx prisma generate

# Run database migrations
echo -e "${GREEN}🗄️  Running database migrations...${NC}"
npx prisma migrate dev --name init

# Seed database (optional)
read -p "Do you want to seed the database with sample data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}🌱 Seeding database...${NC}"
    npx prisma db seed
fi

echo -e "${GREEN}✅ Setup complete! Run 'npm run dev' to start the development server.${NC}"
