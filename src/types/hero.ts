export interface MediaFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: null;
  size: number;
  width: number;
  height: number;
  sizeInBytes?: number;
}

export interface MediaUrl {
  id: number;
  documentId: string;
  name: string;
  alternativeText: null | string;
  caption: null | string;
  width: number | null;
  height: number | null;
  formats: {
    large?: MediaFormat;
    small?: MediaFormat;
    medium?: MediaFormat;
    thumbnail?: MediaFormat;
  } | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: null | string;
  provider: string;
  provider_metadata: null | any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface HeroSection {
  id: number;
  documentId: string;
  Heading: string;
  Subheading: string;
  Button_Text: string;
  Button_handle: string;
  Hero_Type: 'video' | 'image';
  handle_link_type: 'product' | 'category' | 'page';
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  media_url: MediaUrl;
}

export interface HeroSectionResponse {
  data: HeroSection[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  }
}

export interface HeroSectionState {
  heroSections: HeroSection[];
  loading: boolean;
  error: string | null;
}
