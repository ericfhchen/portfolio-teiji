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