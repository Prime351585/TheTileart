// Define interface for menu items
// Add this interface if it doesn't exist elsewhere
interface MenuItem {
  id: string;
  label: string;
  order: number;
  parentId: string | null;
  target: string | null;
  cssClasses: string[];
  path: string;
  children?: MenuItem[]; // For menu tree building
}

interface MenuResponse {
  menu: {
    name: string;
    menuItems: {
      nodes: MenuItem[];
    };
  };
}

export interface Category {
  id: string;
  name?: string;
  slug?: string;
}

export interface FeaturedImage {
  node: {
    altText: string;
    filePath?: string;
    sourceUrl?: string;
  };
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  featuredImage?: FeaturedImage;
  categories?: {
    edges: Array<{
      node: Category;
    }>;
  };
}
