import type {
  AvailableModelDto,
  CatalogSuggestionDto,
} from '~/api/generated/types.gen';

/** The initial-price fields of the create form: decimal strings, '' = not set. */
export interface PriceFields {
  inputPerMtok: string;
  outputPerMtok: string;
  cachedInputPerMtok: string;
  cacheWritePerMtok: string;
}

export const PRICE_FIELDS = [
  'inputPerMtok',
  'outputPerMtok',
  'cachedInputPerMtok',
  'cacheWritePerMtok',
] as const satisfies readonly (keyof PriceFields)[];

/** Form fields that can carry a catalog value (for the «من الكتالوج» hint). */
export type CatalogField =
  | 'displayName'
  | 'contextWindow'
  | 'maxOutputTokens'
  | 'supportsImages'
  | 'generatesImages'
  | keyof PriceFields;

/** Starting values of the create form. All numbers are text, as typed in the form. */
export interface ModelInitial {
  providerCode: string;
  providerModelId: string;
  displayName: string;
  contextWindow: string;
  maxOutputTokens: string;
  supportsImages: boolean;
  generatesImages: boolean;
  price: PriceFields;
  /** Fields that hold a value taken from the public catalog. */
  fromCatalog: CatalogField[];
  deprecated: boolean;
  hasContextTiers: boolean;
}

const emptyPrice = (): PriceFields => ({
  inputPerMtok: '',
  outputPerMtok: '',
  cachedInputPerMtok: '',
  cacheWritePerMtok: '',
});

/** An empty form (manual entry), optionally with the provider already chosen. */
export function emptyInitial(providerCode = ''): ModelInitial {
  return {
    providerCode,
    providerModelId: '',
    displayName: '',
    contextWindow: '',
    maxOutputTokens: '',
    supportsImages: false,
    generatesImages: false,
    price: emptyPrice(),
    fromCatalog: [],
    deprecated: false,
    hasContextTiers: false,
  };
}

const text = (value: number | string | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

/**
 * Form values for a model the provider lists: catalog data first, then what
 * the provider reported, then the id. Prices are copied as strings, never
 * parsed. Without a catalog entry nothing is marked as coming from it.
 */
export function prefillFromAvailable(
  providerCode: string,
  model: AvailableModelDto,
): ModelInitial {
  const catalog: CatalogSuggestionDto | null = model.catalog;
  const fromCatalog: CatalogField[] = [];
  if (catalog?.name) fromCatalog.push('displayName');
  if (catalog?.contextWindow != null) fromCatalog.push('contextWindow');
  if (catalog?.maxOutputTokens != null) fromCatalog.push('maxOutputTokens');
  if (catalog?.supportsImages != null) fromCatalog.push('supportsImages');
  if (catalog?.generatesImages != null) fromCatalog.push('generatesImages');

  const price = emptyPrice();
  for (const field of PRICE_FIELDS) {
    const value = catalog?.price?.[field];
    if (value != null && value !== '') {
      price[field] = value;
      fromCatalog.push(field);
    }
  }

  return {
    providerCode,
    providerModelId: model.providerModelId,
    displayName: catalog?.name || model.displayName || model.providerModelId,
    contextWindow: text(catalog?.contextWindow ?? model.contextWindow),
    maxOutputTokens: text(catalog?.maxOutputTokens ?? model.maxOutputTokens),
    // An image model also accepts images (the form enforces the same).
    supportsImages:
      (catalog?.supportsImages ?? false) || catalog?.generatesImages === true,
    generatesImages: catalog?.generatesImages ?? false,
    price,
    fromCatalog,
    deprecated: catalog?.deprecated ?? false,
    hasContextTiers: catalog?.hasContextTiers ?? false,
  };
}

/** Facts the picker table shows for one row (catalog first, like the form). */
export function rowFacts(model: AvailableModelDto) {
  const catalog = model.catalog;
  return {
    name: catalog?.name || model.displayName || null,
    contextWindow: catalog?.contextWindow ?? model.contextWindow,
    maxOutputTokens: catalog?.maxOutputTokens ?? model.maxOutputTokens,
    inputPerMtok: catalog?.price?.inputPerMtok ?? null,
    outputPerMtok: catalog?.price?.outputPerMtok ?? null,
  };
}
