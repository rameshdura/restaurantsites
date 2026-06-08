const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const { data, error } = await supabase
    .from("table_sessions")
    .select("*")
    .eq("table_number", Number(undefined));
  console.log("Error:", error);
}
main();
