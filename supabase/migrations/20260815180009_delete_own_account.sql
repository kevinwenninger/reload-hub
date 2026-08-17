-- 009_delete_own_account — self-service account deletion (store requirement).
-- Deleting the auth.users row cascades through every user-scoped table;
-- storage objects under {user_id}/ are removed explicitly first.

create function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not signed in';
  end if;
  delete from storage.objects
  where bucket_id = 'targets'
    and (storage.foldername(name))[1] = v_uid::text;
  delete from auth.users where id = v_uid;
end;
$$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
