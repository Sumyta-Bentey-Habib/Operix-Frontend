import type {
  CreateInventoryCategoryInput,
  CreateInventoryItemInput,
  InventoryCategory,
  InventoryItem,
  InventoryItemFormValues,
  UpdateInventoryCategoryInput,
  UpdateInventoryItemInput,
} from "../types/inventory.types";

const clean = (value: string): string => value.trim();
const cleanOptional = (value: string): string | undefined => {
  const next = clean(value);
  return next ? next : undefined;
};

const parseOptionalInteger = (value: string): number | undefined => {
  const next = clean(value);
  if (!next) return undefined;
  return Number.parseInt(next, 10);
};

const parseOptionalIntegerOrNull = (value: string): number | null => {
  const next = clean(value);
  if (!next) return null;
  return Number.parseInt(next, 10);
};

export const buildCreateCategoryPayload = (values: {
  name: string;
  description: string;
}): CreateInventoryCategoryInput => {
  const input: CreateInventoryCategoryInput = {
    name: clean(values.name),
  };
  const description = cleanOptional(values.description);
  if (description) input.description = description;
  return input;
};

export const buildUpdateCategoryPayload = (
  category: InventoryCategory,
  values: { name: string; description: string; isActive: boolean },
): UpdateInventoryCategoryInput => {
  const input: UpdateInventoryCategoryInput = {};
  const name = clean(values.name);
  const description = clean(values.description);
  const originalDescription = category.description ?? "";

  if (name !== category.name) input.name = name;
  if (description !== originalDescription) input.description = description || null;
  if (values.isActive !== category.isActive) input.isActive = values.isActive;

  return input;
};

export const itemToFormValues = (item?: InventoryItem | null): InventoryItemFormValues => ({
  teamId: item?.team.id ?? "",
  sku: item?.sku ?? "",
  name: item?.name ?? "",
  description: item?.description ?? "",
  categoryId: item?.category?.id ?? "",
  openingQuantity: "",
  lowStockThreshold: item?.lowStockThreshold?.toString() ?? "",
  isReturnable: item?.isReturnable ?? false,
  isActive: item?.isActive ?? true,
});

export const buildCreateItemPayload = (
  values: InventoryItemFormValues,
): CreateInventoryItemInput => {
  const input: CreateInventoryItemInput = {
    teamId: clean(values.teamId),
    sku: clean(values.sku),
    name: clean(values.name),
    isReturnable: values.isReturnable,
  };

  const categoryId = cleanOptional(values.categoryId);
  const description = cleanOptional(values.description);
  const openingQuantity = parseOptionalInteger(values.openingQuantity);
  const lowStockThreshold = parseOptionalIntegerOrNull(values.lowStockThreshold);

  if (categoryId) input.categoryId = categoryId;
  if (description) input.description = description;
  if (openingQuantity !== undefined) input.openingQuantity = openingQuantity;
  input.lowStockThreshold = lowStockThreshold;

  return input;
};

export const buildUpdateItemPayload = (
  item: InventoryItem,
  values: InventoryItemFormValues,
): UpdateInventoryItemInput => {
  const input: UpdateInventoryItemInput = {};
  const name = clean(values.name);
  const description = clean(values.description);
  const categoryId = clean(values.categoryId);
  const originalDescription = item.description ?? "";
  const originalCategoryId = item.category?.id ?? "";
  const lowStockThreshold = parseOptionalIntegerOrNull(values.lowStockThreshold);

  if (name !== item.name) input.name = name;
  if (description !== originalDescription) input.description = description || null;
  if (categoryId !== originalCategoryId) input.categoryId = categoryId || null;
  if (lowStockThreshold !== item.lowStockThreshold) input.lowStockThreshold = lowStockThreshold;
  if (values.isReturnable !== item.isReturnable) input.isReturnable = values.isReturnable;
  if (values.isActive !== item.isActive) input.isActive = values.isActive;

  return input;
};

export const validatePositiveInteger = (value: string, label: string): string | null => {
  const quantity = Number.parseInt(clean(value), 10);
  if (!Number.isInteger(quantity) || quantity < 1) return `${label} must be at least 1.`;
  return null;
};

export const validateNonNegativeInteger = (value: string, label: string): string | null => {
  if (!clean(value)) return null;
  const quantity = Number.parseInt(clean(value), 10);
  if (!Number.isInteger(quantity) || quantity < 0) return `${label} must be 0 or greater.`;
  return null;
};
