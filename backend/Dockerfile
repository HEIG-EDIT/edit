FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only
COPY package*.json ./
RUN npm install 

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the backend (if using NestJS or TS)
RUN npm run build

# Expose port (inside container)
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]
