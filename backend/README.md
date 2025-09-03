# EDIT (Backend)

This part of the project is a [NestJS](https://nestjs.com) app. NestJS is a progressive ramework for building efficient and scalable server-side applications.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## How to run backend locally

Copy the .env file for local execution (call it simply `.env`) inside the`./backend` folder.
From the teminal where you will run the following commands, go into the `./backend` folder. 

Run:
```bash
docker compose up
```
This will create, with docker, a local instance of the postgres database and of the S3 service using Localstack. The S3-compatible endpoint will be available at: `http://localhost:4566`. Running this command will also seed Localstack.

If this command doesn't work, it is very likely because the `./backend/localstack-init/init-s3.sh` file is using the wrong end of file. In visual studio code, you can change it from CRLF to LF within the user interface, down on the right.

### 1. Check creation of a test bucket

Install AWS CLI if not done already. You can follow this guide:
`https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions`

Configure AWS CLI to point to Localstack:
```bash
aws configure
# Use dummy values:
# AWS Access Key ID: test
# AWS Secret Access Key: test
# Default region: us-east-1
```

Check that a test bucket and object exist:
```bash
aws --endpoint-url=http://localhost:4566 s3 ls s3://test-bucket
```

### 2. Manage database

Apply last migration:
```bash
npx prisma migrate deploy
```

or, to reset the database and reapply all migrations:
```bash
npx prisma migrate reset
```

Seed the database (if not already done automatically):
```bash
npx prisma db seed
```

Optionally, verify the database:
```bash
npx prisma studio
```

### 3. Compile and run the app

This command is necessary only once, to install dependencies:

```bash
npm install 
```

Run the backend to be able to reach the APIs at `http://localhost:4000/projects`:

```bash
npm run start:dev
```

## Run tests

To run all tests in parallel:

```bash
# backend integration and unit tests
cd ../backend
npm test
```

Alternatively, to run one single test:

```bash
$ npx jest ./path/to/test/test.name.spec.ts --detectOpenHandles
```

## Database migration

Once we update our `schema.prisma` file, we want our **database** to match the new schema.
We do this in two steps: **generate a migration** and then **apply it**.

Before all, we have to make sure our changes in `schema.prisma` are saved. Also, we need to have a running db instance, and to do so we can simply use the given docker-compose file, by running `docker compose up`.

### 1. Create a migration

We run:

```bash
npx prisma migrate dev --name some_descriptive_name
```

* `migrate dev` will:

  * Compare our updated `schema.prisma` to the current DB.
  * Generate a new migration file in `prisma/migrations/`.
  * Apply it to our local dev database.
  * Update the generated Prisma Client.

### 2. Push schema without migration (only in dev/prototyping!)

When we just want to force the schema onto the DB, without keeping the migration history, we simply run:

```bash
npx prisma db push
```

⚠️ Warning: this **does not generate migration files** (we loose schema history). It’s useful for quick prototyping but not for production.

### 3. Generate Prisma Client (if needed)

If not already done by the command above, we run this command to regenerate our client:

```bash
npx prisma generate
```

After that, our DB reflects our new `schema.prisma`.

## Project structure

The project is organized as follows:

- *bruno_edit_collection*: contains bruno collections to run tests four the APIs routes
- *localstack...*: three folders containing the configuration for localstack, a service we used to mock s3 to test our application locally
- *prisma*: containes our database schema, the `seed.ts` script to seed our local database in case of reset, the `migrations` folder with the history of all previous schemas, needed by prisma to generate the client and deploy new changes. 
- *src*: controller, module, services, dtos and specs (tests) for the following models
    - *auth*
    - *collaboration*
    - *project*
    - *s3*
    - *users*
    
    These additional folders:
    - common
    - config
    - prisma: module and service to be able to use prisma client.

The *jest.config.ts* file includes configuration for running the tests with the command `npm test`.
`Dockerfile` is used during the app deployment.
The `docker-compose` file is used to run the app locally and set up the needed services (postgresSQL and localstack for s3.)

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
