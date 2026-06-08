# Theme & Style Customization System

This document outlines the design and integration of the dynamic style customization layer built into **RestaurantSite**.

---

## 1. Centrally Controlled Customization Variables

We have defined a custom variable system inside our global stylesheet to decouple styling decisions from the component markup.

### CSS Theme Setup
In **[globals.css](file:///Users/rameshdura/web/nextjs/restaurant/restaurantsite/packages/ui/src/styles/globals.css)**, we added the `--button-radius` customization variable at `:root`:

```css
:root {
  --radius: 0.625rem;
  
  /* Customization Layer: Controls button curving globally */
  --button-radius: 0px; 
}
```

And mapped it dynamically in our base layer:

```css
@layer base {
  button, 
  [data-slot="button"], 
  .group\/button {
    border-radius: var(--button-radius, 0px) !important;
  }
}
```

---

## 2. Dynamic JSON Customization Schema

You can customize themes on a per-restaurant basis by adding a `"theme"` block directly in your restaurant's `data.json`. 

### Expected JSON Schema
Add this structure inside a restaurant's primary configuration block:

```json
{
  "name": "The Restaurant Name",
  "theme": {
    "palette": {
      "primary": "#d97706",
      "primaryForeground": "#ffffff",
      "background": "#fafaf9",
      "foreground": "#1c1917"
    },
    "layout": {
      "buttonRadius": "0px",
      "cardRadius": "16px"
    }
  }
}
```

---

## 3. How the Integration Layer Works

We created a dynamic layout page at **[layout.tsx](file:///Users/rameshdura/web/nextjs/restaurant/restaurantsite/apps/web/app/[restaurant]/layout.tsx)** that wraps all pages for every dynamic route (e.g. `/[restaurant]`, `/[restaurant]/about`, etc.):

1. **Fetches Data**: It loads the restaurant's raw JSON config block.
2. **Generates Variables**: Translates JSON values safely to inline CSS properties.
3. **Applies Style Scoping**: Spreads the variables onto a parent container using Tailwind's `className="contents"` (`display: contents;`).
4. **CSS Variable Cascading**: Any standard Tailwind colors (like `bg-primary`) or components inside that layout block inherit the values automatically!

---

## 4. How to Update or Extend in the Future

### A. Adjust Rounding Without Code Changes
If you need to make all buttons rounded or pill-shaped globally:
* Change `--button-radius` in **[globals.css](file:///Users/rameshdura/web/nextjs/restaurant/restaurantsite/packages/ui/src/styles/globals.css)** to `var(--radius-4xl)` or `9999px`.

### B. Add New Configurable Parameters (e.g. secondary accent)
If you want to control more properties from `data.json`:
1. Add a new key to the JSON block (e.g. `"secondary"`).
2. Map it inside the dynamic `customStyles` dictionary inside **[layout.tsx](file:///Users/rameshdura/web/nextjs/restaurant/restaurantsite/apps/web/app/[restaurant]/layout.tsx)**:
   ```typescript
   ...(theme.palette?.secondary && { "--secondary": theme.palette.secondary }),
   ```
3. Use `var(--secondary)` in your theme colors inside Tailwind/CSS styles.
