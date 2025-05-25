export interface Product {
  id: string;
  databaseId?: number;
  slug: string;
  name: string;
  type?: string;
  description: string;
  shortDescription?: string;
  // Price fields
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  onSale?: boolean;
  stockStatus?: string;
  stockQuantity?: number;
  // Variations (for variable products)
  variations?: Array<{
    id: string;
    databaseId: number;
    name: string;
    sku?: string;
    description?: string;
    onSale?: boolean;
    stockQuantity?: number;
    stockStatus?: string;
    price?: string;
    regularPrice?: string;
    salePrice?: string;
    image?: {
      id: string;
      sourceUrl: string;
      altText?: string;
      mediaDetails?: {
        width: number;
        height: number;
      };
    };
    attributes?: Array<{
      id: string;
      name: string;
      value: string;
      attributeId: number;
    }>;
  }>;
  image?: {
    id: string;
    sourceUrl: string;
    altText?: string;
    mediaDetails?: {
      width: number;
      height: number;
      sizes?: Array<{
        sourceUrl: string;
        name: string;
      }>;
    };
  };
  galleryImages?: Array<{
    id: string;
    sourceUrl: string;
    altText?: string;
  }>;
  productCategories?: {
    edges?: Array<{
      node: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
    nodes?: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
  attributes?: Array<{
    id?: string;
    name: string;
    options?: string[];
    attributeId?: number;
    variation?: boolean;
    visible?: boolean;
  }>;
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    openGraph?: {
      title?: string;
      description?: string;
    };
  };
  featured?: boolean;
  catalogVisibility?: string;
  status?: string;
}

/**
 * Fetches all products with complete information
 * @param endpoint GraphQL endpoint URL
 * @param username Optional WordPress username for authentication
 * @param appPassword Optional WordPress application password
 * @returns Array of products with complete information
 */
export async function getAllProducts(
    endpoint: string,
    username?: string,
    appPassword?: string
): Promise<Product[]> {
    try {
        // Setup headers with authentication if credentials are provided
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        
        // Add Basic Auth header if username and app password are provided
        if (username && appPassword) {
            // Remove spaces from application password
            const cleanPassword = appPassword.replace(/\s+/g, '');
            
            // Use Buffer for Node.js environments or the universal btoa approach
            let authString;
            if (typeof Buffer !== 'undefined') {
                authString = Buffer.from(`${username}:${cleanPassword}`).toString('base64');
            } else {
                authString = btoa(`${username}:${cleanPassword}`);
            }
            
            headers['Authorization'] = `Basic ${authString}`;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query: `
                    query GetAllProducts {
                        products(first: 100) {
                            nodes {
                                id
                                databaseId
                                slug
                                name
                                type
                                description
                                shortDescription
                                image {
                                    id
                                    sourceUrl
                                    altText
                                }
                                ... on SimpleProduct {
                                    price(format: RAW)
                                    regularPrice(format: RAW)
                                    salePrice(format: RAW)
                                    onSale
                                }
                                ... on VariableProduct {
                                    price(format: RAW)
                                    regularPrice(format: RAW)
                                    salePrice(format: RAW)
                                    onSale
                                }
                            }
                        }
                    }
                `
            })
        });
        
        const data = await response.json();
        // console.log('Products GraphQL Response:', data);
        
        if (!data.data?.products?.nodes) {
            console.error('No products found or unexpected response structure:', data);
            return [];
        }
        
        // Map the response to our Product interface
        return data.data.products.nodes.map((product: any) => {
            return {
                id: product.id,
                databaseId: product.databaseId,
                slug: product.slug,
                name: product.name,
                type: product.type,
                description: product.description,
                shortDescription: product.shortDescription,
                price: product.price,
                regularPrice: product.regularPrice,
                salePrice: product.salePrice,
                onSale: product.onSale,
                image: product.image
            };
        });
        
    } catch (error) {
        console.error('Error fetching all products:', error);
        return [];
    }
}

/**
 * Fetches a single product by slug
 * @param endpoint GraphQL endpoint URL
 * @param slug Product slug
 * @param username Optional WordPress username for authentication
 * @param appPassword Optional WordPress application password
 * @returns Single product or null if not found
 */
export async function getProductBySlug(
  endpoint: string,
  slug: string,
  username?: string,
  appPassword?: string
): Promise<Product | null> {
  try {
    // Setup headers with authentication if credentials are provided
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add Basic Auth header if username and app password are provided
    if (username && appPassword) {
      // Remove spaces from application password
      const cleanPassword = appPassword.replace(/\s+/g, '');
      
      // Use Buffer for Node.js environments or the universal btoa approach
      let authString;
      if (typeof Buffer !== 'undefined') {
        authString = Buffer.from(`${username}:${cleanPassword}`).toString('base64');
      } else {
        authString = btoa(`${username}:${cleanPassword}`);
      }
      
      headers['Authorization'] = `Basic ${authString}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `
          query GetSingleProduct($slug: ID!) {
            product(id: $slug, idType: SLUG) {
              id
              name
              slug
              type
              description
              shortDescription
              image {
                id
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                  sizes(include: MEDIUM) {
                    sourceUrl
                    name
                  }
                }
              }
              galleryImages {
                nodes {
                  id
                  sourceUrl
                  altText
                }
              }
              productCategories {
                nodes {
                  id
                  name
                  slug
                }
              }
              ... on SimpleProduct {
                price(format: RAW)
                regularPrice(format: RAW)
                salePrice(format: RAW)
                onSale
                stockStatus
                stockQuantity
              }
              ... on VariableProduct {
                price(format: RAW)
                regularPrice(format: RAW)
                salePrice(format: RAW)
                onSale
                stockStatus
                variations(first: 50) {
                  nodes {
                    id
                    databaseId
                    name
                    sku
                    description
                    onSale
                    stockQuantity
                    stockStatus
                    price(format: RAW)
                    regularPrice(format: RAW)
                    salePrice(format: RAW)
                    image {
                      id
                      sourceUrl
                      altText
                      mediaDetails {
                        width
                        height
                      }
                    }
                    attributes {
                      nodes {
                        id
                        name
                        value
                        attributeId
                      }
                    }
                  }
                }
                attributes {
                  nodes {
                    id
                    name
                    options
                    attributeId
                    variation
                    visible
                  }
                }
              }
            }
          }
        `,
        variables: { slug }
      })
    });
    
    const data = await response.json();
    // console.log('Product GraphQL Response:', data);
    
    if (!data.data?.product) {
      console.error(`Product with slug '${slug}' not found:`, data);
      return null;
    }
    
    const product = data.data.product;
    
    // Process image URLs if needed
    // if (product.image?.sourceUrl) {
    //   product.image.sourceUrl = product.image.sourceUrl.replace(/^https?:\/\/[^\/]+\/wordpress/i, '');
    // }
    
    // Process gallery images
    // if (product.galleryImages?.nodes) {
    //   product.galleryImages.nodes = product.galleryImages.nodes.map((img: any) => ({
    //     ...img,
    //     sourceUrl: img.sourceUrl?.replace(/^https?:\/\/[^\/]+\/wordpress/i, '') || img.sourceUrl
    //   }));
    // }
    
    // Process variations if they exist (for variable products)
    let variations = [];
    if (product.variations?.nodes) {
      variations = product.variations.nodes.map((variation: any) => ({
        id: variation.id,
        databaseId: variation.databaseId,
        name: variation.name,
        sku: variation.sku,
        description: variation.description,
        onSale: variation.onSale,
        stockQuantity: variation.stockQuantity,
        stockStatus: variation.stockStatus,
        price: variation.price,
        regularPrice: variation.regularPrice,
        salePrice: variation.salePrice,
        image: variation.image ? {
          ...variation.image,
          sourceUrl: variation.image.sourceUrl?.replace(/^https?:\/\/[^\/]+\/wordpress/i, '') || variation.image.sourceUrl
        } : undefined,
        attributes: variation.attributes?.nodes || []
      }));
    }
    
    // Transform attributes
    const attributes = product.attributes?.nodes?.map((attr: any) => ({
      id: attr.id,
      name: attr.name,
      options: attr.options || [],
      attributeId: attr.attributeId,
      variation: attr.variation,
      visible: attr.visible
    })) || [];
    
    // Transform categories to match both edges and nodes structure
    const productCategories = {
      nodes: product.productCategories?.nodes || [],
      edges: product.productCategories?.nodes?.map((node: any) => ({ node })) || []
    };
    
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      type: product.type,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
      onSale: product.onSale,
      stockStatus: product.stockStatus,
      stockQuantity: product.stockQuantity,
      variations,
      image: product.image,
      galleryImages: product.galleryImages?.nodes || [],
      productCategories,
      attributes,
      featured: product.featured,
      catalogVisibility: product.catalogVisibility,
      status: product.status
    };
    
  } catch (error) {
    console.error(`Error fetching product with slug '${slug}':`, error);
    return null;
  }
}