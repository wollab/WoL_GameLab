create table yourmagic_stats.angle_totals (
 dataset text not null check(dataset in ('production','test')), version text not null,
 angle text not null check(angle in ('explorer','listener','experimenter','connector','meaningmaker','creator','decider','synthesizer','reflector')),
 points bigint not null check(points>=0), primary key(dataset,version,angle)
);
alter table yourmagic_stats.angle_totals enable row level security;
revoke all on yourmagic_stats.angle_totals from public,anon,authenticated;
create or replace function public.yourmagic_statistics(p_key text,p_dataset text,p_event jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_version constant text := 'v1-20261107'; v_inserted boolean := false; v_count integer; v_result jsonb; v_angle record;
begin
  if not exists(select 1 from yourmagic_stats.configuration where key='api_key_sha256' and value=encode(sha256(convert_to(coalesce(p_key,''),'UTF8')),'hex')) then raise exception 'Unauthorized' using errcode='42501'; end if;
  if p_dataset not in ('production','test') or p_dataset is null then raise exception 'Invalid dataset' using errcode='22023'; end if;
  if p_event is not null then
    if jsonb_typeof(p_event->'scores') is distinct from 'object' or (select count(*) from jsonb_object_keys(p_event->'scores'))<>9 then raise exception 'Invalid angle totals' using errcode='22023'; end if;
    if exists(select 1 from jsonb_each_text(p_event->'scores') x where key not in ('explorer','listener','experimenter','connector','meaningmaker','creator','decider','synthesizer','reflector') or value!~'^[0-7]$') or (select sum(value::integer) from jsonb_each_text(p_event->'scores'))<>19 then raise exception 'Invalid angle totals' using errcode='22023'; end if;
    if p_event->>'version' is distinct from v_version then raise exception 'Invalid version' using errcode='22023'; end if;
    insert into yourmagic_stats.results(dataset,version,run_id,archetype)
    values(p_dataset,v_version,(p_event->>'run_id')::uuid,p_event->>'archetype') on conflict do nothing;
    get diagnostics v_count = row_count;
    v_inserted := v_count=1;
    if v_inserted then
      for v_angle in select key,value::integer as points from jsonb_each_text(p_event->'scores') loop
        insert into yourmagic_stats.angle_totals(dataset,version,angle,points) values(p_dataset,v_version,v_angle.key,v_angle.points)
        on conflict(dataset,version,angle) do update set points=yourmagic_stats.angle_totals.points+excluded.points;
      end loop;
    end if;
    if exists(select 1 from yourmagic_stats.results where dataset=p_dataset and version=v_version and run_id=(p_event->>'run_id')::uuid and archetype<>p_event->>'archetype') then raise exception 'Run already recorded with another result' using errcode='22023'; end if;
  end if;
  select jsonb_build_object('version',v_version,'total',count(*),'firstRecordedAt',min(completed_at),'updatedAt',now(),'counts',coalesce((select jsonb_object_agg(archetype,n) from(select archetype,count(*) n from yourmagic_stats.results where dataset=p_dataset and version=v_version group by archetype)c),'{}'::jsonb),'recorded',v_inserted,'anglePoints',coalesce((select jsonb_object_agg(angle,points) from yourmagic_stats.angle_totals where dataset=p_dataset and version=v_version),'{}'::jsonb),'angleResults',coalesce((select sum(points)/19 from yourmagic_stats.angle_totals where dataset=p_dataset and version=v_version),0))
  into v_result from yourmagic_stats.results where dataset=p_dataset and version=v_version;
  return v_result;
end $$;
