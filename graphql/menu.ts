import type { MenuItem } from "../env";
export async function getMenuByName(
  endpoint: string, 
  menuName: string, 
  username?: string,
  appPassword?: string
): Promise<MenuItem[]> {
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
          query GetMenuItemsByMenuName($menuName: ID!) {
            menu(id: $menuName, idType: NAME) {
              name
              menuItems {
                nodes {
                  id
                  label
                  order
                  parentId
                  target
                  cssClasses
                  path
                }
              }
            }
          }
        `,
        variables: { menuName }
      })
    });
    
    // Parse the response
    const data = await response.json();
    
    // Process menu items
    let menuItems: MenuItem[] = [];
    
    if (data.data?.menu) {
      menuItems = data.data.menu.menuItems.nodes;
    } else if (data.data?.menuItems) {
      menuItems = data.data.menuItems.nodes;
    } else {
      return [];
    }
    
    // Clean up paths and process menu items
    return menuItems
      .map((item: any) => {
        // Create a clean copy of the item
        const cleanItem = { ...item };
        
        // Process the path to remove /wordpress prefix
        if (cleanItem.path) {
            // console.log(cleanItem)
          // First handle home page
          if (cleanItem.path === '/wordpress/home/' || cleanItem.path === '/wordpress') {
            cleanItem.path = '/';
          } else {
            // Remove /wordpress prefix from other paths
            cleanItem.path = cleanItem.path.replace(/^\/wordpress/i, '');
            
            // Ensure path starts with /
            if (!cleanItem.path.startsWith('/')) {
              cleanItem.path = '/' + cleanItem.path;
            }
          }
        }
        
        return cleanItem;
      })
      .sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
      
  } catch (error) {
    console.error(`Error fetching ${menuName} menu:`, error);
    return [];
  }
}