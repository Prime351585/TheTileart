export interface PageSEO {
  title: string;
  metaDescription: string;
  canonicalUrl?: string;
  openGraph?: {
    title?: string;
    description?: string;
  };
}

/**
 * Fetches SEO data (title and meta description) for a specific page
 * @param endpoint GraphQL endpoint URL
 * @param pageSlug Page slug or name to fetch SEO data for
 * @param username Optional WordPress username for authentication
 * @param appPassword Optional WordPress application password
 * @returns Page SEO data or null if not found
 */
export async function getPageSEO(
  endpoint: string,
  pageSlug: string,
  username?: string,
  appPassword?: string
): Promise<PageSEO | null> {
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
          query GetPageSEO($pageSlug: ID!) {
            page(id: $pageSlug, idType: URI) {
              id
              title
              slug
              seo {
                breadcrumbTitle
                canonicalUrl
                description
                title
                openGraph {
                  description
                  title
                }
              }
            }
          }
        `,
        variables: { pageSlug }
      })
    });
    
    const data = await response.json();
    
    if (!data.data?.page) {
      console.error(`Page with slug '${pageSlug}' not found:`, data);
      return null;
    }
    
    const page = data.data.page;
    
    // Extract title - prefer SEO title, fallback to page title
    const title = page.seo?.title || page.title || '';
    
    // Extract meta description
    let metaDescription = '';
    if (page.seo?.description) {
      metaDescription = page.seo.description;
    } else if (page.seo?.openGraph?.description) {
      metaDescription = page.seo.openGraph.description;
    }
    
    return {
      title,
      metaDescription,
      canonicalUrl: page.seo?.canonicalUrl,
      openGraph: {
        title: page.seo?.openGraph?.title,
        description: page.seo?.openGraph?.description
      }
    };
    
  } catch (error) {
    console.error(`Error fetching SEO data for page '${pageSlug}':`, error);
    return null;
  }
}

/**
 * Fetches SEO data for multiple pages at once
 * @param endpoint GraphQL endpoint URL
 * @param pageSlugs Array of page slugs to fetch SEO data for
 * @param username Optional WordPress username for authentication
 * @param appPassword Optional WordPress application password
 * @returns Map of page slugs to their SEO data
 */
export async function getMultiplePagesSEO(
  endpoint: string,
  pageSlugs: string[],
  username?: string,
  appPassword?: string
): Promise<Map<string, PageSEO>> {
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
          query GetMultiplePagesSEO {
            pages(first: 100) {
              nodes {
                id
                title
                slug
                seo {
                  breadcrumbTitle
                  canonicalUrl
                  description
                  title
                  openGraph {
                    description
                    title
                  }
                }
              }
            }
          }
        `
      })
    });
    
    const data = await response.json();
    
    if (!data.data?.pages?.nodes) {
      console.error('No pages found:', data);
      return new Map();
    }
    
    const seoMap = new Map<string, PageSEO>();
    
    data.data.pages.nodes.forEach((page: any) => {
      // Only include pages that were requested
      if (pageSlugs.includes(page.slug)) {
        // Extract title - prefer SEO title, fallback to page title
        const title = page.seo?.title || page.title || '';
        
        // Extract meta description
        let metaDescription = '';
        if (page.seo?.description) {
          metaDescription = page.seo.description;
        } else if (page.seo?.openGraph?.description) {
          metaDescription = page.seo.openGraph.description;
        }
        
        seoMap.set(page.slug, {
          title,
          metaDescription,
          canonicalUrl: page.seo?.canonicalUrl,
          openGraph: {
            title: page.seo?.openGraph?.title,
            description: page.seo?.openGraph?.description
          }
        });
      }
    });
    
    return seoMap;
    
  } catch (error) {
    console.error('Error fetching multiple pages SEO data:', error);
    return new Map();
  }
}

/**
 * Helper function to get common page SEO data during build time
 * @param endpoint GraphQL endpoint URL
 * @param username Optional WordPress username for authentication
 * @param appPassword Optional WordPress application password
 * @returns Object with SEO data for common pages
 */
export async function getCommonPagesSEO(
  endpoint: string,
  username?: string,
  appPassword?: string
) {
  const commonPages = ['home', 'about', 'contact', 'shop', 'gallery', 'services'];
  const seoMap = await getMultiplePagesSEO(endpoint, commonPages, username, appPassword);
  
  return {
    home: seoMap.get('home') || { title: 'TileArt - Beautiful Tile Designs', metaDescription: 'Transform your space with premium ceramic and porcelain tiles' },
    about: seoMap.get('about') || { title: 'About Us - TileArt', metaDescription: 'Learn about TileArt and our commitment to quality tile designs' },
    contact: seoMap.get('contact') || { title: 'Contact Us - TileArt', metaDescription: 'Get in touch with TileArt for all your tile design needs' },
    shop: seoMap.get('shop') || { title: 'Shop Tiles - TileArt', metaDescription: 'Browse our collection of premium tiles and tile designs' },
    gallery: seoMap.get('gallery') || { title: 'Gallery - TileArt', metaDescription: 'View our gallery of beautiful tile installations and designs' },
    services: seoMap.get('services') || { title: 'Services - TileArt', metaDescription: 'Professional tile installation and design services' }
  };
}