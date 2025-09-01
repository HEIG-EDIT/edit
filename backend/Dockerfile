FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema first
COPY prisma ./prisma

# Copy the rest of the code
COPY . .

# Generate Prisma client at build time
RUN npx prisma generate

# Build NestJS backend
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
