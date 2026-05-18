import { getRestaurant, getImageSrc } from "./lib/restaurant";

async function main() {
  const restaurant = await getRestaurant("ramen-taro");
  const data = restaurant?.data;
  
  if (!data) return;
  
  console.log("Original Image URL:", data.hero?.slides?.[0]?.image);
  
  const coverImage = getImageSrc("ramen-taro", data.hero?.slides?.[0]?.image);
  console.log("Resolved Image URL:", coverImage);
}

main();
