import type { Post } from "../env";
/**
 * Fetches all blog posts with summary information
 * @param endpoint GraphQL endpoint URL
 * @param username Optional WordPress username for authentication
 * @param appPassword Optional WordPress application password
 * @returns Array of posts with summary information
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
        `
      })
    });
    
    const data = await response.json();
    if (!data.data?.posts?.edges) {
        console.error('No posts found or unexpected response structure:', data);
        return [];
    }
    
    // Map the response to our Post interface
    return data.data.posts.edges.map((edge: any) => {
        const post = edge.node;
      
      return post;
    });
    
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
}

/**
 * Fetches a single blog post by its slug
 * @param endpoint GraphQL endpoint URL
 * @param slug Post slug to fetch
 * @param username Optional WordPress username for authentication
 * @param appPassword Optional WordPress application password
 * @returns Single post object or null if not found
 */
export async function getPostBySlug(
  endpoint: string,
  slug: string,
  username?: string,
  appPassword?: string
): Promise<Post | null> {
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
          query GetPostBySlug($slug: ID!) {
            post(id: $slug, idType: SLUG) {
              id
              slug
              title
              date
              content(format: RENDERED)
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
        `,
        variables: { slug }
      })
    });
    
    const data = await response.json();
    
    if (!data.data?.post) {
      console.error(`Post with slug '${slug}' not found or error in response:`, data);
      return null;
    }
    
    const post = data.data.post;
    
    // Process image URLs if needed
    if (post.featuredImage?.node?.sourceUrl) {
      // Clean up WordPress URLs if needed
      post.featuredImage.node.sourceUrl = post.featuredImage.node.sourceUrl.replace(/^https?:\/\/[^\/]+\/wordpress/i, '');
    }
    
    return post;
    
  } catch (error) {
    console.error(`Error fetching post with slug '${slug}':`, error);
    return null;
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

/**
 * Fetches recent posts
 * @param endpoint GraphQL endpoint URL
 * @param count Number of recent posts to fetch
 * @param username Optional WordPress username for authentication
 * @param appPassword Optional WordPress application password
 * @returns Array of most recent posts
 */
export async function getRecentPosts(
  endpoint: string,
  count: number = 5,
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
          query GetRecentPosts($count: Int!) {
            posts(first: $count, where: {orderby: {field: DATE, order: DESC}}) {
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
                }
              }
            }
          }
        `,
        variables: { count }
      })
    });
    
    const data = await response.json();
    
    if (!data.data?.posts?.edges) {
      console.error('No recent posts found or unexpected response:', data);
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
    console.error('Error fetching recent posts:', error);
    return [];
  }
}