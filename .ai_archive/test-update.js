const fetch = require("node-fetch");
async function test() {
  const res = await fetch("http://localhost:3000/api/table/session?session_id=1");
  console.log(await res.text());
}
test();
