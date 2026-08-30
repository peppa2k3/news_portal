import pool from '../config/database.js';

const categoryColumns = `
  c.id::text AS id,
  c.name,
  c.slug,
  c.parent_id::text AS "parentId",
  c.path::text AS path,
  nlevel(c.path) AS depth,
  c.display_order AS "displayOrder",
  c.is_active AS "isActive",
  c.show_in_menu AS "showInMenu",
  c.meta_title AS "metaTitle",
  c.meta_desc AS "metaDesc",
  c.created_at AS "createdAt",
  c.updated_at AS "updatedAt"
`;

export const findMenuCategories = async () => {
  const { rows } = await pool.query(`
    SELECT ${categoryColumns}
      FROM categories c
     WHERE c.is_active = true
       AND c.show_in_menu = true
       AND c.path IS NOT NULL
       AND NOT EXISTS (
         SELECT 1
           FROM categories ancestor
          WHERE ancestor.path @> c.path
            AND ancestor.path <> c.path
            AND (
              ancestor.is_active = false
              OR ancestor.show_in_menu = false
            )
       )
     ORDER BY c.path
  `);

  return rows;
};

export const findCategoryById = async (id, client = pool) => {
  const { rows } = await client.query(
    `SELECT ${categoryColumns}
       FROM categories c
      WHERE c.id = $1`,
    [id],
  );

  return rows[0] ?? null;
};

export const findCategoryBySlug = async (slug, client = pool) => {
  const { rows } = await client.query(
    `SELECT ${categoryColumns}
       FROM categories c
      WHERE c.slug = $1`,
    [slug],
  );

  return rows[0] ?? null;
};

export const isCategoryDescendant = async (
  candidateId,
  categoryId,
  client = pool,
) => {
  const { rows } = await client.query(
    `SELECT candidate.path <@ category.path AS "isDescendant"
       FROM categories candidate
       JOIN categories category ON category.id = $2
      WHERE candidate.id = $1`,
    [candidateId, categoryId],
  );

  return rows[0]?.isDescendant ?? false;
};

export const createCategory = async (category, client = pool) => {
  const { rows } = await client.query(
    `INSERT INTO categories (
       name,
       slug,
       parent_id,
       display_order,
       is_active,
       show_in_menu,
       meta_title,
       meta_desc
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id::text AS id`,
    [
      category.name,
      category.slug,
      category.parentId,
      category.displayOrder,
      category.isActive,
      category.showInMenu,
      category.metaTitle,
      category.metaDesc,
    ],
  );

  return findCategoryById(rows[0].id, client);
};

export const updateCategory = async (id, category, client = pool) => {
  const { rows } = await client.query(
    `UPDATE categories
        SET name = $2,
            slug = $3,
            parent_id = $4,
            display_order = $5,
            is_active = $6,
            show_in_menu = $7,
            meta_title = $8,
            meta_desc = $9,
            updated_at = now()
      WHERE id = $1
      RETURNING id::text AS id`,
    [
      id,
      category.name,
      category.slug,
      category.parentId,
      category.displayOrder,
      category.isActive,
      category.showInMenu,
      category.metaTitle,
      category.metaDesc,
    ],
  );

  if (!rows[0]) {
    return null;
  }

  return findCategoryById(rows[0].id, client);
};

export const deleteCategory = async (id, client = pool) => {
  const { rowCount } = await client.query(
    'DELETE FROM categories WHERE id = $1',
    [id],
  );

  return rowCount > 0;
};
