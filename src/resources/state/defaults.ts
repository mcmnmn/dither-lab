import type { ResourcesState, ResourceType } from './types';

export const resourcesInitialState: ResourcesState = {
  brands: [],
  resources: [],
  selectedBrandId: null,
  searchQuery: '',
  filterType: 'all',
  showAddBrandModal: false,
  showAddResourceModal: false,
  addResourceType: null,
  editingBrandId: null,
  editingResourceId: null,
};

export const RESOURCE_TYPE_OPTIONS: { value: ResourceType | 'all'; label: string }[] = [
  { value: 'all',   label: 'All' },
  { value: 'color', label: 'Colors' },
  { value: 'logo',  label: 'Logos' },
  { value: 'font',  label: 'Fonts' },
  { value: 'link',  label: 'Links' },
  { value: 'image', label: 'Images' },
];
