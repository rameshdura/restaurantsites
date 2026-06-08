import { getRestaurant } from "./apps/web/lib/restaurant";
async function main() {
  const res = await getRestaurant("ramen-taro");
  console.log(JSON.stringify(res?.data.hero, null, 2));
}
main();
