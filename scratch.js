const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./apps/web/restaurants/solmari-shin-okubo/data.json', 'utf8'));

function normaliseBlockSchema(data) {
  const home = data.pages?.home;
  if (home && !data.hero) {
    const heroSection = home.sections.find((s) => s.id === "hero")
    if (heroSection) {
      data.hero = { slides: heroSection.data.slides ?? [] }
    }
  }
  return data;
}

const normData = normaliseBlockSchema(data);
console.log("Pages about:", normData.pages?.about);
console.log("Hero slides:", normData.hero?.slides);
const coverImg = normData.pages?.about?.coverImage || normData.hero?.slides?.[0]?.image;
console.log("CoverImg source:", coverImg);
