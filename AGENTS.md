# Workspace Guidelines

## Code Quality

### Linting
- Run `npm run lint` from the root to check for ESLint errors across all packages
- If errors are found, run `npm run lint:fix` to automatically fix fixable issues
- `lint:fix` runs `eslint --fix` in the apps/web workspace

### Type Checking
- Run `npm run typecheck` to verify TypeScript types

### Formatting
- Run `npm run format` to format code with Prettier