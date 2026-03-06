import type { ResourcesState, ResourcesAction } from './types';
import { resourcesInitialState } from './defaults';

export { resourcesInitialState };

export function resourcesReducer(state: ResourcesState, action: ResourcesAction): ResourcesState {
  switch (action.type) {
    case 'RS_SET_SELECTED_BRAND':
      return { ...state, selectedBrandId: action.brandId };

    case 'RS_SET_SEARCH':
      return { ...state, searchQuery: action.query };

    case 'RS_SET_FILTER':
      return { ...state, filterType: action.filterType };

    case 'RS_ADD_BRAND':
      return {
        ...state,
        brands: [...state.brands, action.brand],
        selectedBrandId: action.brand.id,
        showAddBrandModal: false,
        editingBrandId: null,
      };

    case 'RS_UPDATE_BRAND':
      return {
        ...state,
        brands: state.brands.map(b => b.id === action.brand.id ? action.brand : b),
        showAddBrandModal: false,
        editingBrandId: null,
      };

    case 'RS_DELETE_BRAND': {
      const remaining = state.brands.filter(b => b.id !== action.brandId);
      return {
        ...state,
        brands: remaining,
        resources: state.resources.filter(r => r.brandId !== action.brandId),
        selectedBrandId: state.selectedBrandId === action.brandId
          ? (remaining[0]?.id ?? null)
          : state.selectedBrandId,
      };
    }

    case 'RS_ADD_RESOURCE':
      return {
        ...state,
        resources: [...state.resources, action.resource],
        showAddResourceModal: false,
        addResourceType: null,
        editingResourceId: null,
      };

    case 'RS_UPDATE_RESOURCE':
      return {
        ...state,
        resources: state.resources.map(r => r.id === action.resource.id ? action.resource : r),
        showAddResourceModal: false,
        addResourceType: null,
        editingResourceId: null,
      };

    case 'RS_DELETE_RESOURCE':
      return {
        ...state,
        resources: state.resources.filter(r => r.id !== action.resourceId),
        editingResourceId: null,
      };

    case 'RS_SHOW_ADD_BRAND_MODAL':
      return {
        ...state,
        showAddBrandModal: action.show,
        editingBrandId: action.show ? state.editingBrandId : null,
      };

    case 'RS_SHOW_ADD_RESOURCE_MODAL':
      return {
        ...state,
        showAddResourceModal: action.show,
        addResourceType: action.resourceType ?? state.addResourceType,
        editingResourceId: action.show ? state.editingResourceId : null,
      };

    case 'RS_SET_EDITING_BRAND':
      return {
        ...state,
        editingBrandId: action.brandId,
        showAddBrandModal: action.brandId !== null,
      };

    case 'RS_SET_EDITING_RESOURCE':
      if (action.resourceId) {
        const resource = state.resources.find(r => r.id === action.resourceId);
        return {
          ...state,
          editingResourceId: action.resourceId,
          addResourceType: resource?.type ?? null,
          showAddResourceModal: true,
        };
      }
      return { ...state, editingResourceId: null };

    case 'RS_IMPORT_DATA': {
      if (action.mode === 'replace') {
        return {
          ...state,
          brands: action.brands,
          resources: action.resources,
          selectedBrandId: action.brands[0]?.id ?? null,
        };
      }
      // merge: incoming wins on id collision
      const brandMap = new Map(state.brands.map(b => [b.id, b]));
      for (const b of action.brands) brandMap.set(b.id, b);
      const resourceMap = new Map(state.resources.map(r => [r.id, r]));
      for (const r of action.resources) resourceMap.set(r.id, r);
      return {
        ...state,
        brands: Array.from(brandMap.values()),
        resources: Array.from(resourceMap.values()),
      };
    }

    case 'RS_LOAD_STATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}
