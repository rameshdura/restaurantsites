# SEO Implementation Checklist

Print this and check off as you go.

---

## ⬜ Phase 0: Foundation (Already Done)

- [x] Created `/seo` dashboard route
- [x] Created `lib/seo.ts` utility functions
- [x] Updated TypeScript interfaces
- [x] Created JSON-LD component
- [x] Created sitemap.ts
- [x] Created robots.ts
- [x] Added Badge component to UI package
- [x] Created documentation suite

---

## ⬜ Phase 1: Data Entry (Week 1)

### For EACH Restaurant (Ramen Taro, Sushi Yama, ...)

#### Day 1: Core SEO Fields
- [ ] Add `seo.title` (50-60 chars, includes location)
- [ ] Add `seo.description` (150-160 chars)
- [ ] Add `images.heroImage.url` (high-quality image)
- [ ] Add `images.heroImage.alt` (descriptive sentence)
- [ ] Add `images.logo.alt` (descriptive)
- [ ] Add `schema.priceRange` (`$`, `$$`, `$$$`, `$$$$`)
- [ ] Add `schema.servesCuisine` (array, e.g. ["Japanese", "Ramen"])
- [ ] Add `schema.acceptsReservations` (true/false)

#### Day 2: Social & Local
- [ ] Add `social.sameAs` array (至少1-2个链接)
  - [ ] Google Maps URL
  - [ ] Instagram URL
  - [ ] Facebook URL (optional)
  - [ ] TripAdvisor URL (optional)
- [ ] Add `localSEO.city` (city name)
- [ ] Add `localSEO.region` (prefecture/state)
- [ ] Add `localSEO.placeId` (from Google Maps)
- [ ] Add `localSEO.googleMapsUrl`

#### Day 3: Content Enhancement
- [ ] Add `content.tagline` (short slogan)
- [ ] Add `content.mission` (1-2 sentences)
- [ ] Add `about.founder` object (if applicable)
  - [ ] name
  - [ ] role
  - [ ] bio (50+ words)
  - [ ] image
- [ ] Add `about.awards` array (if any)

#### Day 4: Menu Optimization
- [ ] Ensure all menu items have `name` and `description`
- [ ] Add `isPopular: true` to 3-5 signature dishes
- [ ] Add `isVegetarian` / `isSpicy` flags where applicable
- [ ] Add `image` to popular dishes (with alt text)
- [ ] Ensure all prices present

#### Day 5: Validate
- [ ] Visit `/seo` dashboard
- [ ] Verify all 6 page cards show mostly green ✓
- [ ] Fix any red ✗ items
- [ ] Check title length: 50-60 chars
- [ ] Check desc length: 150-160 chars

---

## ⬜ Phase 2: Code Implementation (Week 2)

### Day 1: Home Page (`app/[restaurant]/page.tsx`)
- [ ] Import `generateHomeMetadata` from `@/lib/seo`
- [ ] Add `export async function generateMetadata()`
- [ ] Return `generateHomeMetadata(restaurant.data, slug)`
- [ ] Import `JsonLd` from `@/components/seo/JsonLd`
- [ ] Add `<JsonLd restaurant={...} slug={slug} pageType="home" />` in JSX
- [ ] Test: `npm run build` → no errors
- [ ] Test: View source → meta tags present

### Day 2: About Page (`app/[restaurant]/about/page.tsx`)
- [ ] Add `generateAboutMetadata`
- [ ] Add `JsonLd` with `pageType="about"`
- [ ] Test build
- [ ] Verify AboutPage schema in source

### Day 3: Menu Page (`app/[restaurant]/menu/page.tsx`)
- [ ] Add `generateMenuMetadata`
- [ ] Add `JsonLd` with `pageType="menu"`
- [ ] Test build
- [ ] Verify Menu schema in source

### Day 4: Contact Page (`app/[restaurant]/contact/page.tsx`)
- [ ] Add `generateContactMetadata`
- [ ] Add `JsonLd` with `pageType="contact"`
- [ ] Test build
- [ ] Verify ContactPoint schema in source

### Day 5: Other Pages
- [ ] Brand page: `generateBrandMetadata` (with `noindex: true`)
- [ ] Company info: `generateCompanyMetadata`
- [ ] Company info: `JsonLd` with `pageType="company"`
- [ ] Test full build: `npm run build`
- [ ] Start server: `npm run start`
- [ ] Visit all 6 pages → view source → verify meta tags

---

## ⬜ Phase 3: Testing & Validation (Week 2-3)

### Day 1: Lighthouse Audit
- [ ] Open Chrome DevTools → Lighthouse
- [ ] Run SEO audit on home page
- [ ] Target: >90/100
- [ ] Fix any issues (meta tags, alt text, etc.)
- [ ] Repeat for menu, contact, about pages

### Day 2: Structured Data Validation
- [ ] Go to https://search.google.com/test/rich-results
- [ ] Test home page URL
- [ ] Fix any schema errors
- [ ] Test menu page URL
- [ ] Test contact page URL
- [ ] Verify no critical errors

### Day 3: Schema Markup Validator
- [ ] Go to https://validator.schema.org/
- [ ] Paste JSON-LD from any page (view source → search `application/ld+json`)
- [ ] Validate - should be "No errors"

### Day 4: Social Media Preview
- [ ] Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- [ ] Enter home page URL → Check OG image, title, description
- [ ] Twitter Card Validator: https://cards-dev.twitter.com/validator
- [ ] Fix any OG tag issues

### Day 5: Core Web Vitals
- [ ] Chrome DevTools → Performance tab
- [ ] Run performance audit
- [ ] Check LCP (< 2.5s), CLS (< 0.1), FID (< 100ms)
- [ ] Optimize images if needed (already using next/image ✓)

---

## ⬜ Phase 4: Deployment (Week 3)

### Day 1: Staging Deploy
- [ ] Deploy to staging/preview environment
- [ ] Verify all routes work
- [ ] Check `/sitemap.xml` (should be XML)
- [ ] Check `/robots.txt` (should be plain text)
- [ ] Test `/seo` dashboard on staging

### Day 2: Search Console Setup
- [ ] Add staging domain to Google Search Console
- [ ] Submit staging sitemap: `https://staging.domain.com/sitemap.xml`
- [ ] URL Inspection → Test staging URLs
- [ ] Fix any crawl errors

### Day 3: Production Deploy
- [ ] Deploy to production
- [ ] Verify live site working
- [ ] Test all 6 page types
- [ ] View source → confirm meta tags
- [ ] Test structured data on live URLs

### Day 4: Google Submission
- [ ] Add production domain to Search Console
- [ ] Submit sitemap: `https://yourdomain.com/sitemap.xml`
- [ ] URL Inspection → Request indexing for:
  - [ ] `https://yourdomain.com/ramen-taro`
  - [ ] `https://yourdomain.com/sushi-yama`
  - [ ] (all restaurant homepages)
- [ ] Wait for "URL is on Google" confirmation

### Day 5: Monitoring Setup
- [ ] Set up Google Analytics 4 (if not already)
- [ ] Create Search Console alerts
- [ ] Check Search Console Coverage report
- [ ] Note: Indexing takes 2-14 days

---

## ⬜ Phase 5: Ongoing Maintenance (Monthly)

- [ ] Check Search Console for new errors
- [ ] Review performance report (impressions, clicks, CTR)
- [ ] Update `data.json` when menu/hours change
- [ ] Add new restaurants with complete SEO data
- [ ] Run Lighthouse quarterly (target >90)
- [ ] Update sitemap auto-generated ✓

---

## ✅ Final Pre-Launch Sign-Off

Before declaring "SEO complete":

- [ ] All restaurants have complete `data.json` (verify via `/seo`)
- [ ] All 6 pages per restaurant have `generateMetadata`
- [ ] All pages (except brand) have `<JsonLd />`
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Lighthouse SEO >90 on all pages
- [ ] Rich Results Test passes (0 errors)
- [ ] No `noindex` on restaurant pages (only `/brand`)
- [ ] All images have descriptive alt text
- [ ] Canonical URLs correct
- [ ] Open Graph images valid (1200×630px minimum)

---

## 📊 Success Metrics (Track in Search Console)

| Metric | Target | Timeline |
|--------|--------|----------|
| Pages indexed | 100% | 2-4 weeks |
| Lighthouse SEO score | >90 | Immediate |
| Organic impressions | +20% MoM | 3 months |
| Organic CTR | >3% | 3 months |
| Brand query ranking | #1 | 1 month |
| Menu item ranking | Top 10 | 3-6 months |

---

## 🆘 Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `/seo` shows all ✗ | `data.json` missing SEO fields | Add minimum fields (title, desc, heroImage.alt) |
| Build fails: "Can't resolve '@workspace/ui/components/badge'" | Badge component missing | ✅ Already added - restart dev server |
| No meta tags in source | `generateMetadata` not exported | Add `export async function generateMetadata()` |
| Schema validation error | JSON-LD syntax invalid | Paste into https://validator.schema.org/ |
| OG image broken | URL blocked | Add to `next.config.js` `images.remotePatterns` |
| Pages not indexed | No sitemap submitted | Submit `/sitemap.xml` to Search Console |

---

## 📞 Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build production
npm run start        # Start production server
npm run lint         # Check code quality
npm run typecheck    # TypeScript check

# After editing data.json
# Just refresh /seo - no rebuild needed (server components fetch fresh data)

# After adding generateMetadata
npm run build        # Rebuild to see changes
```

---

**Last Updated:** April 29, 2026  
**Estimated Total Time:** 2-3 weeks  
**Developer:** 1 full-time  
**Status:** Ready to start

---

**Got stuck?** Refer to full docs:
- `SEO-MASTER-PLAN.md` - Overview
- `SEO-IMPLEMENTATION-SUMMARY.md` - Step-by-step
- `SEO-ROUTES-SPEC.md` - Per-route details
- `DATA-JSON-SEO-TEMPLATE.md` - Field reference
