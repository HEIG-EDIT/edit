# Database

### Database init

### Prisma - ORM
Prisma is used as an ORM to interact with the PostgreSQL database. It provides a type-safe and easy-to-use API to perform database operations.
To generate the Prisma client, run the following command in the backend/ folder after the database is set up:
```cd backend/
npm install
npx prisma db pull
npx prisma generate
```