import type { Post } from "../env";
/**
 * Fetches all blog posts with complete information
 * @param endpoint GraphQL endpoint URL
 * @param username Optional WordPress username for authentication
 * @param appPassword Optional WordPress application password
 * @returns Array of posts with complete information
 */
export async function getAllPosts(
  endpoint: string,
  username?: string,
  appPassword?: string
): Promise<Post[]> {
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
          query GetAllPosts {
            posts(first: 100) {
              nodes {
                databaseId
                id
                slug
                title
                date
                content(format: RENDERED)
                excerpt(format: RENDERED)
                seo {
                  breadcrumbTitle
                  canonicalUrl
                  description
                  focusKeywords
                  fullHead
                  jsonLd {
                    raw
                  }
                  openGraph {
                    description
                    locale
                    siteName
                    title
                    type
                    url
                    twitterMeta {
                      card
                      description
                      title
                    }
                  }
                  robots
                  title
                  isPillarContent
                  seoScore {
                    badgeHtml
                    hasFrontendScore
                    rating
                    score
                  }
                }
                featuredImage {
                  node {
                    altText
                    sourceUrl
                  }
                }
                categories {
                  nodes {
                    id
                    name
                    slug
                  }
                }
                author {
                  node {
                    name
                    slug
                  }
                }
              }
            }
          }
        `
      })
    });
    
    const data = await response.json();
    // console.log('GraphQL Response:', data);
    
    if (!data.data?.posts?.nodes) {
      console.error('No posts found or unexpected response structure:', data);
      return [];
    }
    
    // Map the response to our Post interface
    return data.data.posts.nodes.map((post: any) => {

      // Extract meta description from RankMath SEO
      let metaDescription = '';
      if (post.seo?.description) {
        metaDescription = post.seo.description;
      } else if (post.seo?.openGraph?.description) {
        metaDescription = post.seo.openGraph.description;
      } else if (post.excerpt) {
        // If no meta description is found, generate one from the excerpt
        // Strip HTML and limit to ~160 characters
        metaDescription = post.excerpt
          .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
          .substring(0, 157).trim();
        
        if (metaDescription.length >= 157) {
          metaDescription += "...";
        }
      }
      
      // Transform categories from nodes structure to edges structure for compatibility
      const categories = {
        edges: post.categories?.nodes?.map((category: any) => ({
          node: category
        })) || []
      };
    //   console.log(metaDescription)
      return {
        id: post.id,
        databaseId: post.databaseId,
        slug: post.slug,
        title: post.title,
        date: post.date,
        content: post.content,
        excerpt: post.excerpt,
        metaDescription,
        seo: post.seo,
        featuredImage: post.featuredImage,
        categories,
        author: post.author
      };
    });
    
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
}

/**
 * Fetches posts by category
 * @param endpoint GraphQL endpoint URL
 * @param categorySlug Category slug to fetch posts for
 * @param username Optional WordPress username for authentication
 * @param appPassword Optional WordPress application password
 * @returns Array of posts in the specified category
 */
export async function getPostsByCategory(
  endpoint: string,
  categorySlug: string,
  username?: string,
  appPassword?: string
): Promise<Post[]> {
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
          query GetPostsByCategory($categorySlug: String!) {
            posts(where: {categoryName: $categorySlug}, first: 100) {
              edges {
                node {
                  id
                  slug
                  title
                  date
                  excerpt(format: RENDERED)
                  featuredImage {
                    node {
                      altText
                      sourceUrl
                    }
                  }
                  categories {
                    edges {
                      node {
                        id
                        name
                        slug
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { categorySlug }
      })
    });
    
    const data = await response.json();
    
    if (!data.data?.posts?.edges) {
      console.error(`No posts found in category '${categorySlug}' or unexpected response:`, data);
      return [];
    }
    
    // Map the response to our Post interface
    return data.data.posts.edges.map((edge: any) => {
      const post = edge.node;
      
      // Process paths for WordPress URLs if needed
      if (post.featuredImage?.node?.sourceUrl) {
        // Clean up WordPress URLs if needed
        post.featuredImage.node.sourceUrl = post.featuredImage.node.sourceUrl.replace(/^https?:\/\/[^\/]+\/wordpress/i, '');
      }
      
      return post;
    });
    
  } catch (error) {
    console.error(`Error fetching posts for category '${categorySlug}':`, error);
    return [];
  }
}
