-- ============================================================
-- dungdautu.com — Initial Database Schema + RLS Policies
-- Run this in Supabase SQL Editor (project → SQL Editor → New query)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- HELPER FUNCTION: check if current user is admin
-- Used in RLS policies to avoid repeated subqueries
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- TABLE: profiles
-- 1-1 with auth.users, stores role for authorization
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role        TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only SELECT their own profile
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but NOT role — enforced by column-level below)
CREATE POLICY "profiles: update own (except role)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- role column cannot be changed via this policy (service_role bypasses RLS)
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'editor');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- TABLE: categories
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('kien-thuc', 'danh-gia-san', 'so-sanh')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read categories
CREATE POLICY "categories: public read"
  ON public.categories FOR SELECT
  USING (true);

-- Only admin can write
CREATE POLICY "categories: admin insert"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "categories: admin update"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "categories: admin delete"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- TABLE: articles
-- Stores metadata only; HTML body stored on R2 via r2_key
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.articles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  category_id      UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  r2_key           TEXT NOT NULL,             -- Key của object HTML trên R2
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  meta_description TEXT,
  published_at     TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public: only published articles
CREATE POLICY "articles: public read published"
  ON public.articles FOR SELECT
  USING (
    status = 'published'
    OR public.is_admin()
  );

-- Admin only: write
CREATE POLICY "articles: admin insert"
  ON public.articles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "articles: admin update"
  ON public.articles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "articles: admin delete"
  ON public.articles FOR DELETE
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- TABLE: brokers
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.brokers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  r2_key          TEXT NOT NULL,             -- Key của object review content trên R2
  rating          NUMERIC(3, 1) CHECK (rating >= 0 AND rating <= 10),
  regulation_info TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brokers: public read published"
  ON public.brokers FOR SELECT
  USING (
    status = 'published'
    OR public.is_admin()
  );

CREATE POLICY "brokers: admin insert"
  ON public.brokers FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "brokers: admin update"
  ON public.brokers FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "brokers: admin delete"
  ON public.brokers FOR DELETE
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- TABLE: comparisons
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.comparisons (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT NOT NULL UNIQUE,
  broker_a_id  UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  broker_b_id  UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  r2_key       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT different_brokers CHECK (broker_a_id <> broker_b_id)
);

ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comparisons: public read published"
  ON public.comparisons FOR SELECT
  USING (
    status = 'published'
    OR public.is_admin()
  );

CREATE POLICY "comparisons: admin insert"
  ON public.comparisons FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "comparisons: admin update"
  ON public.comparisons FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "comparisons: admin delete"
  ON public.comparisons FOR DELETE
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- TABLE: admin_actions (audit log)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.admin_actions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,                -- e.g. 'publish', 'update', 'delete'
  target_table TEXT NOT NULL,               -- e.g. 'articles', 'brokers'
  target_id    UUID NOT NULL,
  metadata     JSONB,                        -- Optional extra context
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Only service_role can INSERT (called from Server Actions via service client)
-- RLS INSERT policy intentionally omitted → only service_role (which bypasses RLS) can insert

-- Admins can SELECT audit log
CREATE POLICY "admin_actions: admin select"
  ON public.admin_actions FOR SELECT
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_articles_slug        ON public.articles(slug);
CREATE INDEX idx_articles_status      ON public.articles(status);
CREATE INDEX idx_articles_category    ON public.articles(category_id);
CREATE INDEX idx_articles_published   ON public.articles(published_at DESC);
CREATE INDEX idx_brokers_slug         ON public.brokers(slug);
CREATE INDEX idx_brokers_status       ON public.brokers(status);
CREATE INDEX idx_comparisons_slug     ON public.comparisons(slug);
CREATE INDEX idx_admin_actions_admin  ON public.admin_actions(admin_id);
CREATE INDEX idx_admin_actions_time   ON public.admin_actions(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT trigger
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_brokers_updated_at
  BEFORE UPDATE ON public.brokers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_comparisons_updated_at
  BEFORE UPDATE ON public.comparisons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
