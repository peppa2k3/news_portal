-- News Portal production schema. Idempotent and safe to rerun under migration lock.
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Identity and authentication
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'author' CHECK (role IN ('super_admin','editor','author')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_active ON users (lower(email)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role,status) WHERE deleted_at IS NULL;
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  replaced_by_token_id UUID REFERENCES refresh_tokens(id) ON DELETE SET NULL,
  ip_hash CHAR(64),
  user_agent VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content taxonomy
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  parent_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT,
  path LTREE,
  display_order INT NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  show_in_menu BOOLEAN NOT NULL DEFAULT true,
  meta_title VARCHAR(255),
  meta_desc VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_slug_active ON categories(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_path ON categories USING GIST(path);
CREATE INDEX IF NOT EXISTS idx_categories_parent_order ON categories(parent_id,display_order) WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION set_category_path() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE parent_path LTREE; path_label TEXT;
BEGIN
  path_label := trim(BOTH '_' FROM regexp_replace(lower(NEW.slug),'[^a-z0-9_]+','_','g'));
  IF path_label = '' THEN path_label := 'category_' || NEW.id; END IF;
  IF NEW.parent_id IS NULL THEN NEW.path := text2ltree(path_label); RETURN NEW; END IF;
  IF NEW.parent_id = NEW.id THEN RAISE EXCEPTION 'A category cannot be its own parent'; END IF;
  SELECT path INTO parent_path FROM categories WHERE id=NEW.parent_id AND deleted_at IS NULL;
  IF parent_path IS NULL THEN RAISE EXCEPTION 'Parent category does not exist'; END IF;
  IF TG_OP='UPDATE' AND parent_path <@ OLD.path THEN RAISE EXCEPTION 'Circular category hierarchy is not allowed'; END IF;
  NEW.path := parent_path || text2ltree(path_label);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_categories_set_path ON categories;
CREATE TRIGGER trg_categories_set_path BEFORE INSERT OR UPDATE OF slug,parent_id ON categories FOR EACH ROW EXECUTE FUNCTION set_category_path();

CREATE OR REPLACE FUNCTION move_category_descendant_paths() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF pg_trigger_depth()>1 OR OLD.path IS NOT DISTINCT FROM NEW.path THEN RETURN NEW; END IF;
  UPDATE categories SET path=NEW.path || subpath(path,nlevel(OLD.path)), updated_at=now()
    WHERE id<>NEW.id AND path <@ OLD.path;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_categories_move_descendants ON categories;
CREATE TRIGGER trg_categories_move_descendants AFTER UPDATE OF path ON categories FOR EACH ROW EXECUTE FUNCTION move_category_descendant_paths();
DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS tags (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE tags ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE tags ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE tags ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_tags_slug_active ON tags(slug) WHERE deleted_at IS NULL;
DROP TRIGGER IF EXISTS trg_tags_updated_at ON tags;
CREATE TRIGGER trg_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS authors (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE authors ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE authors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE authors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
UPDATE authors SET full_name='Unknown author' WHERE full_name IS NULL;
ALTER TABLE authors DROP CONSTRAINT IF EXISTS authors_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_authors_slug_active ON authors(slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_authors_user_active ON authors(user_id) WHERE user_id IS NOT NULL AND deleted_at IS NULL;
DROP TRIGGER IF EXISTS trg_authors_updated_at ON authors;
CREATE TRIGGER trg_authors_updated_at BEFORE UPDATE ON authors FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Media and articles
CREATE TABLE IF NOT EXISTS media_assets (
  id BIGSERIAL PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL CHECK(size_bytes>0),
  width INT,
  height INT,
  alt_text VARCHAR(500),
  variants JSONB NOT NULL DEFAULT '{}'::jsonb,
  owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_media_owner_created ON media_assets(owner_id,created_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) NOT NULL,
  excerpt VARCHAR(1000),
  content_json JSONB,
  content_html TEXT NOT NULL DEFAULT '',
  thumbnail_media_id BIGINT REFERENCES media_assets(id) ON DELETE RESTRICT,
  thumbnail_url TEXT,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  author_id BIGINT REFERENCES authors(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  featured_order INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  view_count BIGINT NOT NULL DEFAULT 0 CHECK(view_count>=0),
  comment_count BIGINT NOT NULL DEFAULT 0 CHECK(comment_count>=0),
  meta_title VARCHAR(255),
  meta_desc VARCHAR(500),
  canonical_url TEXT,
  og_media_id BIGINT REFERENCES media_assets(id) ON DELETE RESTRICT,
  search_vector TSVECTOR,
  version INT NOT NULL DEFAULT 1,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_json JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS thumbnail_media_id BIGINT REFERENCES media_assets(id) ON DELETE RESTRICT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured_order INT NOT NULL DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS comment_count BIGINT NOT NULL DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_media_id BIGINT REFERENCES media_assets(id) ON DELETE RESTRICT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;
ALTER TABLE articles ADD CONSTRAINT articles_status_check CHECK(status IN ('draft','in_review','scheduled','published','archived')) NOT VALID;
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_articles_slug_active ON articles(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status,published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_category_pub ON articles(category_id,published_at DESC) WHERE status='published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_author_pub ON articles(author_id,published_at DESC) WHERE status='published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured_order,published_at DESC) WHERE is_featured AND status='published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_scheduled ON articles(scheduled_at) WHERE status='scheduled' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_article_fields() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple',unaccent(concat_ws(' ',NEW.title,NEW.excerpt,NEW.content_html)));
  IF TG_OP='UPDATE' THEN NEW.version=OLD.version+1; NEW.updated_at=now(); END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_articles_search_vector ON articles;
DROP TRIGGER IF EXISTS trg_articles_fields ON articles;
CREATE TRIGGER trg_articles_fields BEFORE INSERT OR UPDATE OF title,excerpt,content_html,status,slug,category_id,author_id ON articles FOR EACH ROW EXECUTE FUNCTION update_article_fields();
UPDATE articles SET search_vector=to_tsvector('simple',unaccent(concat_ws(' ',title,excerpt,content_html))) WHERE search_vector IS NULL;

CREATE TABLE IF NOT EXISTS article_tags (
  article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES tags(id) ON DELETE RESTRICT,
  PRIMARY KEY(article_id,tag_id)
);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id,article_id);
CREATE TABLE IF NOT EXISTS article_secondary_categories (
  article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT,
  PRIMARY KEY(article_id,category_id)
);
CREATE TABLE IF NOT EXISTS article_revisions (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  version INT NOT NULL,
  snapshot JSONB NOT NULL,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id,version)
);
CREATE INDEX IF NOT EXISTS idx_revisions_article ON article_revisions(article_id,version DESC);
CREATE TABLE IF NOT EXISTS article_slug_history (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  old_slug VARCHAR(300) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Engagement and operations
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  parent_id BIGINT REFERENCES comments(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  email_hash CHAR(64) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','spam')),
  ip_hash CHAR(64),
  moderated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_article_approved ON comments(article_id,created_at) WHERE status='approved';
CREATE INDEX IF NOT EXISTS idx_comments_moderation ON comments(status,created_at DESC);

CREATE TABLE IF NOT EXISTS article_views_daily (
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  view_date DATE NOT NULL,
  view_count BIGINT NOT NULL DEFAULT 0 CHECK(view_count>=0),
  PRIMARY KEY(article_id,view_date)
);
CREATE INDEX IF NOT EXISTS idx_views_daily_date ON article_views_daily(view_date,view_count DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_hash CHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_actor_created ON audit_logs(actor_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type,entity_id,created_at DESC);

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description VARCHAR(500),
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revalidation_jobs (
  id BIGSERIAL PRIMARY KEY,
  payload JSONB NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  run_after TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_revalidation_pending ON revalidation_jobs(run_after) WHERE completed_at IS NULL;

INSERT INTO site_settings(key,value,description) VALUES
 ('comments_enabled','true'::jsonb,'Enable moderated public comments'),
 ('homepage_category_limit','5'::jsonb,'Articles per homepage category')
ON CONFLICT(key) DO NOTHING;
