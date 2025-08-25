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

To run tests, execute :

```
npm run build
npm run start
npx playwright test
```

## Project structure

All of the app's pages are located in [./src/app](./src/app). These pages may use
components defined in [./src/components/](./src/components/), in the subfolder corresponding to the relevant page,
or at the root of the `components` directory for global components.

The images for the app are stored in [./public](./public/).

Regular typescript utilitary code is stored under [./src/utils](./src/utils/).
