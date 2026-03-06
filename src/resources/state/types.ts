export type ResourceType = 'color' | 'logo' | 'font' | 'link' | 'image';

export interface Brand {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  updatedAt: number;
  createdAt: number;
}

export interface BaseResource {
  id: string;
  brandId: string;
  name: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ColorResource extends BaseResource {
  type: 'color';
  colors: { name?: string; hex: string }[];
}

export interface LogoResource extends BaseResource {
  type: 'logo';
  fileType: 'svg' | 'png' | 'jpg';
  fileName: string;
  fileData: string; // base64
  variant?: string;
}

export interface FontResource extends BaseResource {
  type: 'font';
  fontName: string;
  source: 'google' | 'upload' | 'link';
  url?: string;
  fileData?: string; // base64-encoded font file (for upload source)
  fileType?: 'ttf' | 'otf' | 'woff' | 'woff2';
  previewText?: string;
}

export interface LinkResource extends BaseResource {
  type: 'link';
  label: string;
  url: string;
}

export interface ImageResource extends BaseResource {
  type: 'image';
  fileName: string;
  fileData: string; // base64
  tags?: string[];
}

export type Resource = ColorResource | LogoResource | FontResource | LinkResource | ImageResource;

export interface ResourcesState {
  brands: Brand[];
  resources: Resource[];
  selectedBrandId: string | null;
  searchQuery: string;
  filterType: ResourceType | 'all';
  showAddBrandModal: boolean;
  showAddResourceModal: boolean;
  addResourceType: ResourceType | null;
  editingBrandId: string | null;
  editingResourceId: string | null;
}

export type ResourcesAction =
  | { type: 'RS_SET_SELECTED_BRAND'; brandId: string | null }
  | { type: 'RS_SET_SEARCH'; query: string }
  | { type: 'RS_SET_FILTER'; filterType: ResourceType | 'all' }
  | { type: 'RS_ADD_BRAND'; brand: Brand }
  | { type: 'RS_UPDATE_BRAND'; brand: Brand }
  | { type: 'RS_DELETE_BRAND'; brandId: string }
  | { type: 'RS_ADD_RESOURCE'; resource: Resource }
  | { type: 'RS_UPDATE_RESOURCE'; resource: Resource }
  | { type: 'RS_DELETE_RESOURCE'; resourceId: string }
  | { type: 'RS_SHOW_ADD_BRAND_MODAL'; show: boolean }
  | { type: 'RS_SHOW_ADD_RESOURCE_MODAL'; show: boolean; resourceType?: ResourceType }
  | { type: 'RS_SET_EDITING_BRAND'; brandId: string | null }
  | { type: 'RS_SET_EDITING_RESOURCE'; resourceId: string | null }
  | { type: 'RS_IMPORT_DATA'; brands: Brand[]; resources: Resource[]; mode: 'merge' | 'replace' }
  | { type: 'RS_LOAD_STATE'; state: Partial<ResourcesState> };
