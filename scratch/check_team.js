const fs = require('fs');
const data = JSON.parse(fs.readFileSync('templates/restaurant-boilerplate/data.json', 'utf8'));
console.log(Object.keys(data.about));
console.log(Object.keys(data.images));
