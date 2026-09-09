import { t } from '../i18n/index.js';
import type { ActivityItemProduct } from './map-activity.js';

export interface BrandActivityPreviewProduct {
  readonly id: string;
  readonly title: string;
  readonly occurredAt: string;
}

export interface BrandProduct {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly isGeneral: boolean;
  readonly isActive: boolean;
  readonly knowledgeCount?: number;
  readonly recentActivity?: readonly BrandActivityPreviewProduct[];
  readonly hasConfiguredContext?: boolean;
}

export interface BrandsResponseProduct {
  readonly activeBrandId: string;
  readonly brands: readonly BrandProduct[];
}

export interface CreateBrandResponseProduct {
  readonly brand: BrandProduct;
}

export interface RawBrandProfile {
  readonly name: string;
  readonly purpose: string;
  readonly tone: string;
  readonly processes: readonly string[];
  readonly clients: readonly string[];
  readonly rules: readonly string[];
}

export interface RawBrandRecord {
  readonly id: string;
  readonly profile: RawBrandProfile;
  readonly knowledgeCount?: number;
  readonly recentActivity?: readonly ActivityItemProduct[];
}

function profileDescription(profile: RawBrandProfile): string | undefined {
  if (profile.purpose.trim().length > 0) {
    return profile.purpose.trim();
  }

  return undefined;
}

function hasConfiguredContext(profile: RawBrandProfile): boolean {
  return (
    profile.purpose.trim().length > 0 ||
    profile.tone.trim().length > 0 ||
    profile.processes.length > 0 ||
    profile.clients.length > 0 ||
    profile.rules.length > 0
  );
}

function mapActivityPreview(
  items: readonly ActivityItemProduct[] | undefined,
): readonly BrandActivityPreviewProduct[] | undefined {
  if (items === undefined || items.length === 0) {
    return undefined;
  }

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    occurredAt: item.occurredAt,
  }));
}

export function mapBrandToProduct(record: RawBrandRecord, activeBrandId: string): BrandProduct {
  const isGeneral = record.id === 'default';
  const description = isGeneral
    ? t('brands.generalDescription')
    : profileDescription(record.profile);

  const brand: BrandProduct = {
    id: record.id,
    name: isGeneral ? t('workspace.general') : record.profile.name.trim() || record.id,
    isGeneral,
    isActive: record.id === activeBrandId,
    ...(description !== undefined ? { description } : {}),
    ...(record.knowledgeCount !== undefined ? { knowledgeCount: record.knowledgeCount } : {}),
    ...(mapActivityPreview(record.recentActivity) !== undefined
      ? { recentActivity: mapActivityPreview(record.recentActivity) }
      : {}),
    ...(!isGeneral ? { hasConfiguredContext: hasConfiguredContext(record.profile) } : {}),
  };

  return brand;
}

export function mapBrandsToProduct(
  records: readonly RawBrandRecord[],
  activeBrandId: string,
): BrandsResponseProduct {
  const normalizedActive = activeBrandId.trim() || 'default';
  const general = records.find((record) => record.id === 'default');
  const others = records
    .filter((record) => record.id !== 'default')
    .sort((left, right) => left.profile.name.localeCompare(right.profile.name, 'es'));

  const brands = [
    ...(general !== undefined ? [mapBrandToProduct(general, normalizedActive)] : []),
    ...others.map((record) => mapBrandToProduct(record, normalizedActive)),
  ];

  return {
    activeBrandId: normalizedActive,
    brands,
  };
}

export function mapCreateBrandResponse(
  record: RawBrandRecord,
  activeBrandId: string,
): CreateBrandResponseProduct {
  return {
    brand: mapBrandToProduct(record, activeBrandId),
  };
}

export function mapBrandRequestError(raw: string): string {
  const lower = raw.toLowerCase();

  if (lower.includes('ya existe') || lower.includes('duplicate')) {
    return t('brands.errorDuplicate');
  }

  if (lower.includes('reservado')) {
    return t('brands.errorNameInvalid');
  }

  if (lower.includes('must not be empty') || lower.includes('es obligatorio')) {
    return t('brands.errorNameRequired');
  }

  if (lower.includes('demasiado largo') || lower.includes('too long')) {
    return t('brands.errorNameTooLong');
  }

  if (
    lower.includes('invalid brand') ||
    lower.includes('valid characters') ||
    lower.includes('revisa el nombre')
  ) {
    return t('brands.errorNameInvalid');
  }

  return t('brands.errorGeneric');
}
