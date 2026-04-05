drop policy if exists "chat_sessions_select" on public.chat_sessions;
drop policy if exists "chat_sessions_insert" on public.chat_sessions;
drop policy if exists "chat_sessions_update" on public.chat_sessions;
drop policy if exists "chat_sessions_delete" on public.chat_sessions;

create policy "chat_sessions_select" on public.chat_sessions
  for select using (
    tenant_id = public.get_tenant_id()
    and user_id = (
      select id
      from public.users
      where id = auth.uid()
    )
  );

create policy "chat_sessions_insert" on public.chat_sessions
  for insert with check (
    tenant_id = public.get_tenant_id()
    and user_id = auth.uid()
  );

create policy "chat_sessions_update" on public.chat_sessions
  for update using (
    tenant_id = public.get_tenant_id()
    and user_id = (
      select id
      from public.users
      where id = auth.uid()
    )
  )
  with check (
    tenant_id = public.get_tenant_id()
    and user_id = (
      select id
      from public.users
      where id = auth.uid()
    )
  );

create policy "chat_sessions_delete" on public.chat_sessions
  for delete using (
    tenant_id = public.get_tenant_id()
    and user_id = (
      select id
      from public.users
      where id = auth.uid()
    )
  );

drop policy if exists "chat_messages_select" on public.chat_messages;
drop policy if exists "chat_messages_insert" on public.chat_messages;
drop policy if exists "chat_messages_update" on public.chat_messages;
drop policy if exists "chat_messages_delete" on public.chat_messages;

create policy "chat_messages_select" on public.chat_messages
  for select using (
    tenant_id = public.get_tenant_id()
    and exists (
      select 1
      from public.chat_sessions
      where public.chat_sessions.id = public.chat_messages.session_id
        and public.chat_sessions.tenant_id = public.get_tenant_id()
        and public.chat_sessions.user_id = auth.uid()
    )
  );

create policy "chat_messages_insert" on public.chat_messages
  for insert with check (
    tenant_id = public.get_tenant_id()
    and exists (
      select 1
      from public.chat_sessions
      where public.chat_sessions.id = public.chat_messages.session_id
        and public.chat_sessions.tenant_id = public.get_tenant_id()
        and public.chat_sessions.user_id = auth.uid()
    )
  );

create policy "chat_messages_update" on public.chat_messages
  for update using (
    tenant_id = public.get_tenant_id()
    and exists (
      select 1
      from public.chat_sessions
      where public.chat_sessions.id = public.chat_messages.session_id
        and public.chat_sessions.tenant_id = public.get_tenant_id()
        and public.chat_sessions.user_id = auth.uid()
    )
  )
  with check (
    tenant_id = public.get_tenant_id()
    and exists (
      select 1
      from public.chat_sessions
      where public.chat_sessions.id = public.chat_messages.session_id
        and public.chat_sessions.tenant_id = public.get_tenant_id()
        and public.chat_sessions.user_id = auth.uid()
    )
  );

create policy "chat_messages_delete" on public.chat_messages
  for delete using (
    tenant_id = public.get_tenant_id()
    and exists (
      select 1
      from public.chat_sessions
      where public.chat_sessions.id = public.chat_messages.session_id
        and public.chat_sessions.tenant_id = public.get_tenant_id()
        and public.chat_sessions.user_id = auth.uid()
    )
  );
