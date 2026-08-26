-- ============================================================
-- gocnhindautu.com — Migration 005: Contact messages
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON public.contact_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read
  ON public.contact_messages (is_read) WHERE is_read = false;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Ai cũng gửi được tin nhắn (form liên hệ — khuyến nghị qua API server-side)
DROP POLICY IF EXISTS "contact_messages: public insert" ON public.contact_messages;
CREATE POLICY "contact_messages: public insert"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Chỉ service role đọc / sửa / xóa (admin qua server-side)
DROP POLICY IF EXISTS "contact_messages: service role select" ON public.contact_messages;
CREATE POLICY "contact_messages: service role select"
  ON public.contact_messages FOR SELECT
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "contact_messages: service role update" ON public.contact_messages;
CREATE POLICY "contact_messages: service role update"
  ON public.contact_messages FOR UPDATE
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "contact_messages: service role delete" ON public.contact_messages;
CREATE POLICY "contact_messages: service role delete"
  ON public.contact_messages FOR DELETE
  USING (auth.role() = 'service_role');
