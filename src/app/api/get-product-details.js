import { Client, Databases } from "appwrite";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  try {
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

    const databases = new Databases(client); // Fetch product details

    const productResponse = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRODUCTS_ID,
      id
    );

    res.status(200).json({ success: true, product: productResponse });
  } catch (error) {
    console.error("Error fetching product details:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch product details" });
  }
}
