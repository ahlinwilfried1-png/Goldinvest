import fetch from "node-fetch";

async function run() {
  const response = await fetch("https://sendavapay.com/api/sdk/v1/operators/CM", {
    method: "GET",
    headers: {
      "Authorization": "Bearer sdk_dt7N8ZAaw0zVc9WwjJWaDtdAJm5OCGNt"
    }
  });
  console.log("status:", response.status);
  const data: any = await response.json();
  console.log("operators for CM:", JSON.stringify(data, null, 2));
}
run().catch(console.error);
