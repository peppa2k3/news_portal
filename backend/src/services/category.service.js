import { AppError } from '../errors/app.error.js';
import * as categoryModel from '../models/category.model.js';

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

const parseId = (value, field = 'id') => {
  const normalized = String(value ?? '');

  if (!/^[1-9]\d*$/.test(normalized)) {
    throw new AppError(400, `${field} must be a positive integer.`, 'INVALID_ID');
  }

  return normalized;
};

const readText = (value, field, maxLength, { nullable = false } = {}) => {
  if (nullable && (value === null || value === '')) {
    return null;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    throw new AppError(
      400,
      `${field} must be a non-empty string.`,
      'VALIDATION_ERROR',
    );
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new AppError(
      400,
      `${field} must not exceed ${maxLength} characters.`,
      'VALIDATION_ERROR',
    );
  }

  return normalized;
};

const readBoolean = (value, field) => {
  if (typeof value !== 'boolean') {
    throw new AppError(400, `${field} must be a boolean.`, 'VALIDATION_ERROR');
  }

  return value;
};

const readDisplayOrder = (value) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new AppError(
      400,
      'displayOrder must be a non-negative integer.',
      'VALIDATION_ERROR',
    );
  }

  return value;
};

export const createSlug = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const readSlug = (value) => {
  const slug = readText(value, 'slug', 150);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new AppError(
      400,
      'slug may contain only lowercase letters, numbers, and single hyphens.',
      'VALIDATION_ERROR',
    );
  }

  return slug;
};

const normalizeCreateInput = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError(400, 'Request body must be an object.', 'VALIDATION_ERROR');
  }

  const name = readText(payload.name, 'name', 150);
  const generatedSlug = createSlug(name);

  if (!generatedSlug) {
    throw new AppError(400, 'Unable to generate a valid slug.', 'VALIDATION_ERROR');
  }

  return {
    name,
    slug: readSlug(payload.slug ?? generatedSlug),
    parentId:
      payload.parentId === null || payload.parentId === undefined
        ? null
        : parseId(payload.parentId, 'parentId'),
    displayOrder:
      payload.displayOrder === undefined
        ? 0
        : readDisplayOrder(payload.displayOrder),
    isActive:
      payload.isActive === undefined
        ? true
        : readBoolean(payload.isActive, 'isActive'),
    showInMenu:
      payload.showInMenu === undefined
        ? true
        : readBoolean(payload.showInMenu, 'showInMenu'),
    metaTitle:
      payload.metaTitle === undefined
        ? null
        : readText(payload.metaTitle, 'metaTitle', 255, { nullable: true }),
    metaDesc:
      payload.metaDesc === undefined
        ? null
        : readText(payload.metaDesc, 'metaDesc', 500, { nullable: true }),
  };
};

const normalizeUpdateInput = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError(400, 'Request body must be an object.', 'VALIDATION_ERROR');
  }

  const input = {};

  if (hasOwn(payload, 'name')) {
    input.name = readText(payload.name, 'name', 150);
  }
  if (hasOwn(payload, 'slug')) {
    input.slug = readSlug(payload.slug);
  }
  if (hasOwn(payload, 'parentId')) {
    input.parentId =
      payload.parentId === null
        ? null
        : parseId(payload.parentId, 'parentId');
  }
  if (hasOwn(payload, 'displayOrder')) {
    input.displayOrder = readDisplayOrder(payload.displayOrder);
  }
  if (hasOwn(payload, 'isActive')) {
    input.isActive = readBoolean(payload.isActive, 'isActive');
  }
  if (hasOwn(payload, 'showInMenu')) {
    input.showInMenu = readBoolean(payload.showInMenu, 'showInMenu');
  }
  if (hasOwn(payload, 'metaTitle')) {
    input.metaTitle = readText(payload.metaTitle, 'metaTitle', 255, {
      nullable: true,
    });
  }
  if (hasOwn(payload, 'metaDesc')) {
    input.metaDesc = readText(payload.metaDesc, 'metaDesc', 500, {
      nullable: true,
    });
  }

  if (Object.keys(input).length === 0) {
    throw new AppError(
      400,
      'At least one category field is required.',
      'VALIDATION_ERROR',
    );
  }

  return input;
};

const ensureParentExists = async (parentId) => {
  if (parentId === null) {
    return;
  }

  const parent = await categoryModel.findCategoryById(parentId);

  if (!parent) {
    throw new AppError(400, 'Parent category does not exist.', 'INVALID_PARENT');
  }
};

const sortTree = (categories) => {
  categories.sort(
    (left, right) =>
      left.displayOrder - right.displayOrder ||
      left.name.localeCompare(right.name, 'vi'),
  );

  for (const category of categories) {
    sortTree(category.children);
  }

  return categories;
};

export const buildCategoryTree = (categories) => {
  const nodes = new Map(
    categories.map((category) => [
      category.id,
      { ...category, children: [] },
    ]),
  );
  const roots = [];

  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : null;

    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return sortTree(roots);
};

export const getMenu = async () => {
  const categories = await categoryModel.findMenuCategories();
  return buildCategoryTree(categories);
};

export const createCategory = async (payload) => {
  const input = normalizeCreateInput(payload);
  await ensureParentExists(input.parentId);

  return categoryModel.createCategory(input);
};

export const updateCategory = async (idValue, payload) => {
  const id = parseId(idValue);
  const existing = await categoryModel.findCategoryById(id);

  if (!existing) {
    throw new AppError(404, 'Category not found.', 'CATEGORY_NOT_FOUND');
  }

  const changes = normalizeUpdateInput(payload);
  const category = { ...existing, ...changes };

  if (category.parentId === id) {
    throw new AppError(
      409,
      'A category cannot be its own parent.',
      'CATEGORY_TREE_CONFLICT',
    );
  }

  await ensureParentExists(category.parentId);

  if (
    category.parentId !== null &&
    (await categoryModel.isCategoryDescendant(category.parentId, id))
  ) {
    throw new AppError(
      409,
      'A category cannot be moved below one of its descendants.',
      'CATEGORY_TREE_CONFLICT',
    );
  }

  return categoryModel.updateCategory(id, category);
};

export const deleteCategory = async (idValue) => {
  const id = parseId(idValue);
  const deleted = await categoryModel.deleteCategory(id);

  if (!deleted) {
    throw new AppError(404, 'Category not found.', 'CATEGORY_NOT_FOUND');
  }
};
