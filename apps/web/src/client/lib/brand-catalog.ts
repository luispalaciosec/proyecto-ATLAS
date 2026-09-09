import type { BrandsResponseProduct } from '../../presentation/map-brand.js';
import { fetchBrands } from '../api/client.js';
import { applyBrandCatalog, getState } from '../state/app-state.js';

export async function loadBrandCatalog(): Promise<BrandsResponseProduct> {
  const payload = await fetchBrands(getState().activeWorkspace);
  applyBrandCatalog(payload);
  return payload;
}

export async function refreshBrandCatalog(): Promise<BrandsResponseProduct> {
  return loadBrandCatalog();
}
