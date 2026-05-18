import { getRestaurant, getImageSrc } from "./lib/restaurant";

async function main() {
  const restaurant = await getRestaurant("solmari-shin-okubo");
  const data = restaurant?.data;
  
  if (!data) return;
  
  const coverImage = getImageSrc("solmari-shin-okubo", data.hero?.slides?.[0]?.image);
  console.log("Resolved Image URL for solmari:", coverImage);
}

main();
