# SEP490 Project - Next.js (Web) and React Native (Mobile) Monorepo

## Table of Contents

- [1. Description](#1-description)
- [2. Frameworks/Libraries/Tools Used](#2-frameworkslibrariestools-used)
- [3. Project Structure](#3-project-structure)
- [4. Project Setup](#4-project-setup)
- [5. Running the Apps](#5-running-the-apps)
- [6. Storybook](#6-storybook)

## 1. Description

Planning...

## 2. Frameworks/Libraries/Tools Used

### Core Frameworks

- [Next.js](https://nextjs.org/) - A React framework for the web application.
- [React Native](https://reactnative.dev/) (with [Expo](https://expo.dev/)) - A framework for building native mobile apps with React.

### UI & Styling

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [TypeScript](https://www.typescriptlang.org/) - A superset of JavaScript that adds static types.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
- [shadcn/ui](https://ui.shadcn.com/) - A set of components built with Tailwind CSS and [Radix UI](https://www.radix-ui.com/).

### Data Fetching & State Management

- [Tanstack Query](https://tanstack.com/query) - A powerful data-fetching library for React.
- [React Hook Form](https://react-hook-form.com/) - A library for managing forms in React.
- [Zod](https://zod.dev/) - A TypeScript-first schema declaration and validation library.

### Internationalization

- [next-intl](https://next-intl.dev/) - A library for internationalization in Next.js.

### Tooling & Development

- [pnpm workspaces](https://pnpm.io/workspaces) - A tool for managing monorepos.
- [Storybook](https://storybook.js.org/) - A tool for developing UI components in isolation.
- [Prettier](https://prettier.io/) - An opinionated code formatter.
- [ESLint](https://eslint.org/) - A tool for identifying and reporting on patterns in JavaScript.
- [Husky](https://typicode.github.io/husky/#/) - A tool for managing Git hooks.
- [commitlint](https://commitlint.js.org/) - A tool for linting commit messages.
- [editorconfig](https://editorconfig.org/) - A file format and collection of text editor plugins for maintaining consistent coding styles.

## 3. Project Structure

This project is a monorepo managed by `pnpm` workspaces. The code is organized into packages:

- `packages/next-app`: The Next.js web application.
- `packages/mobile-app`: The React Native (Expo) mobile application.
- `packages/shared-ui`: (Optional) A shared component library for both web and mobile.

## 4. Project Setup

1. Clone this repository or click the "Use this template" button on GitHub to create a new repository.

2. Install the dependencies from the root of the project:

```bash
pnpm install --frozen-lockfile
```

> Note: The `--frozen-lockfile` flag ensures that the `pnpm-lock.yaml` file is not modified during installation. This is useful for CI/CD environments where you want to ensure that the exact same dependencies are installed every time.

3. Create a `.env` file in the root of the `packages/next-app` directory. You can use the `packages/next-app/.env.example` file as a template. Make sure to fill in the required environment variables.

## 5. Running the Apps

All commands should be run from the root of the project.

### Web App (Next.js)

To start the Next.js development server:

```bash
pnpm web dev
```

This will start the server on [http://localhost:3000](http://localhost:3000).

### Mobile App (React Native/Expo)

To start the Expo development server:

```bash
pnpm mobile start
```

This will open the Expo developer tools in your browser. You can then scan the QR code with the Expo Go app on your phone to run the app.

## 6. Storybook

[Storybook](https://storybook.js.org/) is used for developing and showcasing UI components in isolation. It is configured for the `next-app`.

To run Storybook:

```bash
pnpm storybook
```

This will start the Storybook server on [http://localhost:6006](http://localhost:6006).
