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

TODO : @Alessio -> parler de husky et du lien entre back / front

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

```bash
cd backend
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

### Github workflow

TODO (nouvelle branche, pr avec automatiquement canvas + team en reviewers + ci / cd une fois que merge sur main)

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
