const fs = require('fs');

function updateFile(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  if (!data.social) data.social = {};
  if (!data.social.twitterSite) data.social.twitterSite = "";

  if (!data.localSEO) data.localSEO = {};
  if (!data.localSEO.neighborhood) data.localSEO.neighborhood = "";
  
  if (!data.contact) data.contact = {};
  if (!data.contact.location) data.contact.location = {};
  if (!data.contact.location.embedUrl) data.contact.location.embedUrl = "";

  if (!data.videos) data.videos = [];
  if (!data.virtualTour) data.virtualTour = "";
  if (!data.reservation) data.reservation = {};
  if (!data.tables) data.tables = [];
  if (!data.numberOfEmployees) data.numberOfEmployees = 0;
  if (!data.knowsLanguage) data.knowsLanguage = [];
  if (!data.cuisineType) data.cuisineType = "";

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

updateFile('templates/restaurant-boilerplate/data.json');
updateFile('templates/restaurant-boilerplate/data-jp.json');
console.log('Social, localSEO, contact updated.');
