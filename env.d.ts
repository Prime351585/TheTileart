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
// Add this to your env.ts or wherever your Post interface is defined
// Update your Post interface in env.ts

export interface Post {
  id: string;
  databaseId?: number;
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  metaDescription?: string;
  seo?: {
    breadcrumbTitle?: string;
    canonicalUrl?: string;
    description?: string;
    focusKeywords?: string[];
    fullHead?: string;
    jsonLd?: {
      raw?: string;
    };
    openGraph?: {
      description?: string;
      locale?: string;
      siteName?: string;
      title?: string;
      type?: string;
      url?: string;
      twitterMeta?: {
        card?: string;
        description?: string;
        title?: string;
      };
    };
    robots?: string;
    title?: string;
    isPillarContent?: boolean;
    seoScore?: {
      badgeHtml?: string;
      hasFrontendScore?: boolean;
      rating?: string;
      score?: number;
    };
  };
  featuredImage?: {
    node: {
      altText: string;
      sourceUrl?: string;
    };
  };
  categories?: {
    edges: Array<{
      node: {
        id: string;
        name?: string;
        slug?: string;
      };
    }>;
  };
  author?: {
    node: {
      name?: string;
      slug?: string;
    };
  };
}