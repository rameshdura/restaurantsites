const fs = require('fs');

function updateFile(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  // Update menu items
  const menuDefaults = {
    isPopular: false,
    isVegetarian: false,
    isVegan: false,
    isSpicy: false,
    spiceLevel: 0,
    allergens: [],
    calories: 0,
    ingredients: [],
    available: true,
    availableFrom: "",
    availableTo: "",
    size: "",
    limited: false,
    availableUntil: "",
    options: []
  };

  data.menuCategories.forEach(cat => {
    cat.items = cat.items.map(item => ({ ...menuDefaults, ...item }));
    // ensure options exists
    cat.items.forEach(item => {
      if (!item.options) item.options = [];
    });
  });

  data.menu = data.menu.map(item => ({ ...menuDefaults, ...item }));
  data.menu.forEach(item => {
    if (!item.options) item.options = [];
  });

  // Update about section
  const aboutDefaults = {
    title: "",
    content: "",
    shortDescription: "",
    mission: "",
    philosophy: "",
    additionalContent: [],
    foundedYear: 0,
    foundingLocation: "",
    founder: {
      name: "",
      role: "",
      bio: "",
      image: "",
      qualifications: [],
      social: {},
      since: ""
    },
    awards: [],
    keywordsByPage: {
      home: [],
      about: [],
      menu: [],
      contact: []
    },
    images: [],
    image: "",
    team: []
  };

  data.about = { ...aboutDefaults, ...data.about };

  // Write back
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

updateFile('templates/restaurant-boilerplate/data.json');
updateFile('templates/restaurant-boilerplate/data-jp.json');
console.log('Templates updated successfully.');
