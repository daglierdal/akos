alter table public.chat_sessions
  add column if not exists persist_error_at timestamptz;
