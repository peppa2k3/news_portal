import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCategoryTree,
  createSlug,
} from '../src/services/category.service.js';

test('buildCategoryTree returns a nested tree sorted at every level', () => {
  const categories = [
    { id: '3', parentId: '1', name: 'Premier League', displayOrder: 2 },
    { id: '2', parentId: '1', name: 'V-League', displayOrder: 1 },
    { id: '1', parentId: null, name: 'Thể thao', displayOrder: 2 },
    { id: '4', parentId: null, name: 'Thời sự', displayOrder: 1 },
  ];

  const tree = buildCategoryTree(categories);

  assert.deepEqual(
    tree.map((category) => category.id),
    ['4', '1'],
  );
  assert.deepEqual(
    tree[1].children.map((category) => category.id),
    ['2', '3'],
  );
  assert.deepEqual(tree[0].children, []);
});

test('createSlug normalizes Vietnamese category names', () => {
  assert.equal(createSlug('  Bóng đá Việt Nam  '), 'bong-da-viet-nam');
});
