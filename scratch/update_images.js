const fs = require('fs');

function updateFile(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  if (!data.images.heroImage) {
    data.images.heroImage = {
      url: "",
      alt: "",
      credit: ""
    };
  }
  if (!data.images.coverImage) {
    data.images.coverImage = {
      url: "",
      alt: "",
      credit: ""
    };
  }
  if (!data.images.team) {
    data.images.team = [];
  }

  // schema.aggregateRating
  if (!data.schema) data.schema = {};
  if (!data.schema.aggregateRating) {
    data.schema.aggregateRating = {
      ratingValue: 0,
      reviewCount: 0,
      bestRating: 5,
      worstRating: 1,
      source: "",
      sourceUrl: ""
    };
  }

  // Update SEO
  const seoDefaults = {
    title: "",
    description: "",
    keywords: [],
    menuTitle: "",
    menuDescription: "",
    aboutTitle: "",
    aboutDescription: "",
    contactTitle: "",
    contactDescription: "",
    brandTitle: "",
    brandDescription: "",
    companyTitle: "",
    companyDescription: "",
    noindex: false
  };
  data.seo = { ...seoDefaults, ...data.seo };

  // Update companyInfo
  const companyInfoDefaults = {
    name: "",
    legalName: "",
    registrationNumber: "",
    address: "",
    phone: "",
    establishedDate: "",
    capital: "",
    fiscalYearEnd: "",
    representative: "",
    businessPurpose: "",
    annualReportUrl: ""
  };
  data.companyInfo = { ...companyInfoDefaults, ...data.companyInfo };

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

updateFile('templates/restaurant-boilerplate/data.json');
updateFile('templates/restaurant-boilerplate/data-jp.json');
console.log('Images, schema, seo, companyInfo updated.');
