create schema if not exists yourmagic_stats;
revoke all on schema yourmagic_stats from public, anon, authenticated;
create table yourmagic_stats.configuration (key text primary key, value text not null);
create table yourmagic_stats.results (
  dataset text not null check(dataset in ('production','test')),
  version text not null,
  run_id uuid not null,
  archetype text not null check(archetype in ('mage','scholar','elementalist','geomancer','chronomancer','diviner','force-mage','healer','priest','holy-knight','warden','beastmaster','transmuter','alchemist','necromancer','warlock','summoner','spirit-medium','shaman','ritualist','illusionist','enchanter','bard','mimic','artificer','spellblade','blood-mage')),
  completed_at timestamptz not null default now(),
  primary key(dataset,version,run_id)
);
create index yourmagic_results_counts on yourmagic_stats.results(dataset,version,archetype);
alter table yourmagic_stats.configuration enable row level security;
alter table yourmagic_stats.results enable row level security;
revoke all on all tables in schema yourmagic_stats from public,anon,authenticated;
create function public.yourmagic_statistics(p_key text,p_dataset text,p_event jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_version constant text := 'v1-20261107'; v_inserted boolean := false; v_count integer; v_result jsonb;
begin
  if not exists(select 1 from yourmagic_stats.configuration where key='api_key_sha256' and value=encode(sha256(convert_to(coalesce(p_key,''),'UTF8')),'hex')) then raise exception 'Unauthorized' using errcode='42501'; end if;
  if p_dataset not in ('production','test') or p_dataset is null then raise exception 'Invalid dataset' using errcode='22023'; end if;
  if p_event is not null then
    if p_event->>'version' is distinct from v_version then raise exception 'Invalid version' using errcode='22023'; end if;
    insert into yourmagic_stats.results(dataset,version,run_id,archetype)
    values(p_dataset,v_version,(p_event->>'run_id')::uuid,p_event->>'archetype') on conflict do nothing;
    get diagnostics v_count = row_count;
    v_inserted := v_count=1;
    if exists(select 1 from yourmagic_stats.results where dataset=p_dataset and version=v_version and run_id=(p_event->>'run_id')::uuid and archetype<>p_event->>'archetype') then raise exception 'Run already recorded with another result' using errcode='22023'; end if;
  end if;
  select jsonb_build_object('version',v_version,'total',count(*),'firstRecordedAt',min(completed_at),'updatedAt',now(),'counts',coalesce((select jsonb_object_agg(archetype,n) from(select archetype,count(*) n from yourmagic_stats.results where dataset=p_dataset and version=v_version group by archetype)c),'{}'::jsonb),'recorded',v_inserted)
  into v_result from yourmagic_stats.results where dataset=p_dataset and version=v_version;
  return v_result;
end $$;
revoke all on function public.yourmagic_statistics(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.yourmagic_statistics(text,text,jsonb) to anon;
comment on function public.yourmagic_statistics(text,text,jsonb) is 'YourMagic server-only RPC. Dedicated secret is mandatory; no access to unrelated tables. Raw results/schema inaccessible to API roles.';
