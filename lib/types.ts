export interface SiteSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  favicon?: {
    url: string;
    alt?: string;
  };
  ogImage?: {
    url: string;
    alt?: string;
  };
  themeColors?: {
    art?: string;
    design?: string;
  };
  seo?: {
    author?: string;
    twitterHandle?: string;
    siteUrl?: string;
  };
}

export interface CVItem {
  _key: string;
  year: string;
  text: any[]; // Portable text blocks
}

export interface Client {
  _key: string;
  name: string;
  url?: string;
}

export interface About {
  _id: string;
  discipline: 'art' | 'design';
  bio?: any[]; // Portable text blocks
  cv?: CVItem[];
  services?: string[]; // Tag names for services
  clients?: Client[];
  email: string;
}