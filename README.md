# FitFood Tracker - Comprehensive Diet and Health Metrics Management UI

A modern Next.js web application for recipe management, ingredient tracking, and nutritional analysis. Built with TypeScript, Tailwind CSS, and a comprehensive set of modern web development tools.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Development Workflow](#development-workflow)
- [Component Development with Storybook](#component-development-with-storybook)
- [Code Quality & Linting](#code-quality--linting)
- [Git Workflow](#git-workflow)

## Overview

This frontend application provides a user-friendly interface for:

- Recipe browsing and management
- Ingredient tracking and categorization
- Nutritional information analysis
- User authentication and authorization

The application is built with a focus on component-driven development, accessibility, and responsive design across all device sizes.

## Tech Stack

### Core Framework & Language

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router, API routes, and built-in optimization
- **[React 18](https://reactjs.org/)** - UI library for building interactive interfaces
- **[TypeScript 5](https://www.typescriptlang.org/)** - Static type safety across the entire application

### UI & Styling

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for rapid UI development
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality, accessible component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components for shadcn/ui
- **[PostCSS](https://postcss.org/)** - CSS transformations and optimizations

### State Management & Data Fetching

- **[TanStack Query (React Query)](https://tanstack.com/query)** - Server state management and data synchronization
- **[Axios](https://axios-http.com/)** - HTTP client for API requests
- **[React Hook Form](https://react-hook-form.com/)** - Performant form state management
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### Development Tools

- **[pnpm](https://pnpm.io/)** - Fast, disk space-efficient package manager
- **[Storybook 8](https://storybook.js.org/)** - Isolated UI component development and documentation
- **[ESLint](https://eslint.org/)** - JavaScript code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks for code quality
- **[commitlint](https://commitlint.js.org/)** - Conventional commit messages
- **[lint-staged](https://github.com/okonet/lint-staged)** - Run linters on staged files
- **[EditorConfig](https://editorconfig.org/)** - Consistent coding styles across editors

### Other Libraries

- **[Emoji Mart](https://github.com/missive/emoji-mart)** - Emoji picker component
- **[Cookies Next](https://github.com/andreandrade/cookies-next)** - Cookie management
- **[Google Accounts](https://developers.google.com/identity/gsi/web)** - Google authentication

## Project Structure

```
src/
  ├── app/                    # Next.js App Router pages and layout
  ├── modules/                # Feature modules (recipes, ingredients, etc.)
  ├── base/                   # Base components and utilities
  ├── stories/                # Storybook stories for components
  ├── middleware.ts           # Next.js middleware for authentication/i18n
  └── ...
public/                       # Static assets
  ├── manifest.json           # PWA manifest
  ├── sw.js                   # Service worker
  └── ...
messages/                     # i18n translation files
  ├── en.json                 # English translations
  └── vi.json                 # Vietnamese translations
.storybook/                   # Storybook configuration
  └── preview.tsx             # Storybook global settings
next.config.ts                # Next.js configuration
tsconfig.json                 # TypeScript configuration
tailwind.config.ts            # Tailwind CSS configuration
postcss.config.mjs            # PostCSS configuration
eslint.config.mjs             # ESLint configuration
.editorconfig                 # EditorConfig settings
```

## Getting Started

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **pnpm** 8+ (install globally: `npm install -g pnpm`)
- **BackEnd**  [SEP490_FTCDHMM_API](https://github.com/QuangKhuong3001/SEP490_FTCDHMM_API)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Gentle226/SEP490_FTCDHMM_UI.git
   cd SEP490_FTCDHMM_UI
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   - Copy `.env.example` to `.env.local` (if available)
   - Configure required environment variables (API endpoints, auth keys, etc.)

4. **Verify setup:**
   ```bash
   pnpm run lint
   ```

## Available Scripts

### Development

| Command              | Description                                         |
| -------------------- | --------------------------------------------------- |
| `pnpm dev`           | Start Next.js dev server at `http://localhost:3000` |
| `pnpm dev:storybook` | Start Storybook at `http://localhost:6006`          |
| `pnpm build`         | Build application for production                    |
| `pnpm start`         | Start production server                             |

### Quality & Maintenance

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `pnpm lint`            | Run ESLint across all files        |
| `pnpm build:storybook` | Build Storybook for static hosting |

## Development Workflow

### Starting Development

1. **Run the development server:**

   ```bash
   pnpm dev
   ```

   Application will be available at `http://localhost:3000`

2. **Run Storybook for component development:**
   ```bash
   pnpm dev:storybook
   ```
   Storybook will be available at `http://localhost:6006`

### Code Quality

- **Formatting**: Code is automatically formatted using Prettier on file save (if configured in your editor)
- **Linting**: ESLint checks code quality. Run `pnpm lint` to verify
- **Pre-commit hooks**: Husky runs linters on staged files before commits via `lint-staged`
- **Commit messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/) specification for consistency

### Making Changes

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure code quality:

   ```bash
   pnpm lint
   ```

3. Commit with conventional messages:

   ```bash
   git commit -m "feat: add new feature"
   # or: fix, docs, style, refactor, perf, test, chore, etc.
   ```

4. Push and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

## Component Development with Storybook

Storybook enables isolated component development and documentation. Stories are located in the `src/stories/` directory.

### Starting Storybook

```bash
pnpm dev:storybook
```

### Creating a Story

Create a file named `ComponentName.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';

import { ComponentName } from '@/base/components/ComponentName';

const meta: Meta<typeof ComponentName> = {
  component: ComponentName,
  title: 'Components/ComponentName',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // component props
  },
};
```

### Building Storybook for Production

```bash
pnpm build:storybook
```

Output will be in `storybook-static/` directory.

## Code Quality & Linting

### ESLint

ESLint configuration enforces consistent code style and catches potential errors.

Run linting:

```bash
pnpm lint
```

### Prettier

Code formatting is managed by Prettier. Configuration is in `prettier.config.js` (if present) or via eslint.config.mjs.

### EditorConfig

EditorConfig ensures consistent indentation, line endings, and file encoding across different editors and IDEs. The `.editorconfig` file defines these rules.

## Git Workflow

### Branch Naming

Follow conventional branch naming:

- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/documentation` - Documentation updates
- `refactor/code-section` - Code refactoring

### Commit Messages

Use Conventional Commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, missing semicolons, etc.)
- `refactor:` - Code refactor without feature changes
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build, dependency updates, etc.

Example:

```bash
git commit -m "feat: add recipe filter by cuisine"
git commit -m "fix: resolve ingredient search bug"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes with conventional messages
4. Push to your fork
5. Create a pull request

## License

This project is part of the SEP490 capstone project.

---

**For API documentation**, refer to the [SEP490_FTCDHMM_API](https://github.com/QuangKhuong3001/SEP490_FTCDHMM_API) repository.
