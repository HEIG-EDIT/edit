FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only
COPY package*.json ./
RUN npm install 

# Copy application code
COPY . .
#COPY prisma ./prisma

# Build the backend (if using NestJS or TS)
RUN npm run build

# Expose port (inside container)
EXPOSE 4000

# Start the app
CMD ["npm", "run", "start:prod"]
