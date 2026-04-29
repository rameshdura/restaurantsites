export interface MenuItem {
  id: string;
  name: string;
  secondaryName?: string; // Optional: e.g. native language name
  description?: string;   // Optional
  price?: string | number; // Optional
  image?: string;         // Optional
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isPopular?: boolean;
  tags?: string[];
}

export interface MenuCategory {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;    // Optional: Hero image for the section
  items: MenuItem[];
}
