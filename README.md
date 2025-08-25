# HEIG-EDIT

## About

EDIT (Easy Digital Image Toolkit) is an web based image editor with cloud storage
and user management.

The project uses NestJS and Next.js. The code is written in Typescript and Tailwind is used for
the frontend styling.

## Pre-requisites

- npm
- Docker (to deploy)

## Instructions

### Development setup

Run the following commands to install/setup the general development environment. This includes commit hooks for linting and formatting the code.

```bash
npm install
```

### Repo organization

This project includes the [frontend](./frontend/README.md) and [backend](./backend/README.md) projects of the EDIT app. To work on one
or the other, go into the corresponding subfolder.

### E2E test

TODO : finir doc

To run E2E tests, execute :

```
npm run build
npm run start
npx playwright test
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
