const { mapBuilderToDataJson } = require('./apps/web/lib/site-mapper');

const mockFormData = {
  siteName: 'Test Restaurant',
  siteSlug: 'test-restaurant',
  description: 'Test Description',
  address: '123 Test St',
  phone: '123-456-7890',
  email: 'test@example.com',
  language: 'EN',
  currency: 'USD',
  seoTitle: 'SEO Title',
  seoDescription: 'SEO Description',
  keywords: ['test', 'restaurant'],
  seoMenuTitle: 'Menu SEO Title',
  heroImage: 'hero.jpg',
  heroSlides: [
    { image: 'slide1.jpg', title: 'Slide 1', subtitle: 'Sub 1', ctaText: 'Go', ctaLink: '#1' }
  ],
  aboutContent: 'About Content',
  aboutAdditionalContent: ['Para 1', 'Para 2'],
  team: [
    { name: 'John Doe', role: 'Chef', bio: 'Bio', image: 'john.jpg' }
  ],
  openingHours: [
    { day: 'Mon', lunch: '11-2', lunchLO: '1:30', dinner: '5-9', dinnerLO: '8:30' }
  ],
  holidayNotes: 'Closed on Mondays',
  cuisineTypes: ['Japanese'],
  menuCategories: [
    {
      name: 'Ramen',
      items: [
        { name: 'Miso', price: '15', description: 'Yummy', isPopular: true, image: 'miso.jpg' }
      ]
    }
  ],
  reviews: []
};

try {
  const result = mapBuilderToDataJson(mockFormData);
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(e);
}
