FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies only
COPY package*.json ./
RUN npm install 

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the backend
RUN npm run build

# Expose port (inside container)
EXPOSE 4000

# Start the app
CMD npx prisma migrate deploy && npm run start:prod
