import { Client, Databases, Query } from "appwrite";

const client = new Client();
const databases = new Databases(client);

// Set up Appwrite client using environment variables
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) // Appwrite endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID); // Appwrite project ID

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Search query is required" });
  }

  const searchTerms = query.toLowerCase().split(" ");

  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, // Database ID from env
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRODUCTS_ID, // Products collection ID from env
    );

    // Filter documents for matches in name, category, or color
    const matchedProducts = response.documents.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const categories = product.category?.map((cat) => cat.toLowerCase()) || [];
      const colors = product.colors?.map((col) => col.toLowerCase()) || [];

      return searchTerms.some((term) => 
        name.includes(term) || 
        categories.some((cat) => cat.includes(term)) || 
        colors.some((col) => col.includes(term))
      );
    });

    return res.status(200).json({ products: matchedProducts });
  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json({ error: "Failed to search products" });
  }
}
