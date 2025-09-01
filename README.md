# HEIG-EDIT

## About

EDIT (Easy Digital Image Toolkit) is an web based image editor with cloud storage
and user management.

The project uses NestJS and Next.js. The code is written in Typescript and Tailwind is used for
the frontend styling.

## Pre-requisites

- npm
- Docker (to deploy)

## Development instructions

### Development setup

Run the following commands to install/setup the general development environment. This includes commit hooks for linting and formatting the code.

```bash
npm install
```

### Repo organization

This project includes the [frontend](./frontend/README.md) and [backend](./backend/README.md) projects of the EDIT app. To work on one
or the other, go into the corresponding subfolder.

### Contributing on Github

Before opening a pull request to make changes to the code, the developers must run the unit tests locally for the
project being updated following the instructions of the subfolders. In addition to this, they must check that the code
builds in order to make sure that the deployment workflow on Github actions is successful.

## Deployment

The EDIT backend and frontend are deployed by a Github actions workflow using the corresponding
Dockerfile ((./frontend/Dockerfile)[./frontend/Dockerfile] or (./backend/Dockerfile)[./backend/Dockerfile]). This deployment workflow is automatically triggered
whenever a PR containing changes in the corresponding directory of the monorepo is opened.

These Dockerifles can also be used to build and deploy the app locally by following the instructions in the respective subfolder.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
