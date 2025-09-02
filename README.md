# HEIG-EDIT

## About

**EDIT** (Easy Digital Image Toolkit) is a web based image editor with cloud storage and user management.

The app is available at https://www.edit-heig-pdg.work.gd/ until 30th September 2025.

## Technologies used

The backend is based on [NestJS](https://nestjs.com/) and the frontend is based on [Next.js](https://nextjs.org/).

The code is written in [Typescript](https://www.typescriptlang.org/) and [Tailwind](https://tailwindcss.com/) is used for the frontend styling.

### Prod infrastructure

TODO : ajouter schema et explications

### Dev infrastructure

TODO : ajouter schema et explications

## Repository Structure

The project structure for the backend is described [here](./backend/README.md#project-structure) and the same is available for the frontend [here](./frontend/README.md#project-structure).

## Contributing

### Prerequisites

- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Docker](https://docs.docker.com/engine/install/)

### Development setup

See the [dev infrastructure diagram](TODO : ajouter lien vers image) to have an overview.

1) Run the following command to setup the general development environment. This includes commit hooks for linting and formatting the code.

```bash
npm install
```

2) Before starting the backend, move and rename the *./.dev_env* file to *./backend/.env*. Then, run these commands to start the backend :
   
For local development, a .env with all the required parameters to run the application is needed. This can be share through a NordPass secure note.
Along with this .env file, you will also need to create a folder named `keys` in the `backend` folder. This folder will contain the private and public keys used for JWT authentication. You can generate these keys using the following commands (run them in the `backend` folder):

```bash
cd backend
mkdir keys
openssl genpkey -algorithm RSA -out ./keys/private.pem -pkeyopt rsa_keygen_bits:2048 # generate keys to TODO
openssl rsa -pubout -in ./keys/private.pem -out ./keys/public.pub.pem # TODO
docker compose up # start postgres and s3 + introduce dummy data in s3
npx prisma migrate deploy # TODO
npx prisma generate # TODO
npx prisma db seed # introduce dummy data in postgres
npm run start:dev # start nest app
```

To have a look on the db content, execute `npx prisma studio`.

3) Run these commands to start the frontend :

```bash
cd frontend
npm run dev # start next app
```

More details can be found in the [backend README](./backend/README.md) or in the [frontend README](./frontend/README.md), depending on which part you would like to contribute to.

### Development workflow

When running `npm install` at the root of the repository, Git commit hooks are initialized using [Husky](https://www.npmjs.com/package/husky/v/3.0.3). These hooks run [ESLint](https://eslint.org) to ensure that the code is properly formatted, free of unused code, and compliant with the project's coding standards.

1. Create an issue in the repository for the bug fix or feature you would like to work on.
2. Create a branch from main.
3. Implement your changes on this branch.
4. Open a PR from your branch into main, fill in the predefined PR template (link corresponding issue and explain your modifications), and create the PR.
6. The development team will automatically be assigned as reviewers. Once at least one reviewer approves the PR, it can be merged into main.
7. Merging into main will trigger the CI/CD pipeline, which will build and deploy an updated Docker image to production (frontend and/or backend, depending on where the changes were made).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
