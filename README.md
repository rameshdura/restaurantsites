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

## Connecting a Custom Domain (GoDaddy → Vercel)

Follow these steps to point a GoDaddy domain to a restaurant site deployed on Vercel.

### Step 1 — Add the Domain in Vercel
1. Open your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings → Domains** and click **Add Domain**.
3. Enter your GoDaddy domain (e.g. `myrestaurant.com`).
4. Vercel will display a **TXT verification record** — copy it, as you may need it in the next step.

### Step 2 — Verify Ownership in GoDaddy (if required)
> If Vercel asks you to verify the domain before switching nameservers, do this first:
1. Log in to [GoDaddy](https://www.godaddy.com) and navigate to **My Products → DNS**.
2. Add the **TXT record** provided by Vercel under your domain's DNS settings.
3. Wait a few minutes for GoDaddy to save the record, then confirm ownership in Vercel.

### Step 3 — Switch Nameservers to Vercel
1. In GoDaddy, go to **My Products → DNS → Nameservers** and click **Change**.
2. Select **Enter my own nameservers** and set:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. Save the changes. DNS propagation can take up to 48 hours, though it usually completes within a few minutes to a few hours.

### Step 4 — Domain Connects Automatically
Once propagation is complete:
- The domain will appear as **Valid** in your Vercel project's **Domains** settings.
- Vercel automatically routes the domain to your project.
- In this monorepo, if the restaurant's folder slug (in `apps/web/restaurants/<slug>`) matches the incoming hostname, the middleware proxy will automatically serve that restaurant's site — no additional configuration needed.

### Remove a Restaurant
To completely remove a restaurant site and its associated assets:
```bash
npm run remove-restaurant <slug>
```
**What this does:**
1. **Cleanup:** Deletes the restaurant configuration folder in `apps/web/restaurants/<slug>`.
2. **Asset Purge:** Removes the public image assets from `apps/web/public/images/restaurants/<slug>`.
3. **Unregistration:** Automatically removes the slug from `apps/web/proxy.ts`, ensuring it is no longer recognized by the middleware proxy.


** step by step godaddy to the turbo repo**
1. Go to GoDaddy and login.
2. Go to the domain.
change ns records to ns1.vercel-dns.com and ns2.vercel-dns.com
in vercel add domain it might ask to add the txt which can be only entered if the ns server is godaddy
then change ns records to vercel 

in vercel then connect domain to the project
your new domaiin will show in a list of the domains 
it will automatically connect to the project after the domain is propagated 
in turbo repo if the domain matches the restaurant folder name it will directly connect to it.
**
