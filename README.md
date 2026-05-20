# shadcn/ui monorepo template

This is a Next.js monorepo template with shadcn/ui.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Restaurant Management

The platform includes automation scripts to manage restaurant sites within the monorepo.

### Create a Restaurant
To scaffold a new restaurant site from the secure boilerplate:
```bash
npm run create-restaurant <slug>
```
**What this does:**
1. **Scaffolding:** Creates a new directory in `apps/web/restaurants/<slug>`.
2. **Configuration:** Copies and customizes the `data.json` template (updates UID, name, and image paths).
3. **Assets:** Clones the boilerplate image library into both the local restaurant folder and the Next.js `public` directory.
4. **Registration:** Automatically adds the new slug to the `validSlugs` array in `apps/web/proxy.ts` to enable routing.

### Remove a Restaurant
To completely remove a restaurant site and its associated assets:
```bash
npm run remove-restaurant <slug>
```
**What this does:**
1. **Cleanup:** Deletes the restaurant configuration folder in `apps/web/restaurants/<slug>`.
2. **Asset Purge:** Removes the public image assets from `apps/web/public/images/restaurants/<slug>`.
3. **Unregistration:** Automatically removes the slug from `apps/web/proxy.ts`, ensuring it is no longer recognized by the middleware proxy.
