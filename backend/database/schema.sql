-- PostgreSQL schema for the TechReview news portal.
-- This file is intentionally idempotent so `npm run db:migrate` can be rerun.

CREATE EXTENSION IF NOT EXISTS ltree;

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    slug          VARCHAR(150) UNIQUE NOT NULL,
    parent_id     BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    path          LTREE,
    display_order INT NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    show_in_menu  BOOLEAN NOT NULL DEFAULT true,
    meta_title    VARCHAR(255),
    meta_desc     VARCHAR(500),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_path
    ON categories USING GIST (path);
CREATE INDEX IF NOT EXISTS idx_categories_parent
    ON categories (parent_id);

-- Keep the LTREE path in sync with slug/parent_id.
CREATE OR REPLACE FUNCTION set_category_path()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    parent_path LTREE;
    path_label  TEXT;
BEGIN
    path_label := trim(
        BOTH '_' FROM regexp_replace(lower(NEW.slug), '[^a-z0-9_]+', '_', 'g')
    );

    IF path_label = '' THEN
        path_label := 'category_' || NEW.id;
    END IF;

    IF NEW.parent_id IS NULL THEN
        NEW.path := text2ltree(path_label);
        RETURN NEW;
    END IF;

    IF NEW.parent_id = NEW.id THEN
        RAISE EXCEPTION 'A category cannot be its own parent';
    END IF;

    SELECT path
      INTO parent_path
      FROM categories
     WHERE id = NEW.parent_id;

    IF parent_path IS NULL THEN
        RAISE EXCEPTION 'Parent category % does not exist or has no path', NEW.parent_id;
    END IF;

    IF TG_OP = 'UPDATE' AND parent_path <@ OLD.path THEN
        RAISE EXCEPTION 'A category cannot be moved below one of its descendants';
    END IF;

    NEW.path := parent_path || text2ltree(path_label);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_categories_set_path ON categories;
CREATE TRIGGER trg_categories_set_path
BEFORE INSERT OR UPDATE OF slug, parent_id ON categories
FOR EACH ROW
EXECUTE FUNCTION set_category_path();

-- When a category moves or its slug changes, update every descendant path.
CREATE OR REPLACE FUNCTION move_category_descendant_paths()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF pg_trigger_depth() > 1 OR OLD.path IS NOT DISTINCT FROM NEW.path THEN
        RETURN NEW;
    END IF;

    UPDATE categories
       SET path = NEW.path || subpath(path, nlevel(OLD.path)),
           updated_at = now()
     WHERE id <> NEW.id
       AND path <@ OLD.path;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_categories_move_descendants ON categories;
CREATE TRIGGER trg_categories_move_descendants
AFTER UPDATE OF path ON categories
FOR EACH ROW
EXECUTE FUNCTION move_category_descendant_paths();

-- ============ TAGS ============
CREATE TABLE IF NOT EXISTS tags (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- ============ AUTHORS ============
CREATE TABLE IF NOT EXISTS authors (
    id         BIGSERIAL PRIMARY KEY,
    full_name  VARCHAR(150),
    slug       VARCHAR(150) UNIQUE,
    avatar_url TEXT,
    bio        TEXT
);

-- ============ ARTICLES ============
CREATE TABLE IF NOT EXISTS articles (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(300) NOT NULL,
    slug          VARCHAR(300) UNIQUE NOT NULL,
    excerpt       VARCHAR(500),
    content_html  TEXT NOT NULL,
    thumbnail_url TEXT,
    category_id   BIGINT NOT NULL REFERENCES categories(id),
    author_id     BIGINT REFERENCES authors(id),
    status        VARCHAR(20) NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published', 'archived')),
    is_featured   BOOLEAN NOT NULL DEFAULT false,
    is_trending   BOOLEAN NOT NULL DEFAULT false,
    view_count    BIGINT NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    published_at  TIMESTAMPTZ,
    meta_title    VARCHAR(255),
    meta_desc     VARCHAR(500),
    search_vector TSVECTOR,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_cat_pub
    ON articles (category_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_trending
    ON articles (is_trending, published_at DESC)
    WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_search
    ON articles USING GIN (search_vector);

-- Keep full-text search data current without relying on the Express layer.
CREATE OR REPLACE FUNCTION update_article_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector := to_tsvector(
        'simple',
        concat_ws(' ', NEW.title, NEW.excerpt, NEW.content_html)
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_articles_search_vector ON articles;
CREATE TRIGGER trg_articles_search_vector
BEFORE INSERT OR UPDATE OF title, excerpt, content_html ON articles
FOR EACH ROW
EXECUTE FUNCTION update_article_search_vector();

UPDATE articles
   SET search_vector = to_tsvector(
       'simple',
       concat_ws(' ', title, excerpt, content_html)
   )
 WHERE search_vector IS NULL;

-- ============ ARTICLE <-> TAGS ============
CREATE TABLE IF NOT EXISTS article_tags (
    article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
    tag_id     BIGINT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_article_tags_tag
    ON article_tags (tag_id);

-- Optional cross-posting to secondary categories.
CREATE TABLE IF NOT EXISTS article_secondary_categories (
    article_id  BIGINT REFERENCES articles(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, category_id)
);
