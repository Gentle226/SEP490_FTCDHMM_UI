# SEP490 Project 

## Table of Contents

- [1. Description](#1-description)
- [2. Frameworks/Libraries/Tools Used](#2-frameworkslibrariestools-used)
- [3. Project Setup](#3-project-setup)
- [4. Storybook](#4-storybook)

## 1. Description

Planning...

## 2. Frameworks/Libraries/Tools Used

- [Next.js](https://nextjs.org/) - A React framework.

---

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [TypeScript](https://www.typescriptlang.org/) - A superset of JavaScript that adds static types.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
- [shadcn/ui](https://ui.shadcn.com/) - A set of components built with Tailwind CSS and [Radix UI](https://www.radix-ui.com/).
- [Tanstack Query](https://tanstack.com/query) - A powerful data-fetching library for React.
- [React Hook Form](https://react-hook-form.com/) - A library for managing forms in React.
- [Zod](https://zod.dev/) - A TypeScript-first schema declaration and validation library.
- [next-intl](https://next-intl.dev/) - A library for internationalization in Next.js.

---

- [pnpm](https://pnpm.io/) - A fast, disk space-efficient package manager.
- [Storybook](https://storybook.js.org/) - A tool for developing UI components in isolation.
- [Prettier](https://prettier.io/) - An opinionated code formatter.
- [ESLint](https://eslint.org/) - A tool for identifying and reporting on patterns in JavaScript.
- [Husky](https://typicode.github.io/husky/#/) - A tool for managing Git hooks.
- [commitlint](https://commitlint.js.org/) - A tool for linting commit messages.
- [editorconfig](https://editorconfig.org/) - A file format and collection of text editor plugins for maintaining consistent coding styles.

## 3. Project Setup

1. Clone this repository or click the "Use this template" button on GitHub to create a new repository.

2. Install the dependencies:

```bash
pnpm install --frozen-lockfile
```

> Note: the `--frozen-lockfile` flag ensures that the `pnpm-lock.yaml` file is not modified during installation. This is useful for CI/CD environments where you want to ensure that the exact same dependencies are installed every time.

3. Create a `.env` file in the root directory of the project. You can use the `.env.example` file as a template. Make sure to fill in the required environment variables.

4. Run the development server:

```bash
pnpm dev
```

This will start the Next.js development server on [http://localhost:3000](http://localhost:3000).

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the application in action.

## 4. Storybook

[Storybook](https://storybook.js.org/) is a tool for developing UI components in isolation. It allows you to create, develop and test components without having to run the entire application.

While this documentation site is primarily for setting up the project, Storybook documentation focuses on the design system, UI components, and other frontend aspects (i18n, a11y, etc.).

Storybook is run separately from the main application, so you need to start it in a separate terminal, using the following command:

```bash
pnpm dev:storybook
```

This will start the Storybook server on [http://localhost:6006](http://localhost:6006).
