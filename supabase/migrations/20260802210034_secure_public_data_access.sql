begin;

-- Keep the automatic RLS event-trigger helper out of the exposed API schema.
create schema if not exists private;
revoke all on schema private from public;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    alter function public.rls_auto_enable() set schema private;
  end if;
end
$$;

revoke all on function private.rls_auto_enable() from public, anon, authenticated, service_role;

-- Aggregate views must enforce the caller's RLS context.
alter view public.town_stats set (security_invoker = true);
alter view public.carrier_stats set (security_invoker = true);

revoke all privileges on public.town_stats from anon, authenticated;
revoke all privileges on public.carrier_stats from anon, authenticated;
grant select on public.town_stats to anon, authenticated;
grant select on public.carrier_stats to anon, authenticated;

-- Public reads contain community metrics only. Authenticated reads are limited
-- to results owned by the verified email in the caller's JWT.
drop policy if exists allow_public_select on public.speed_results;
drop policy if exists allow_public_insert on public.speed_results;
drop policy if exists anon_can_read_public_speed_results on public.speed_results;
drop policy if exists users_can_read_own_speed_results on public.speed_results;
drop policy if exists anon_can_submit_valid_speed_results on public.speed_results;
drop policy if exists users_can_submit_own_valid_speed_results on public.speed_results;

create policy anon_can_read_public_speed_results
on public.speed_results
for select
to anon
using (true);

create policy users_can_read_own_speed_results
on public.speed_results
for select
to authenticated
using (
  user_email is not null
  and lower(user_email) = lower((select auth.jwt() ->> 'email'))
);

create policy anon_can_submit_valid_speed_results
on public.speed_results
for insert
to anon
with check (
  user_email is null
  and char_length(username) between 1 and 30
  and download_mbps between 0 and 100000
  and upload_mbps between 0 and 100000
  and ping_ms between 0 and 60000
  and (carrier is null or char_length(carrier) <= 100)
  and (isp_detected is null or char_length(isp_detected) <= 200)
  and (town is null or char_length(town) <= 120)
  and (region is null or char_length(region) <= 10)
  and (lat is null or lat between -90 and 90)
  and (lng is null or lng between -180 and 180)
);

create policy users_can_submit_own_valid_speed_results
on public.speed_results
for insert
to authenticated
with check (
  (user_email is null or lower(user_email) = lower((select auth.jwt() ->> 'email')))
  and char_length(username) between 1 and 30
  and download_mbps between 0 and 100000
  and upload_mbps between 0 and 100000
  and ping_ms between 0 and 60000
  and (carrier is null or char_length(carrier) <= 100)
  and (isp_detected is null or char_length(isp_detected) <= 200)
  and (town is null or char_length(town) <= 120)
  and (region is null or char_length(region) <= 10)
  and (lat is null or lat between -90 and 90)
  and (lng is null or lng between -180 and 180)
);

-- Least-privilege grants prevent public clients from selecting user_email or
-- mutating/deleting existing results even if a policy is added accidentally.
revoke all privileges on public.speed_results from anon, authenticated;

grant select (
  id, username, download_mbps, upload_mbps, ping_ms, carrier,
  isp_detected, town, region, lat, lng, created_at
) on public.speed_results to anon;

grant insert (
  username, download_mbps, upload_mbps, ping_ms, carrier,
  isp_detected, town, region, lat, lng, user_email
) on public.speed_results to anon;

grant select on public.speed_results to authenticated;

grant insert (
  username, download_mbps, upload_mbps, ping_ms, carrier,
  isp_detected, town, region, lat, lng, user_email
) on public.speed_results to authenticated;

-- This legacy table is empty and no longer used by the application. Keep it
-- for compatibility, but remove all client access and the permissive policy.
drop policy if exists allow_public_insert_email on public.email_signups;
revoke all privileges on public.email_signups from anon, authenticated;

commit;
