# EDIT (Frontend)

This part of the project is a [Next.js](https://nextjs.org) app bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## How to run frontend locally

First, install the required dependencies:
```bash
npm install
```
Then, run the development server with 
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to run the entire app

In this case, you can follow this [documentation](../README.md#development-setup).

## Project structure

The project is organized as follows:

*\__tests\__*: contains unit tests (focused on the editor’s logic)
- *public*: stores all images used by the app (especially those displayed on the home page)
- *src*:
    - *app*: follows the Next.js conventions for routing and page organization (in brief, each folder = one page)
    - *components*: contains all React components (global components live at the root of this folder and page-specific components are placed in subfolders corresponding to where they are used)
    - *lib*: manages API calls and authentication logic
    - *models*: defines global types, interfaces, and classes for the application

Additionally, the *next.config.ts* file includes configuration for redirecting backend API calls.

