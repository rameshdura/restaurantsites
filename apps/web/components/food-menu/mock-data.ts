import { MenuCategory, MenuItem } from "./types"

const generateItems = (category: string, count: number): MenuItem[] => {
  return Array.from({ length: count }).map((_, i) => {
    const item: MenuItem = {
      id: `${category}-${i}`,
      name: `${category} Item ${i + 1}`,
      description: `Delicious ${category.toLowerCase()} prepared with fresh ingredients.`,
      price: 10 + i,
      image: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800&sig=${category}-${i}`,
    }

    // Add some options to specific items to demonstrate the feature
    if (i % 3 === 0) {
      if (category === "Drink") {
        item.options = [
          {
            id: `size-${i}`,
            name: "Size",
            selections: [
              { id: "reg", name: "Regular", price: 0 },
              { id: "lrg", name: "Large", price: 2 },
            ],
          },
          {
            id: `ice-${i}`,
            name: "Ice Level",
            selections: [
              { id: "normal", name: "Normal Ice", price: 0 },
              { id: "less", name: "Less Ice", price: 0 },
              { id: "none", name: "No Ice", price: 0 },
            ],
          },
        ]
      } else if (category === "Main") {
        item.options = [
          {
            id: `protein-${i}`,
            name: "Choose Protein",
            selections: [
              { id: "chicken", name: "Chicken", price: 0 },
              { id: "beef", name: "Beef", price: 3 },
              { id: "tofu", name: "Tofu", price: 0 },
            ],
          },
          {
            id: `side-${i}`,
            name: "Choose Side",
            selections: [
              { id: "fries", name: "French Fries", price: 0 },
              { id: "salad", name: "House Salad", price: 1.5 },
            ],
          },
        ]
      } else {
        item.options = [
          {
            id: `spice-${i}`,
            name: "Spice Level",
            selections: [
              { id: "mild", name: "Mild", price: 0 },
              { id: "medium", name: "Medium", price: 0 },
              { id: "hot", name: "Hot", price: 0 },
            ],
          },
        ]
      }
    }

    return item
  })
}

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
]
