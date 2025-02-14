const axios = require("axios");

const strapiUrl = "http://strapi-wkcssk4ss8gc48cgkwcswksg.147.93.108.70.sslip.io";

// Admin credentials - in production these should be in .env
const adminCredentials = {
  email: "flyyourtechteam@gmail.com",
  password: "PWISYOYOstrapi@1"
};

// Get JWT token through login
const getAuthToken = async () => {
  try {
    const response = await axios.post(`${strapiUrl}/admin/login`, {
      email: adminCredentials.email,
      password: adminCredentials.password
    });
    
    return response.data.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw new Error('Authentication failed');
  }
};

// Function to create content types in Strapi
const createContentType = async (contentType, token) => {
  try {
    const response = await axios.post(
      `${strapiUrl}/content-type-builder/content-types`,
      {
        data: contentType
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`Created: ${contentType.displayName}`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.error?.details?.errors) {
      console.error('Validation errors:', JSON.stringify(error.response.data.error.details.errors, null, 2));
    }
    console.error(`Error creating collection ${contentType.displayName}:`, 
      error.response?.status,
      error.response?.statusText
    );
    throw error;
  }
};

// Create Product Collection
const createProductCollection = async (token) => {
  const productCollection = {
    singularName: "product",
    pluralName: "products",
    displayName: "Product",
    kind: "collectionType",
    info: {
      singularName: "product",
      pluralName: "products",
      displayName: "Product",
      description: "Products for sale in the store",
    },
    options: {
      draftAndPublish: true,
    },
    pluginOptions: {
      'content-manager': {
        visible: true
      },
      'content-type-builder': {
        visible: true
      }
    },
    attributes: {
      name: {
        type: "string",
        required: true,
        pluginOptions: {
          'content-manager': {
            visible: true
          }
        }
      },
      price: {
        type: "decimal",
        required: true,
        pluginOptions: {
          'content-manager': {
            visible: true
          }
        }
      },
      weight: {
        type: "integer",
        pluginOptions: {
          'content-manager': {
            visible: true
          }
        }
      },
      custom_weight: {
        type: "boolean",
        default: false,
        pluginOptions: {
          'content-manager': {
            visible: true
          }
        }
      },
      description: {
        type: "text",
        pluginOptions: {
          'content-manager': {
            visible: true
          }
        }
      },
      category: {
        type: "relation",
        relation: "manyToOne",
        target: "api::category.category",
        inversedBy: "products",
        pluginOptions: {
          'content-manager': {
            visible: true
          }
        }
      },
      stock: {
        type: "integer",
        required: true,
        pluginOptions: {
          'content-manager': {
            visible: true
          }
        }
      }
    }
  };

  await createContentType(productCollection, token);
};

// Create Category Collection
const createCategoryCollection = async (token) => {
  const categoryCollection = {
    kind: "collectionType",
    collectionName: "categories",
    info: {
      name: "Category",
      description: "Product Categories",
    },
    attributes: {
      name: { type: "string", required: true },
      description: { type: "text" },
      products: {
        type: "relation",
        relation: "oneToMany",
        target: "product",
      },
    },
  };

  await createContentType(categoryCollection, token);
};

// Create Order Collection
const createOrderCollection = async (token) => {
  const orderCollection = {
    kind: "collectionType",
    collectionName: "orders",
    info: {
      name: "Order",
      description: "Orders placed by customers",
    },
    attributes: {
      user: { type: "relation", relation: "manyToOne", target: "user" },
      total_amount: { type: "decimal", required: true },
      payment_status: { type: "string", enum: ["pending", "paid", "failed"] },
      shipping_status: { type: "string", enum: ["pending", "shipped", "delivered"] },
      is_cod: { type: "boolean", default: false },
      products: { type: "relation", relation: "manyToMany", target: "product" },
      createdAt: { type: "timestamp" },
    },
  };

  await createContentType(orderCollection, token);
};

// Create User Collection
const createUserCollection = async (token) => {
  const userCollection = {
    kind: "collectionType",
    collectionName: "users",
    info: {
      name: "User",
      description: "User information",
    },
    attributes: {
      first_name: { type: "string", required: true },
      last_name: { type: "string", required: true },
      email: { type: "email", unique: true, required: true },
      profile_pic: { type: "media" },
      addresses: {
        type: "json", // Use JSON for storing address (max 2)
        required: true,
      },
      role: {
        type: "enumeration",
        enum: ["admin", "customer", "manager"],
        default: "customer",
      },
      dob: { type: "date" },
      email_verified: { type: "boolean", default: false },
      password: { type: "password", required: true },
      createdAt: { type: "timestamp" },
    },
  };

  await createContentType(userCollection, token);
};

// Create Cart Collection (for abandoned carts)
const createCartCollection = async (token) => {
  const cartCollection = {
    kind: "collectionType",
    collectionName: "carts",
    info: {
      name: "Cart",
      description: "Cart details of users for abandoned cart functionality",
    },
    attributes: {
      user: { type: "relation", relation: "manyToOne", target: "user" },
      product: { type: "relation", relation: "manyToOne", target: "product" },
      quantity: { type: "integer" },
      createdAt: { type: "timestamp" },
    },
  };

  await createContentType(cartCollection, token);
};

// Create Inventory Collection
const createInventoryCollection = async (token) => {
  const inventoryCollection = {
    kind: "collectionType",
    collectionName: "inventory",
    info: {
      name: "Inventory",
      description: "Product stock levels",
    },
    attributes: {
      product: { type: "relation", relation: "manyToOne", target: "product" },
      stock: { type: "integer", required: true },
      createdAt: { type: "timestamp" },
    },
  };

  await createContentType(inventoryCollection, token);
};

// Create Hero Section Collection
const createHeroSectionCollection = async (token) => {
  const heroCollection = {
    kind: "collectionType",
    collectionName: "hero_sections",
    info: {
      name: "Hero Section",
      description: "Hero section banners for the website",
    },
    attributes: {
      heading: { type: "string", required: true },
      subheading: { type: "string" },
      button_text: { type: "string" },
      button_link: { type: "string" },
      hero_type: {
        type: "enumeration",
        enum: ["image", "video", "text", "product", "category"],
      },
      media_url: { type: "string" },
      createdAt: { type: "timestamp" },
    },
  };

  await createContentType(heroCollection, token);
};

// Create Coupons Collection
const createCouponsCollection = async (token) => {
  const couponsCollection = {
    kind: "collectionType",
    collectionName: "coupons",
    info: {
      name: "Coupons",
      description: "Discount coupons for products",
    },
    attributes: {
      code: { type: "string", unique: true, required: true },
      discount: { type: "decimal", required: true },
      min_order_value: { type: "decimal" },
      expires_at: { type: "date" },
      conditions: { type: "json" }, // Complex conditions stored as JSON
      createdAt: { type: "timestamp" },
    },
  };

  await createContentType(couponsCollection, token);
};

// Added proper error handling for the main function
const createAllCollections = async () => {
  try {
    // Get authentication token
    const token = await getAuthToken();
    console.log('Authentication successful, creating collections...');
    
    // Create collections with token
    await createProductCollection(token);
    await createCategoryCollection(token);
    await createOrderCollection(token);
    await createUserCollection(token);
    await createCartCollection(token);
    await createInventoryCollection(token);
    await createHeroSectionCollection(token);
    await createCouponsCollection(token);
    
    console.log('All collections created successfully');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Execute with proper error handling
createAllCollections();
