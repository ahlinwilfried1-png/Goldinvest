import fetch from "node-fetch";

const countries = ['TG', 'CI', 'BJ', 'SN', 'ML', 'BF', 'CM', 'GN', 'COD', 'COG'];

async function run() {
  for (const c of countries) {
    try {
      const response = await fetch(`https://sendavapay.com/api/sdk/v1/operators/${c}`, {
        method: "GET",
        headers: {
          "Authorization": "Bearer sdk_dt7N8ZAaw0zVc9WwjJWaDtdAJm5OCGNt"
        }
      });
      const data: any = await response.json();
      console.log(`=== COUNTRY: ${c} ===`);
      if (data.success && data.data) {
        for (const op of data.data) {
          console.log(`  ID: ${op.id} | Name: ${op.name} | Slug: ${op.slug} | Available: ${op.available}`);
        }
      } else {
        console.log(`  Failed to load:`, data);
      }
    } catch (e: any) {
      console.error(`  Error for ${c}:`, e.message);
    }
  }
}
run().catch(console.error);
