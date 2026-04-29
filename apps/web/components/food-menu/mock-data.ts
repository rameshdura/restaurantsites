import { MenuCategory } from "./types";

const generateItems = (category: string, count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${category}-${i}`,
    name: `${category} Item ${i + 1}`,
    description: `Delicious ${category.toLowerCase()} prepared with fresh ingredients.`,
    price: 10 + i,
    image: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800&sig=${category}-${i}`,
  }));
};

export const MOCK_MENU: MenuCategory[] = [
  {
    id: "starters",
    title: "Starters",
    items: generateItems("Starter", 10),
  },
  {
    id: "mains",
    title: "Mains",
    items: generateItems("Main", 10),
  },
  {
    id: "desserts",
    title: "Desserts",
    items: generateItems("Dessert", 10),
  },
  {
    id: "drinks",
    title: "Drinks",
    items: generateItems("Drink", 10),
  },
];
