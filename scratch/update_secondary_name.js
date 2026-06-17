const fs = require('fs');

function updateFile(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  data.menuCategories.forEach(cat => {
    cat.items.forEach(item => {
      if (!item.secondaryName) item.secondaryName = "";
    });
  });

  data.menu.forEach(item => {
    if (!item.secondaryName) item.secondaryName = "";
  });

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

updateFile('templates/restaurant-boilerplate/data.json');
updateFile('templates/restaurant-boilerplate/data-jp.json');
console.log('secondaryName updated.');
