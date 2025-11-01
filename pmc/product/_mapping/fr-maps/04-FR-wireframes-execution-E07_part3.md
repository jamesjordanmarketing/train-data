## Current Relevant Database Setup

TABLE Prompt Templates

create table public.prompt_templates (
  id uuid not null default extensions.uuid_generate_v4 (),
  template_name text not null,
  template_type text not null,
  prompt_text text not null,
  response_schema jsonb null,
  applicable_chunk_types text[] null,
  version integer null default 1,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by uuid null,
  notes text null,
  constraint prompt_templates_pkey primary key (id),
  constraint prompt_templates_template_name_key unique (template_name),
  constraint prompt_templates_created_by_fkey foreign KEY (created_by) references user_profiles (id)
) TABLESPACE pg_default;

create trigger update_prompt_templates_updated_at BEFORE
update on prompt_templates for EACH row
execute FUNCTION update_updated_at_column ();

TABLE SCENARIO

create table public.scenarios (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  description text null,
  parent_template_id uuid null,
  context text not null,
  topic text null,
  persona text null,
  emotional_arc text null,
  complexity text null,
  emotional_context text null,
  parameter_values jsonb null default '{}'::jsonb,
  tags text[] null default '{}'::text[],
  variation_count integer null default 0,
  quality_score numeric(3, 1) null,
  status text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by uuid null,
  constraint scenarios_pkey primary key (id),
  constraint scenarios_created_by_fkey foreign KEY (created_by) references user_profiles (id),
  constraint scenarios_parent_template_id_fkey foreign KEY (parent_template_id) references conversation_templates (id) on delete CASCADE,
  constraint scenarios_complexity_check check (
    (
      complexity = any (
        array['simple'::text, 'moderate'::text, 'complex'::text]
      )
    )
  ),
  constraint scenarios_status_check check (
    (
      status = any (
        array['draft'::text, 'active'::text, 'archived'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_scenarios_parent_template on public.scenarios using btree (parent_template_id) TABLESPACE pg_default;

create index IF not exists idx_scenarios_status on public.scenarios using btree (status) TABLESPACE pg_default;

create index IF not exists idx_scenarios_complexity on public.scenarios using btree (complexity) TABLESPACE pg_default;

create index IF not exists idx_scenarios_tags on public.scenarios using gin (tags) TABLESPACE pg_default;

create index IF not exists idx_scenarios_created_by on public.scenarios using btree (created_by) TABLESPACE pg_default;

create index IF not exists idx_scenarios_persona on public.scenarios using btree (persona) TABLESPACE pg_default;

create trigger update_scenarios_updated_at BEFORE
update on scenarios for EACH row
execute FUNCTION update_train_updated_at_column ();

TABLE EDGE CASES
create table public.edge_cases (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  description text not null,
  category text null,
  trigger_condition text not null,
  expected_behavior text not null,
  risk_level text null,
  priority integer null,
  test_scenario text null,
  validation_criteria text[] null,
  tested boolean null default false,
  last_tested_at timestamp with time zone null,
  related_scenario_ids uuid[] null,
  parent_template_id uuid null,
  status text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by uuid null,
  constraint edge_cases_pkey primary key (id),
  constraint edge_cases_created_by_fkey foreign KEY (created_by) references user_profiles (id),
  constraint edge_cases_parent_template_id_fkey foreign KEY (parent_template_id) references conversation_templates (id),
  constraint edge_cases_priority_check check (
    (
      (priority >= 1)
      and (priority <= 10)
    )
  ),
  constraint edge_cases_risk_level_check check (
    (
      risk_level = any (
        array[
          'low'::text,
          'medium'::text,
          'high'::text,
          'critical'::text
        ]
      )
    )
  ),
  constraint edge_cases_status_check check (
    (
      status = any (
        array[
          'active'::text,
          'resolved'::text,
          'deprecated'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_edge_cases_risk_level on public.edge_cases using btree (risk_level) TABLESPACE pg_default;

create index IF not exists idx_edge_cases_status on public.edge_cases using btree (status) TABLESPACE pg_default;

create index IF not exists idx_edge_cases_tested on public.edge_cases using btree (tested) TABLESPACE pg_default;

create index IF not exists idx_edge_cases_parent_template on public.edge_cases using btree (parent_template_id) TABLESPACE pg_default;

create index IF not exists idx_edge_cases_created_by on public.edge_cases using btree (created_by) TABLESPACE pg_default;

create index IF not exists idx_edge_cases_category on public.edge_cases using btree (category) TABLESPACE pg_default;

create index IF not exists idx_edge_cases_priority on public.edge_cases using btree (priority desc) TABLESPACE pg_default;

create trigger update_edge_cases_updated_at BEFORE
update on edge_cases for EACH row
execute FUNCTION update_train_updated_at_column ();
