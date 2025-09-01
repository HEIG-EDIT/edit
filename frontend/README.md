# EDIT Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install the required dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project structure

All of the app's pages are located in [./src/app](./src/app). These pages may use
components defined in [./src/components/](./src/components/), in the subfolder corresponding to the relevant page,
or at the root of the `components` directory for global components.

Custom defined hooks are placed in [./src/hooks](./src/hooks) with no particular
organization (this may change later).

The images for the app are stored in [./public](./public/).

Regular typescript utilitary code is stored under [./src/utils](./src/utils/).

## Tests

Unit tests are written with the [Jest testing framework](https://jestjs.io/). It is installed as a dev dependency by npm so no extra action is required
to make it usable. Tests can be run with the command:

```bash
npm run test
```

Unit tests are located in the [./__tests__/](./__tests__/) directory. To add new tests, just add a new file in
this directory with the `.test.ts` extension (this is mandatory for Jest to detect the file). Ideally,
tests should be meaningfully separated into files.

## Deployment

The EDIT frontend is deployed by a Github actions workflow using the corresponding
[Dockerfile](Dockerfile). This deployment workflow is automatically triggered
whenever a PR containing changes in the `frontend` directory of the monorepo
(the directory containing this README file).

This Dockerifle can also be used to build and deploy the app locally.
