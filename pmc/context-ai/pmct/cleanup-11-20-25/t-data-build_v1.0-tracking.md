

Quick Table Schema
| table_name            | column_name                     | ordinal_position | data_type                   | full_data_type              | is_nullable | column_default            |
| --------------------- | ------------------------------- | ---------------- | --------------------------- | --------------------------- | ----------- | ------------------------- |
| api_response_logs     | id                              | 1                | uuid                        | uuid                        | NO          | gen_random_uuid()         |
| api_response_logs     | timestamp                       | 2                | timestamp with time zone    | timestamp with time zone    | NO          | now()                     |
| api_response_logs     | chunk_id                        | 3                | uuid                        | uuid                        | NO          | null                      |
| api_response_logs     | run_id                          | 4                | uuid                        | uuid                        | YES         | null                      |
| api_response_logs     | template_type                   | 5                | text                        | text                        | NO          | null                      |
| api_response_logs     | template_name                   | 6                | text                        | text                        | NO          | null                      |
| api_response_logs     | model                           | 7                | text                        | text                        | NO          | null                      |
| api_response_logs     | temperature                     | 8                | numeric                     | numeric                     | NO          | null                      |
| api_response_logs     | max_tokens                      | 9                | integer                     | integer(32,0)               | NO          | null                      |
| api_response_logs     | prompt                          | 10               | text                        | text                        | NO          | null                      |
| api_response_logs     | chunk_text_preview              | 11               | text                        | text                        | YES         | null                      |
| api_response_logs     | document_category               | 12               | text                        | text                        | YES         | null                      |
| api_response_logs     | claude_response                 | 13               | jsonb                       | jsonb                       | NO          | null                      |
| api_response_logs     | parsed_successfully             | 14               | boolean                     | boolean                     | NO          | null                      |
| api_response_logs     | extraction_error                | 15               | text                        | text                        | YES         | null                      |
| api_response_logs     | dimensions_extracted            | 16               | jsonb                       | jsonb                       | YES         | null                      |
| api_response_logs     | input_tokens                    | 17               | integer                     | integer(32,0)               | NO          | null                      |
| api_response_logs     | output_tokens                   | 18               | integer                     | integer(32,0)               | NO          | null                      |
| api_response_logs     | estimated_cost_usd              | 19               | numeric                     | numeric                     | NO          | null                      |
| api_response_logs     | created_at                      | 20               | timestamp with time zone    | timestamp with time zone    | NO          | now()                     |
| categories            | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| categories            | name                            | 2                | text                        | text                        | NO          | null                      |
| categories            | description                     | 3                | text                        | text                        | NO          | null                      |
| categories            | examples                        | 4                | ARRAY                       | ARRAY                       | YES         | '{}'::text[]              |
| categories            | is_high_value                   | 5                | boolean                     | boolean                     | YES         | false                     |
| categories            | impact_description              | 6                | text                        | text                        | NO          | null                      |
| categories            | sort_order                      | 7                | integer                     | integer(32,0)               | YES         | 0                         |
| categories            | created_at                      | 8                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| categories            | updated_at                      | 9                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| chunk_dimensions      | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| chunk_dimensions      | chunk_id                        | 2                | uuid                        | uuid                        | NO          | null                      |
| chunk_dimensions      | run_id                          | 3                | uuid                        | uuid                        | NO          | null                      |
| chunk_dimensions      | doc_id                          | 4                | text                        | text                        | YES         | null                      |
| chunk_dimensions      | doc_title                       | 5                | text                        | text                        | YES         | null                      |
| chunk_dimensions      | doc_version                     | 6                | text                        | text                        | YES         | null                      |
| chunk_dimensions      | source_type                     | 7                | text                        | text                        | YES         | null                      |
| chunk_dimensions      | source_url                      | 8                | text                        | text                        | YES         | null                      |
| chunk_dimensions      | author                          | 9                | text                        | text                        | YES         | null                      |
| chunk_dimensions      | doc_date                        | 10               | date                        | date                        | YES         | null                      |
| chunk_dimensions      | primary_category                | 11               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | chunk_summary_1s                | 12               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | key_terms                       | 13               | ARRAY                       | ARRAY                       | YES         | null                      |
| chunk_dimensions      | audience                        | 14               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | intent                          | 15               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | tone_voice_tags                 | 16               | ARRAY                       | ARRAY                       | YES         | null                      |
| chunk_dimensions      | brand_persona_tags              | 17               | ARRAY                       | ARRAY                       | YES         | null                      |
| chunk_dimensions      | domain_tags                     | 18               | ARRAY                       | ARRAY                       | YES         | null                      |
| chunk_dimensions      | task_name                       | 19               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | preconditions                   | 20               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | inputs                          | 21               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | steps_json                      | 22               | jsonb                       | jsonb                       | YES         | null                      |
| chunk_dimensions      | expected_output                 | 23               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | warnings_failure_modes          | 24               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | claim                           | 25               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | evidence_snippets               | 26               | ARRAY                       | ARRAY                       | YES         | null                      |
| chunk_dimensions      | reasoning_sketch                | 27               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | citations                       | 28               | ARRAY                       | ARRAY                       | YES         | null                      |
| chunk_dimensions      | factual_confidence_0_1          | 29               | numeric                     | numeric(3,2)                | YES         | null                      |
| chunk_dimensions      | scenario_type                   | 30               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | problem_context                 | 31               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | solution_action                 | 32               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | outcome_metrics                 | 33               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | style_notes                     | 34               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | prompt_candidate                | 35               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | target_answer                   | 36               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | style_directives                | 37               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | safety_tags                     | 38               | ARRAY                       | ARRAY                       | YES         | null                      |
| chunk_dimensions      | coverage_tag                    | 39               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | novelty_tag                     | 40               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | ip_sensitivity                  | 41               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | pii_flag                        | 42               | boolean                     | boolean                     | YES         | false                     |
| chunk_dimensions      | compliance_flags                | 43               | ARRAY                       | ARRAY                       | YES         | null                      |
| chunk_dimensions      | embedding_id                    | 44               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | vector_checksum                 | 45               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | label_source_auto_manual_mixed  | 46               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | label_model                     | 47               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | labeled_by                      | 48               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | label_timestamp_iso             | 49               | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| chunk_dimensions      | review_status                   | 50               | text                        | text                        | YES         | 'unreviewed'::text        |
| chunk_dimensions      | include_in_training_yn          | 51               | boolean                     | boolean                     | YES         | true                      |
| chunk_dimensions      | data_split_train_dev_test       | 52               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | augmentation_notes              | 53               | text                        | text                        | YES         | null                      |
| chunk_dimensions      | generation_confidence_precision | 54               | integer                     | integer(32,0)               | YES         | null                      |
| chunk_dimensions      | generation_confidence_accuracy  | 55               | integer                     | integer(32,0)               | YES         | null                      |
| chunk_dimensions      | generation_cost_usd             | 56               | numeric                     | numeric(10,4)               | YES         | null                      |
| chunk_dimensions      | generation_duration_ms          | 57               | integer                     | integer(32,0)               | YES         | null                      |
| chunk_dimensions      | prompt_template_id              | 58               | uuid                        | uuid                        | YES         | null                      |
| chunk_dimensions      | generated_at                    | 59               | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| chunk_extraction_jobs | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| chunk_extraction_jobs | document_id                     | 2                | uuid                        | uuid                        | NO          | null                      |
| chunk_extraction_jobs | status                          | 3                | text                        | text                        | YES         | 'pending'::text           |
| chunk_extraction_jobs | progress_percentage             | 4                | integer                     | integer(32,0)               | YES         | 0                         |
| chunk_extraction_jobs | current_step                    | 5                | text                        | text                        | YES         | null                      |
| chunk_extraction_jobs | total_chunks_extracted          | 6                | integer                     | integer(32,0)               | YES         | 0                         |
| chunk_extraction_jobs | error_message                   | 7                | text                        | text                        | YES         | null                      |
| chunk_extraction_jobs | created_at                      | 8                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| chunk_extraction_jobs | started_at                      | 9                | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| chunk_extraction_jobs | completed_at                    | 10               | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| chunk_extraction_jobs | created_by                      | 11               | uuid                        | uuid                        | YES         | null                      |
| chunk_runs            | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| chunk_runs            | run_id                          | 2                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| chunk_runs            | document_id                     | 3                | uuid                        | uuid                        | NO          | null                      |
| chunk_runs            | run_name                        | 4                | text                        | text                        | NO          | null                      |
| chunk_runs            | total_chunks                    | 5                | integer                     | integer(32,0)               | YES         | null                      |
| chunk_runs            | total_dimensions                | 6                | integer                     | integer(32,0)               | YES         | null                      |
| chunk_runs            | total_cost_usd                  | 7                | numeric                     | numeric(10,2)               | YES         | null                      |
| chunk_runs            | total_duration_ms               | 8                | integer                     | integer(32,0)               | YES         | null                      |
| chunk_runs            | ai_model                        | 9                | text                        | text                        | YES         | 'claude-sonnet-4.5'::text |
| chunk_runs            | status                          | 10               | text                        | text                        | YES         | 'running'::text           |
| chunk_runs            | error_message                   | 11               | text                        | text                        | YES         | null                      |
| chunk_runs            | started_at                      | 12               | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| chunk_runs            | completed_at                    | 13               | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| chunk_runs            | created_by                      | 14               | uuid                        | uuid                        | YES         | null                      |
| chunks                | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| chunks                | chunk_id                        | 2                | text                        | text                        | NO          | null                      |
| chunks                | document_id                     | 3                | uuid                        | uuid                        | NO          | null                      |
| chunks                | chunk_type                      | 4                | text                        | text                        | NO          | null                      |
| chunks                | section_heading                 | 5                | text                        | text                        | YES         | null                      |
| chunks                | page_start                      | 6                | integer                     | integer(32,0)               | YES         | null                      |
| chunks                | page_end                        | 7                | integer                     | integer(32,0)               | YES         | null                      |
| chunks                | char_start                      | 8                | integer                     | integer(32,0)               | NO          | null                      |
| chunks                | char_end                        | 9                | integer                     | integer(32,0)               | NO          | null                      |
| chunks                | token_count                     | 10               | integer                     | integer(32,0)               | NO          | null                      |
| chunks                | overlap_tokens                  | 11               | integer                     | integer(32,0)               | YES         | 0                         |
| chunks                | chunk_handle                    | 12               | text                        | text                        | YES         | null                      |
| chunks                | chunk_text                      | 13               | text                        | text                        | NO          | null                      |
| chunks                | created_at                      | 14               | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| chunks                | updated_at                      | 15               | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| chunks                | created_by                      | 16               | uuid                        | uuid                        | YES         | null                      |
| custom_tags           | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| custom_tags           | dimension_id                    | 2                | uuid                        | uuid                        | NO          | null                      |
| custom_tags           | name                            | 3                | text                        | text                        | NO          | null                      |
| custom_tags           | description                     | 4                | text                        | text                        | YES         | null                      |
| custom_tags           | created_by                      | 5                | uuid                        | uuid                        | YES         | null                      |
| custom_tags           | organization_id                 | 6                | uuid                        | uuid                        | YES         | null                      |
| custom_tags           | usage_count                     | 7                | integer                     | integer(32,0)               | YES         | 0                         |
| custom_tags           | created_at                      | 8                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| custom_tags           | updated_at                      | 9                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| custom_tags           | is_approved                     | 10               | boolean                     | boolean                     | YES         | false                     |
| dimension_metadata    | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| dimension_metadata    | field_name                      | 2                | text                        | text                        | NO          | null                      |
| dimension_metadata    | description                     | 3                | text                        | text                        | NO          | null                      |
| dimension_metadata    | data_type                       | 4                | text                        | text                        | NO          | null                      |
| dimension_metadata    | allowed_values_format           | 5                | text                        | text                        | YES         | null                      |
| dimension_metadata    | generation_type                 | 6                | text                        | text                        | NO          | null                      |
| dimension_metadata    | example_value                   | 7                | text                        | text                        | YES         | null                      |
| dimension_metadata    | is_required                     | 8                | boolean                     | boolean                     | YES         | false                     |
| dimension_metadata    | display_order                   | 9                | integer                     | integer(32,0)               | NO          | null                      |
| dimension_metadata    | category                        | 10               | text                        | text                        | NO          | null                      |
| dimension_metadata    | created_at                      | 11               | timestamp without time zone | timestamp without time zone | YES         | now()                     |
| dimension_metadata    | updated_at                      | 12               | timestamp without time zone | timestamp without time zone | YES         | now()                     |
| document_categories   | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| document_categories   | document_id                     | 2                | uuid                        | uuid                        | NO          | null                      |
| document_categories   | category_id                     | 3                | uuid                        | uuid                        | NO          | null                      |
| document_categories   | workflow_session_id             | 4                | uuid                        | uuid                        | YES         | null                      |
| document_categories   | belonging_rating                | 5                | integer                     | integer(32,0)               | YES         | null                      |
| document_categories   | assigned_by                     | 6                | uuid                        | uuid                        | YES         | null                      |
| document_categories   | assigned_at                     | 7                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| document_categories   | is_primary                      | 8                | boolean                     | boolean                     | YES         | true                      |
| document_categories   | confidence_score                | 9                | numeric                     | numeric(3,2)                | YES         | null                      |
| document_tags         | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| document_tags         | document_id                     | 2                | uuid                        | uuid                        | NO          | null                      |
| document_tags         | tag_id                          | 3                | uuid                        | uuid                        | NO          | null                      |
| document_tags         | dimension_id                    | 4                | uuid                        | uuid                        | NO          | null                      |
| document_tags         | workflow_session_id             | 5                | uuid                        | uuid                        | YES         | null                      |
| document_tags         | assigned_by                     | 6                | uuid                        | uuid                        | YES         | null                      |
| document_tags         | assigned_at                     | 7                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| document_tags         | is_custom_tag                   | 8                | boolean                     | boolean                     | YES         | false                     |
| document_tags         | custom_tag_data                 | 9                | jsonb                       | jsonb                       | YES         | null                      |
| document_tags         | confidence_score                | 10               | numeric                     | numeric(3,2)                | YES         | null                      |
| documents             | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| documents             | title                           | 2                | text                        | text                        | NO          | null                      |
| documents             | content                         | 3                | text                        | text                        | YES         | null                      |
| documents             | summary                         | 4                | text                        | text                        | YES         | null                      |
| documents             | created_at                      | 5                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| documents             | updated_at                      | 6                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| documents             | author_id                       | 7                | uuid                        | uuid                        | YES         | null                      |
| documents             | status                          | 8                | text                        | text                        | YES         | 'pending'::text           |
| documents             | file_path                       | 9                | text                        | text                        | YES         | null                      |
| documents             | file_size                       | 10               | integer                     | integer(32,0)               | YES         | null                      |
| documents             | metadata                        | 11               | jsonb                       | jsonb                       | YES         | '{}'::jsonb               |
| documents             | chunk_extraction_status         | 12               | text                        | text                        | YES         | 'not_started'::text       |
| documents             | total_chunks_extracted          | 13               | integer                     | integer(32,0)               | YES         | 0                         |
| documents             | doc_version                     | 14               | text                        | text                        | YES         | null                      |
| documents             | source_type                     | 15               | text                        | text                        | YES         | null                      |
| documents             | source_url                      | 16               | text                        | text                        | YES         | null                      |
| documents             | doc_date                        | 17               | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| documents             | processing_progress             | 18               | integer                     | integer(32,0)               | YES         | 0                         |
| documents             | processing_error                | 19               | text                        | text                        | YES         | null                      |
| documents             | processing_started_at           | 20               | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| documents             | processing_completed_at         | 21               | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| processing_jobs       | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| processing_jobs       | workflow_session_id             | 2                | uuid                        | uuid                        | YES         | null                      |
| processing_jobs       | status                          | 3                | text                        | text                        | YES         | 'pending'::text           |
| processing_jobs       | processing_type                 | 4                | text                        | text                        | YES         | null                      |
| processing_jobs       | progress_percentage             | 5                | integer                     | integer(32,0)               | YES         | 0                         |
| processing_jobs       | result_data                     | 6                | jsonb                       | jsonb                       | YES         | null                      |
| processing_jobs       | error_message                   | 7                | text                        | text                        | YES         | null                      |
| processing_jobs       | started_at                      | 8                | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| processing_jobs       | completed_at                    | 9                | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| processing_jobs       | created_at                      | 10               | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| processing_jobs       | updated_at                      | 11               | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| prompt_templates      | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| prompt_templates      | template_name                   | 2                | text                        | text                        | NO          | null                      |
| prompt_templates      | template_type                   | 3                | text                        | text                        | NO          | null                      |
| prompt_templates      | prompt_text                     | 4                | text                        | text                        | NO          | null                      |
| prompt_templates      | response_schema                 | 5                | jsonb                       | jsonb                       | YES         | null                      |
| prompt_templates      | applicable_chunk_types          | 6                | ARRAY                       | ARRAY                       | YES         | null                      |
| prompt_templates      | version                         | 7                | integer                     | integer(32,0)               | YES         | 1                         |
| prompt_templates      | is_active                       | 8                | boolean                     | boolean                     | YES         | true                      |
| prompt_templates      | created_at                      | 9                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| prompt_templates      | updated_at                      | 10               | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| prompt_templates      | created_by                      | 11               | uuid                        | uuid                        | YES         | null                      |
| prompt_templates      | notes                           | 12               | text                        | text                        | YES         | null                      |
| tag_dimensions        | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| tag_dimensions        | name                            | 2                | text                        | text                        | NO          | null                      |
| tag_dimensions        | description                     | 3                | text                        | text                        | NO          | null                      |
| tag_dimensions        | multi_select                    | 4                | boolean                     | boolean                     | YES         | false                     |
| tag_dimensions        | required                        | 5                | boolean                     | boolean                     | YES         | false                     |
| tag_dimensions        | sort_order                      | 6                | integer                     | integer(32,0)               | YES         | 0                         |
| tag_dimensions        | created_at                      | 7                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| tag_dimensions        | updated_at                      | 8                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| tags                  | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| tags                  | dimension_id                    | 2                | uuid                        | uuid                        | YES         | null                      |
| tags                  | name                            | 3                | text                        | text                        | NO          | null                      |
| tags                  | description                     | 4                | text                        | text                        | NO          | null                      |
| tags                  | icon                            | 5                | text                        | text                        | YES         | null                      |
| tags                  | risk_level                      | 6                | integer                     | integer(32,0)               | YES         | null                      |
| tags                  | sort_order                      | 7                | integer                     | integer(32,0)               | YES         | 0                         |
| tags                  | created_at                      | 8                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| tags                  | updated_at                      | 9                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| user_profiles         | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| user_profiles         | email                           | 2                | text                        | text                        | NO          | null                      |
| user_profiles         | full_name                       | 3                | text                        | text                        | NO          | null                      |
| user_profiles         | role                            | 4                | text                        | text                        | YES         | 'user'::text              |
| user_profiles         | organization_id                 | 5                | uuid                        | uuid                        | YES         | null                      |
| user_profiles         | preferences                     | 6                | jsonb                       | jsonb                       | YES         | '{}'::jsonb               |
| user_profiles         | created_at                      | 7                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| user_profiles         | updated_at                      | 8                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| user_profiles         | last_login_at                   | 9                | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| user_profiles         | auth_provider                   | 10               | text                        | text                        | YES         | 'email'::text             |
| user_profiles         | email_confirmed                 | 11               | boolean                     | boolean                     | YES         | false                     |
| user_profiles         | phone                           | 12               | text                        | text                        | YES         | null                      |
| user_profiles         | avatar_url                      | 13               | text                        | text                        | YES         | null                      |
| user_profiles         | timezone                        | 14               | text                        | text                        | YES         | 'UTC'::text               |
| user_profiles         | locale                          | 15               | text                        | text                        | YES         | 'en'::text                |
| user_profiles         | is_active                       | 16               | boolean                     | boolean                     | YES         | true                      |
| user_profiles         | terms_accepted_at               | 17               | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| user_profiles         | privacy_accepted_at             | 18               | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| user_profiles         | last_sign_in_at                 | 19               | timestamp with time zone    | timestamp with time zone    | YES         | null                      |
| workflow_metadata     | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| workflow_metadata     | workflow_session_id             | 2                | uuid                        | uuid                        | NO          | null                      |
| workflow_metadata     | step                            | 3                | text                        | text                        | NO          | null                      |
| workflow_metadata     | metadata_key                    | 4                | text                        | text                        | NO          | null                      |
| workflow_metadata     | metadata_value                  | 5                | jsonb                       | jsonb                       | YES         | null                      |
| workflow_metadata     | created_at                      | 6                | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| workflow_sessions     | id                              | 1                | uuid                        | uuid                        | NO          | uuid_generate_v4()        |
| workflow_sessions     | document_id                     | 2                | uuid                        | uuid                        | YES         | null                      |
| workflow_sessions     | user_id                         | 3                | uuid                        | uuid                        | YES         | null                      |
| workflow_sessions     | step                            | 4                | text                        | text                        | YES         | 'A'::text                 |
| workflow_sessions     | belonging_rating                | 5                | integer                     | integer(32,0)               | YES         | null                      |
| workflow_sessions     | selected_category_id            | 6                | uuid                        | uuid                        | YES         | null                      |
| workflow_sessions     | selected_tags                   | 7                | jsonb                       | jsonb                       | YES         | '{}'::jsonb               |
| workflow_sessions     | custom_tags                     | 8                | jsonb                       | jsonb                       | YES         | '[]'::jsonb               |
| workflow_sessions     | is_draft                        | 9                | boolean                     | boolean                     | YES         | true                      |
| workflow_sessions     | completed_steps                 | 10               | ARRAY                       | ARRAY                       | YES         | '{}'::text[]              |
| workflow_sessions     | created_at                      | 11               | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| workflow_sessions     | updated_at                      | 12               | timestamp with time zone    | timestamp with time zone    | YES         | now()                     |
| workflow_sessions     | completed_at                    | 13               | timestamp with time zone    | timestamp with time zone    | YES         | null                      |



Quick Primary Keys
| table_name            | column_name | constraint_type |
| --------------------- | ----------- | --------------- |
| api_response_logs     | id          | PRIMARY KEY     |
| categories            | id          | PRIMARY KEY     |
| chunk_dimensions      | id          | PRIMARY KEY     |
| chunk_extraction_jobs | id          | PRIMARY KEY     |
| chunk_runs            | id          | PRIMARY KEY     |
| chunks                | id          | PRIMARY KEY     |
| custom_tags           | id          | PRIMARY KEY     |
| dimension_metadata    | id          | PRIMARY KEY     |
| document_categories   | id          | PRIMARY KEY     |
| document_tags         | id          | PRIMARY KEY     |
| documents             | id          | PRIMARY KEY     |
| processing_jobs       | id          | PRIMARY KEY     |
| prompt_templates      | id          | PRIMARY KEY     |
| tag_dimensions        | id          | PRIMARY KEY     |
| tags                  | id          | PRIMARY KEY     |
| user_profiles         | id          | PRIMARY KEY     |
| workflow_metadata     | id          | PRIMARY KEY     |
| workflow_sessions     | id          | PRIMARY KEY     |


Quick Foreign Keys
| table_name            | column_name          | foreign_table_name | foreign_column_name |
| --------------------- | -------------------- | ------------------ | ------------------- |
| api_response_logs     | chunk_id             | chunks             | id                  |
| api_response_logs     | run_id               | chunk_runs         | run_id              |
| chunk_dimensions      | chunk_id             | chunks             | id                  |
| chunk_dimensions      | chunk_id             | chunks             | id                  |
| chunk_extraction_jobs | document_id          | documents          | id                  |
| chunk_extraction_jobs | created_by           | user_profiles      | id                  |
| chunk_runs            | created_by           | user_profiles      | id                  |
| chunk_runs            | document_id          | documents          | id                  |
| chunks                | created_by           | user_profiles      | id                  |
| chunks                | document_id          | documents          | id                  |
| chunks                | document_id          | documents          | id                  |
| custom_tags           | dimension_id         | tag_dimensions     | id                  |
| custom_tags           | created_by           | user_profiles      | id                  |
| document_categories   | workflow_session_id  | workflow_sessions  | id                  |
| document_categories   | document_id          | documents          | id                  |
| document_categories   | category_id          | categories         | id                  |
| document_categories   | assigned_by          | user_profiles      | id                  |
| document_tags         | dimension_id         | tag_dimensions     | id                  |
| document_tags         | assigned_by          | user_profiles      | id                  |
| document_tags         | tag_id               | tags               | id                  |
| document_tags         | document_id          | documents          | id                  |
| document_tags         | workflow_session_id  | workflow_sessions  | id                  |
| documents             | author_id            | user_profiles      | id                  |
| processing_jobs       | workflow_session_id  | workflow_sessions  | id                  |
| prompt_templates      | created_by           | user_profiles      | id                  |
| tags                  | dimension_id         | tag_dimensions     | id                  |
| workflow_metadata     | workflow_session_id  | workflow_sessions  | id                  |
| workflow_sessions     | user_id              | user_profiles      | id                  |
| workflow_sessions     | document_id          | documents          | id                  |
| workflow_sessions     | selected_category_id | categories         | id                  |



Quick Indexes
| object_type | table_name            | index_name                             | index_type    | index_definition                                                                                                                                                  |
| ----------- | --------------------- | -------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INDEX       | api_response_logs     | api_response_logs_pkey                 | UNIQUE INDEX  | CREATE UNIQUE INDEX api_response_logs_pkey ON public.api_response_logs USING btree (id)                                                                           |
| INDEX       | api_response_logs     | idx_api_response_logs_chunk_id         | REGULAR INDEX | CREATE INDEX idx_api_response_logs_chunk_id ON public.api_response_logs USING btree (chunk_id)                                                                    |
| INDEX       | api_response_logs     | idx_api_response_logs_created_at       | REGULAR INDEX | CREATE INDEX idx_api_response_logs_created_at ON public.api_response_logs USING btree (created_at)                                                                |
| INDEX       | api_response_logs     | idx_api_response_logs_run_id           | REGULAR INDEX | CREATE INDEX idx_api_response_logs_run_id ON public.api_response_logs USING btree (run_id)                                                                        |
| INDEX       | api_response_logs     | idx_api_response_logs_template_type    | REGULAR INDEX | CREATE INDEX idx_api_response_logs_template_type ON public.api_response_logs USING btree (template_type)                                                          |
| INDEX       | api_response_logs     | idx_api_response_logs_timestamp        | REGULAR INDEX | CREATE INDEX idx_api_response_logs_timestamp ON public.api_response_logs USING btree ("timestamp")                                                                |
| INDEX       | categories            | categories_pkey                        | UNIQUE INDEX  | CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id)                                                                                         |
| INDEX       | chunk_dimensions      | chunk_dimensions_pkey                  | UNIQUE INDEX  | CREATE UNIQUE INDEX chunk_dimensions_pkey ON public.chunk_dimensions USING btree (id)                                                                             |
| INDEX       | chunk_dimensions      | idx_chunk_dims_chunk_id                | REGULAR INDEX | CREATE INDEX idx_chunk_dims_chunk_id ON public.chunk_dimensions USING btree (chunk_id)                                                                            |
| INDEX       | chunk_dimensions      | idx_chunk_dims_run                     | REGULAR INDEX | CREATE INDEX idx_chunk_dims_run ON public.chunk_dimensions USING btree (run_id)                                                                                   |
| INDEX       | chunk_extraction_jobs | chunk_extraction_jobs_pkey             | UNIQUE INDEX  | CREATE UNIQUE INDEX chunk_extraction_jobs_pkey ON public.chunk_extraction_jobs USING btree (id)                                                                   |
| INDEX       | chunk_extraction_jobs | idx_extraction_jobs_document           | REGULAR INDEX | CREATE INDEX idx_extraction_jobs_document ON public.chunk_extraction_jobs USING btree (document_id)                                                               |
| INDEX       | chunk_extraction_jobs | idx_extraction_jobs_status             | REGULAR INDEX | CREATE INDEX idx_extraction_jobs_status ON public.chunk_extraction_jobs USING btree (status)                                                                      |
| INDEX       | chunk_runs            | chunk_runs_pkey                        | UNIQUE INDEX  | CREATE UNIQUE INDEX chunk_runs_pkey ON public.chunk_runs USING btree (id)                                                                                         |
| INDEX       | chunk_runs            | chunk_runs_run_id_key                  | UNIQUE INDEX  | CREATE UNIQUE INDEX chunk_runs_run_id_key ON public.chunk_runs USING btree (run_id)                                                                               |
| INDEX       | chunk_runs            | idx_chunk_runs_document                | REGULAR INDEX | CREATE INDEX idx_chunk_runs_document ON public.chunk_runs USING btree (document_id)                                                                               |
| INDEX       | chunk_runs            | idx_chunk_runs_status                  | REGULAR INDEX | CREATE INDEX idx_chunk_runs_status ON public.chunk_runs USING btree (status)                                                                                      |
| INDEX       | chunks                | chunks_chunk_id_key                    | UNIQUE INDEX  | CREATE UNIQUE INDEX chunks_chunk_id_key ON public.chunks USING btree (chunk_id)                                                                                   |
| INDEX       | chunks                | chunks_pkey                            | UNIQUE INDEX  | CREATE UNIQUE INDEX chunks_pkey ON public.chunks USING btree (id)                                                                                                 |
| INDEX       | chunks                | idx_chunks_document_id                 | REGULAR INDEX | CREATE INDEX idx_chunks_document_id ON public.chunks USING btree (document_id)                                                                                    |
| INDEX       | chunks                | idx_chunks_handle                      | REGULAR INDEX | CREATE INDEX idx_chunks_handle ON public.chunks USING btree (chunk_handle)                                                                                        |
| INDEX       | chunks                | idx_chunks_type                        | REGULAR INDEX | CREATE INDEX idx_chunks_type ON public.chunks USING btree (chunk_type)                                                                                            |
| INDEX       | custom_tags           | custom_tags_pkey                       | UNIQUE INDEX  | CREATE UNIQUE INDEX custom_tags_pkey ON public.custom_tags USING btree (id)                                                                                       |
| INDEX       | custom_tags           | idx_custom_tag_created_by              | REGULAR INDEX | CREATE INDEX idx_custom_tag_created_by ON public.custom_tags USING btree (created_by)                                                                             |
| INDEX       | custom_tags           | idx_custom_tag_dimension               | REGULAR INDEX | CREATE INDEX idx_custom_tag_dimension ON public.custom_tags USING btree (dimension_id)                                                                            |
| INDEX       | custom_tags           | idx_custom_tag_org                     | REGULAR INDEX | CREATE INDEX idx_custom_tag_org ON public.custom_tags USING btree (organization_id)                                                                               |
| INDEX       | custom_tags           | idx_custom_tag_usage                   | REGULAR INDEX | CREATE INDEX idx_custom_tag_usage ON public.custom_tags USING btree (usage_count DESC)                                                                            |
| INDEX       | custom_tags           | uq_custom_tag_name                     | UNIQUE INDEX  | CREATE UNIQUE INDEX uq_custom_tag_name ON public.custom_tags USING btree (dimension_id, name, organization_id)                                                    |
| INDEX       | dimension_metadata    | dimension_metadata_field_name_key      | UNIQUE INDEX  | CREATE UNIQUE INDEX dimension_metadata_field_name_key ON public.dimension_metadata USING btree (field_name)                                                       |
| INDEX       | dimension_metadata    | dimension_metadata_pkey                | UNIQUE INDEX  | CREATE UNIQUE INDEX dimension_metadata_pkey ON public.dimension_metadata USING btree (id)                                                                         |
| INDEX       | dimension_metadata    | idx_dimension_metadata_category        | REGULAR INDEX | CREATE INDEX idx_dimension_metadata_category ON public.dimension_metadata USING btree (category)                                                                  |
| INDEX       | dimension_metadata    | idx_dimension_metadata_display_order   | REGULAR INDEX | CREATE INDEX idx_dimension_metadata_display_order ON public.dimension_metadata USING btree (display_order)                                                        |
| INDEX       | dimension_metadata    | idx_dimension_metadata_field_name      | REGULAR INDEX | CREATE INDEX idx_dimension_metadata_field_name ON public.dimension_metadata USING btree (field_name)                                                              |
| INDEX       | dimension_metadata    | idx_dimension_metadata_generation_type | REGULAR INDEX | CREATE INDEX idx_dimension_metadata_generation_type ON public.dimension_metadata USING btree (generation_type)                                                    |
| INDEX       | document_categories   | document_categories_pkey               | UNIQUE INDEX  | CREATE UNIQUE INDEX document_categories_pkey ON public.document_categories USING btree (id)                                                                       |
| INDEX       | document_categories   | idx_doc_cat_category                   | REGULAR INDEX | CREATE INDEX idx_doc_cat_category ON public.document_categories USING btree (category_id)                                                                         |
| INDEX       | document_categories   | idx_doc_cat_document                   | REGULAR INDEX | CREATE INDEX idx_doc_cat_document ON public.document_categories USING btree (document_id)                                                                         |
| INDEX       | document_categories   | idx_doc_cat_rating                     | REGULAR INDEX | CREATE INDEX idx_doc_cat_rating ON public.document_categories USING btree (belonging_rating)                                                                      |
| INDEX       | document_categories   | idx_doc_cat_session                    | REGULAR INDEX | CREATE INDEX idx_doc_cat_session ON public.document_categories USING btree (workflow_session_id)                                                                  |
| INDEX       | document_categories   | uq_doc_primary_category                | UNIQUE INDEX  | CREATE UNIQUE INDEX uq_doc_primary_category ON public.document_categories USING btree (document_id, is_primary)                                                   |
| INDEX       | document_tags         | document_tags_pkey                     | UNIQUE INDEX  | CREATE UNIQUE INDEX document_tags_pkey ON public.document_tags USING btree (id)                                                                                   |
| INDEX       | document_tags         | idx_doc_tag_assigned_at                | REGULAR INDEX | CREATE INDEX idx_doc_tag_assigned_at ON public.document_tags USING btree (assigned_at)                                                                            |
| INDEX       | document_tags         | idx_doc_tag_dimension                  | REGULAR INDEX | CREATE INDEX idx_doc_tag_dimension ON public.document_tags USING btree (dimension_id)                                                                             |
| INDEX       | document_tags         | idx_doc_tag_doc_dim                    | REGULAR INDEX | CREATE INDEX idx_doc_tag_doc_dim ON public.document_tags USING btree (document_id, dimension_id)                                                                  |
| INDEX       | document_tags         | idx_doc_tag_document                   | REGULAR INDEX | CREATE INDEX idx_doc_tag_document ON public.document_tags USING btree (document_id)                                                                               |
| INDEX       | document_tags         | idx_doc_tag_session                    | REGULAR INDEX | CREATE INDEX idx_doc_tag_session ON public.document_tags USING btree (workflow_session_id)                                                                        |
| INDEX       | document_tags         | idx_doc_tag_tag                        | REGULAR INDEX | CREATE INDEX idx_doc_tag_tag ON public.document_tags USING btree (tag_id)                                                                                         |
| INDEX       | document_tags         | idx_doc_tag_tag_doc                    | REGULAR INDEX | CREATE INDEX idx_doc_tag_tag_doc ON public.document_tags USING btree (tag_id, document_id)                                                                        |
| INDEX       | document_tags         | uq_doc_tag                             | UNIQUE INDEX  | CREATE UNIQUE INDEX uq_doc_tag ON public.document_tags USING btree (document_id, tag_id)                                                                          |
| INDEX       | documents             | documents_pkey                         | UNIQUE INDEX  | CREATE UNIQUE INDEX documents_pkey ON public.documents USING btree (id)                                                                                           |
| INDEX       | documents             | idx_documents_author_id                | REGULAR INDEX | CREATE INDEX idx_documents_author_id ON public.documents USING btree (author_id)                                                                                  |
| INDEX       | documents             | idx_documents_created_at               | REGULAR INDEX | CREATE INDEX idx_documents_created_at ON public.documents USING btree (created_at)                                                                                |
| INDEX       | documents             | idx_documents_source_type              | REGULAR INDEX | CREATE INDEX idx_documents_source_type ON public.documents USING btree (source_type)                                                                              |
| INDEX       | documents             | idx_documents_status                   | REGULAR INDEX | CREATE INDEX idx_documents_status ON public.documents USING btree (status)                                                                                        |
| INDEX       | documents             | idx_documents_status_updated           | REGULAR INDEX | CREATE INDEX idx_documents_status_updated ON public.documents USING btree (status, updated_at) WHERE (status = ANY (ARRAY['uploaded'::text, 'processing'::text])) |
| INDEX       | processing_jobs       | processing_jobs_pkey                   | UNIQUE INDEX  | CREATE UNIQUE INDEX processing_jobs_pkey ON public.processing_jobs USING btree (id)                                                                               |
| INDEX       | prompt_templates      | prompt_templates_pkey                  | UNIQUE INDEX  | CREATE UNIQUE INDEX prompt_templates_pkey ON public.prompt_templates USING btree (id)                                                                             |
| INDEX       | prompt_templates      | prompt_templates_template_name_key     | UNIQUE INDEX  | CREATE UNIQUE INDEX prompt_templates_template_name_key ON public.prompt_templates USING btree (template_name)                                                     |
| INDEX       | tag_dimensions        | tag_dimensions_pkey                    | UNIQUE INDEX  | CREATE UNIQUE INDEX tag_dimensions_pkey ON public.tag_dimensions USING btree (id)                                                                                 |
| INDEX       | tags                  | tags_pkey                              | UNIQUE INDEX  | CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id)                                                                                                     |
| INDEX       | user_profiles         | user_profiles_email_key                | UNIQUE INDEX  | CREATE UNIQUE INDEX user_profiles_email_key ON public.user_profiles USING btree (email)                                                                           |
| INDEX       | user_profiles         | user_profiles_pkey                     | UNIQUE INDEX  | CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id)                                                                                   |
| INDEX       | workflow_metadata     | idx_workflow_metadata_session          | REGULAR INDEX | CREATE INDEX idx_workflow_metadata_session ON public.workflow_metadata USING btree (workflow_session_id)                                                          |
| INDEX       | workflow_metadata     | idx_workflow_metadata_step             | REGULAR INDEX | CREATE INDEX idx_workflow_metadata_step ON public.workflow_metadata USING btree (step)                                                                            |
| INDEX       | workflow_metadata     | uq_workflow_metadata                   | UNIQUE INDEX  | CREATE UNIQUE INDEX uq_workflow_metadata ON public.workflow_metadata USING btree (workflow_session_id, step, metadata_key)                                        |
| INDEX       | workflow_metadata     | workflow_metadata_pkey                 | UNIQUE INDEX  | CREATE UNIQUE INDEX workflow_metadata_pkey ON public.workflow_metadata USING btree (id)                                                                           |
| INDEX       | workflow_sessions     | idx_workflow_sessions_document_id      | REGULAR INDEX | CREATE INDEX idx_workflow_sessions_document_id ON public.workflow_sessions USING btree (document_id)                                                              |
| INDEX       | workflow_sessions     | idx_workflow_sessions_status           | REGULAR INDEX | CREATE INDEX idx_workflow_sessions_status ON public.workflow_sessions USING btree (step)                                                                          |
| INDEX       | workflow_sessions     | idx_workflow_sessions_user_id          | REGULAR INDEX | CREATE INDEX idx_workflow_sessions_user_id ON public.workflow_sessions USING btree (user_id)                                                                      |
| INDEX       | workflow_sessions     | workflow_sessions_pkey                 | UNIQUE INDEX  | CREATE UNIQUE INDEX workflow_sessions_pkey ON public.workflow_sessions USING btree (id)                                                                           |




Constraints

| object_type | table_name            | constraint_name                                        | constraint_type | constraint_definition                                                                                                                 | referenced_table      | referenced_column               |
| ----------- | --------------------- | ------------------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------- |
| CONSTRAINT  | api_response_logs     | 2200_56441_10_not_null                                 | CHECK           | prompt IS NOT NULL                                                                                                                    | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_13_not_null                                 | CHECK           | claude_response IS NOT NULL                                                                                                           | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_14_not_null                                 | CHECK           | parsed_successfully IS NOT NULL                                                                                                       | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_17_not_null                                 | CHECK           | input_tokens IS NOT NULL                                                                                                              | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_18_not_null                                 | CHECK           | output_tokens IS NOT NULL                                                                                                             | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_19_not_null                                 | CHECK           | estimated_cost_usd IS NOT NULL                                                                                                        | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_20_not_null                                 | CHECK           | created_at IS NOT NULL                                                                                                                | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_2_not_null                                  | CHECK           | timestamp IS NOT NULL                                                                                                                 | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_3_not_null                                  | CHECK           | chunk_id IS NOT NULL                                                                                                                  | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_5_not_null                                  | CHECK           | template_type IS NOT NULL                                                                                                             | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_6_not_null                                  | CHECK           | template_name IS NOT NULL                                                                                                             | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_7_not_null                                  | CHECK           | model IS NOT NULL                                                                                                                     | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_8_not_null                                  | CHECK           | temperature IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | api_response_logs     | 2200_56441_9_not_null                                  | CHECK           | max_tokens IS NOT NULL                                                                                                                | null                  | null                            |
| CONSTRAINT  | api_response_logs     | api_response_logs_chunk_id_fkey                        | FOREIGN KEY     | REFERENCES chunks(id)                                                                                                                 | chunks                | id                              |
| CONSTRAINT  | api_response_logs     | api_response_logs_run_id_fkey                          | FOREIGN KEY     | REFERENCES chunk_runs(run_id)                                                                                                         | chunk_runs            | run_id                          |
| CONSTRAINT  | api_response_logs     | api_response_logs_pkey                                 | PRIMARY KEY     | N/A                                                                                                                                   | api_response_logs     | id                              |
| CONSTRAINT  | categories            | 2200_34232_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | categories            | 2200_34232_2_not_null                                  | CHECK           | name IS NOT NULL                                                                                                                      | null                  | null                            |
| CONSTRAINT  | categories            | 2200_34232_3_not_null                                  | CHECK           | description IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | categories            | 2200_34232_6_not_null                                  | CHECK           | impact_description IS NOT NULL                                                                                                        | null                  | null                            |
| CONSTRAINT  | categories            | categories_pkey                                        | PRIMARY KEY     | N/A                                                                                                                                   | categories            | id                              |
| CONSTRAINT  | chunk_dimensions      | 2200_52382_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | chunk_dimensions      | 2200_52382_2_not_null                                  | CHECK           | chunk_id IS NOT NULL                                                                                                                  | null                  | null                            |
| CONSTRAINT  | chunk_dimensions      | 2200_52382_3_not_null                                  | CHECK           | run_id IS NOT NULL                                                                                                                    | null                  | null                            |
| CONSTRAINT  | chunk_dimensions      | chunk_dimensions_generation_confidence_accuracy_check  | CHECK           | ((generation_confidence_accuracy >= 1) AND (generation_confidence_accuracy <= 10))                                                    | chunk_dimensions      | generation_confidence_accuracy  |
| CONSTRAINT  | chunk_dimensions      | chunk_dimensions_generation_confidence_precision_check | CHECK           | ((generation_confidence_precision >= 1) AND (generation_confidence_precision <= 10))                                                  | chunk_dimensions      | generation_confidence_precision |
| CONSTRAINT  | chunk_dimensions      | chunk_dimensions_chunk_id_fkey                         | FOREIGN KEY     | REFERENCES chunks(id)                                                                                                                 | chunks                | id                              |
| CONSTRAINT  | chunk_dimensions      | idx_chunk_dims_chunk                                   | FOREIGN KEY     | REFERENCES chunks(id)                                                                                                                 | chunks                | id                              |
| CONSTRAINT  | chunk_dimensions      | chunk_dimensions_pkey                                  | PRIMARY KEY     | N/A                                                                                                                                   | chunk_dimensions      | id                              |
| CONSTRAINT  | chunk_extraction_jobs | 2200_52454_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | chunk_extraction_jobs | 2200_52454_2_not_null                                  | CHECK           | document_id IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | chunk_extraction_jobs | chunk_extraction_jobs_status_check                     | CHECK           | (status = ANY (ARRAY['pending'::text, 'extracting'::text, 'generating_dimensions'::text, 'completed'::text, 'failed'::text]))         | chunk_extraction_jobs | status                          |
| CONSTRAINT  | chunk_extraction_jobs | chunk_extraction_jobs_created_by_fkey                  | FOREIGN KEY     | REFERENCES user_profiles(id)                                                                                                          | user_profiles         | id                              |
| CONSTRAINT  | chunk_extraction_jobs | chunk_extraction_jobs_document_id_fkey                 | FOREIGN KEY     | REFERENCES documents(id)                                                                                                              | documents             | id                              |
| CONSTRAINT  | chunk_extraction_jobs | chunk_extraction_jobs_pkey                             | PRIMARY KEY     | N/A                                                                                                                                   | chunk_extraction_jobs | id                              |
| CONSTRAINT  | chunk_runs            | 2200_52408_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | chunk_runs            | 2200_52408_2_not_null                                  | CHECK           | run_id IS NOT NULL                                                                                                                    | null                  | null                            |
| CONSTRAINT  | chunk_runs            | 2200_52408_3_not_null                                  | CHECK           | document_id IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | chunk_runs            | 2200_52408_4_not_null                                  | CHECK           | run_name IS NOT NULL                                                                                                                  | null                  | null                            |
| CONSTRAINT  | chunk_runs            | chunk_runs_status_check                                | CHECK           | (status = ANY (ARRAY['running'::text, 'completed'::text, 'failed'::text, 'cancelled'::text]))                                         | chunk_runs            | status                          |
| CONSTRAINT  | chunk_runs            | chunk_runs_created_by_fkey                             | FOREIGN KEY     | REFERENCES user_profiles(id)                                                                                                          | user_profiles         | id                              |
| CONSTRAINT  | chunk_runs            | chunk_runs_document_id_fkey                            | FOREIGN KEY     | REFERENCES documents(id)                                                                                                              | documents             | id                              |
| CONSTRAINT  | chunk_runs            | chunk_runs_pkey                                        | PRIMARY KEY     | N/A                                                                                                                                   | chunk_runs            | id                              |
| CONSTRAINT  | chunk_runs            | chunk_runs_run_id_key                                  | UNIQUE          | N/A                                                                                                                                   | chunk_runs            | run_id                          |
| CONSTRAINT  | chunks                | 2200_52350_10_not_null                                 | CHECK           | token_count IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | chunks                | 2200_52350_13_not_null                                 | CHECK           | chunk_text IS NOT NULL                                                                                                                | null                  | null                            |
| CONSTRAINT  | chunks                | 2200_52350_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | chunks                | 2200_52350_2_not_null                                  | CHECK           | chunk_id IS NOT NULL                                                                                                                  | null                  | null                            |
| CONSTRAINT  | chunks                | 2200_52350_3_not_null                                  | CHECK           | document_id IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | chunks                | 2200_52350_4_not_null                                  | CHECK           | chunk_type IS NOT NULL                                                                                                                | null                  | null                            |
| CONSTRAINT  | chunks                | 2200_52350_8_not_null                                  | CHECK           | char_start IS NOT NULL                                                                                                                | null                  | null                            |
| CONSTRAINT  | chunks                | 2200_52350_9_not_null                                  | CHECK           | char_end IS NOT NULL                                                                                                                  | null                  | null                            |
| CONSTRAINT  | chunks                | chunks_chunk_type_check                                | CHECK           | (chunk_type = ANY (ARRAY['Chapter_Sequential'::text, 'Instructional_Unit'::text, 'CER'::text, 'Example_Scenario'::text]))             | chunks                | chunk_type                      |
| CONSTRAINT  | chunks                | chunks_created_by_fkey                                 | FOREIGN KEY     | REFERENCES user_profiles(id)                                                                                                          | user_profiles         | id                              |
| CONSTRAINT  | chunks                | chunks_document_id_fkey                                | FOREIGN KEY     | REFERENCES documents(id)                                                                                                              | documents             | id                              |
| CONSTRAINT  | chunks                | idx_chunks_document                                    | FOREIGN KEY     | REFERENCES documents(id)                                                                                                              | documents             | id                              |
| CONSTRAINT  | chunks                | chunks_pkey                                            | PRIMARY KEY     | N/A                                                                                                                                   | chunks                | id                              |
| CONSTRAINT  | chunks                | chunks_chunk_id_key                                    | UNIQUE          | N/A                                                                                                                                   | chunks                | chunk_id                        |
| CONSTRAINT  | custom_tags           | 2200_47901_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | custom_tags           | 2200_47901_2_not_null                                  | CHECK           | dimension_id IS NOT NULL                                                                                                              | null                  | null                            |
| CONSTRAINT  | custom_tags           | 2200_47901_3_not_null                                  | CHECK           | name IS NOT NULL                                                                                                                      | null                  | null                            |
| CONSTRAINT  | custom_tags           | custom_tags_created_by_fkey                            | FOREIGN KEY     | REFERENCES user_profiles(id)                                                                                                          | user_profiles         | id                              |
| CONSTRAINT  | custom_tags           | custom_tags_dimension_id_fkey                          | FOREIGN KEY     | REFERENCES tag_dimensions(id)                                                                                                         | tag_dimensions        | id                              |
| CONSTRAINT  | custom_tags           | custom_tags_pkey                                       | PRIMARY KEY     | N/A                                                                                                                                   | custom_tags           | id                              |
| CONSTRAINT  | custom_tags           | uq_custom_tag_name                                     | UNIQUE          | N/A                                                                                                                                   | custom_tags           | organization_id                 |
| CONSTRAINT  | custom_tags           | uq_custom_tag_name                                     | UNIQUE          | N/A                                                                                                                                   | custom_tags           | dimension_id                    |
| CONSTRAINT  | custom_tags           | uq_custom_tag_name                                     | UNIQUE          | N/A                                                                                                                                   | custom_tags           | name                            |
| CONSTRAINT  | dimension_metadata    | 2200_54928_10_not_null                                 | CHECK           | category IS NOT NULL                                                                                                                  | null                  | null                            |
| CONSTRAINT  | dimension_metadata    | 2200_54928_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | dimension_metadata    | 2200_54928_2_not_null                                  | CHECK           | field_name IS NOT NULL                                                                                                                | null                  | null                            |
| CONSTRAINT  | dimension_metadata    | 2200_54928_3_not_null                                  | CHECK           | description IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | dimension_metadata    | 2200_54928_4_not_null                                  | CHECK           | data_type IS NOT NULL                                                                                                                 | null                  | null                            |
| CONSTRAINT  | dimension_metadata    | 2200_54928_6_not_null                                  | CHECK           | generation_type IS NOT NULL                                                                                                           | null                  | null                            |
| CONSTRAINT  | dimension_metadata    | 2200_54928_9_not_null                                  | CHECK           | display_order IS NOT NULL                                                                                                             | null                  | null                            |
| CONSTRAINT  | dimension_metadata    | dimension_metadata_generation_type_check               | CHECK           | (generation_type = ANY (ARRAY['Prior Generated'::text, 'Mechanically Generated'::text, 'AI Generated'::text]))                        | dimension_metadata    | generation_type                 |
| CONSTRAINT  | dimension_metadata    | dimension_metadata_pkey                                | PRIMARY KEY     | N/A                                                                                                                                   | dimension_metadata    | id                              |
| CONSTRAINT  | dimension_metadata    | dimension_metadata_field_name_key                      | UNIQUE          | N/A                                                                                                                                   | dimension_metadata    | field_name                      |
| CONSTRAINT  | document_categories   | 2200_47821_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | document_categories   | 2200_47821_2_not_null                                  | CHECK           | document_id IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | document_categories   | 2200_47821_3_not_null                                  | CHECK           | category_id IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | document_categories   | chk_belonging_rating                                   | CHECK           | ((belonging_rating IS NULL) OR ((belonging_rating >= 1) AND (belonging_rating <= 5)))                                                 | document_categories   | belonging_rating                |
| CONSTRAINT  | document_categories   | document_categories_belonging_rating_check             | CHECK           | ((belonging_rating >= 1) AND (belonging_rating <= 5))                                                                                 | document_categories   | belonging_rating                |
| CONSTRAINT  | document_categories   | document_categories_assigned_by_fkey                   | FOREIGN KEY     | REFERENCES user_profiles(id)                                                                                                          | user_profiles         | id                              |
| CONSTRAINT  | document_categories   | document_categories_category_id_fkey                   | FOREIGN KEY     | REFERENCES categories(id)                                                                                                             | categories            | id                              |
| CONSTRAINT  | document_categories   | document_categories_document_id_fkey                   | FOREIGN KEY     | REFERENCES documents(id)                                                                                                              | documents             | id                              |
| CONSTRAINT  | document_categories   | document_categories_workflow_session_id_fkey           | FOREIGN KEY     | REFERENCES workflow_sessions(id)                                                                                                      | workflow_sessions     | id                              |
| CONSTRAINT  | document_categories   | document_categories_pkey                               | PRIMARY KEY     | N/A                                                                                                                                   | document_categories   | id                              |
| CONSTRAINT  | document_categories   | uq_doc_primary_category                                | UNIQUE          | N/A                                                                                                                                   | document_categories   | document_id                     |
| CONSTRAINT  | document_categories   | uq_doc_primary_category                                | UNIQUE          | N/A                                                                                                                                   | document_categories   | is_primary                      |
| CONSTRAINT  | document_tags         | 2200_47857_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | document_tags         | 2200_47857_2_not_null                                  | CHECK           | document_id IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | document_tags         | 2200_47857_3_not_null                                  | CHECK           | tag_id IS NOT NULL                                                                                                                    | null                  | null                            |
| CONSTRAINT  | document_tags         | 2200_47857_4_not_null                                  | CHECK           | dimension_id IS NOT NULL                                                                                                              | null                  | null                            |
| CONSTRAINT  | document_tags         | document_tags_assigned_by_fkey                         | FOREIGN KEY     | REFERENCES user_profiles(id)                                                                                                          | user_profiles         | id                              |
| CONSTRAINT  | document_tags         | document_tags_dimension_id_fkey                        | FOREIGN KEY     | REFERENCES tag_dimensions(id)                                                                                                         | tag_dimensions        | id                              |
| CONSTRAINT  | document_tags         | document_tags_document_id_fkey                         | FOREIGN KEY     | REFERENCES documents(id)                                                                                                              | documents             | id                              |
| CONSTRAINT  | document_tags         | document_tags_tag_id_fkey                              | FOREIGN KEY     | REFERENCES tags(id)                                                                                                                   | tags                  | id                              |
| CONSTRAINT  | document_tags         | document_tags_workflow_session_id_fkey                 | FOREIGN KEY     | REFERENCES workflow_sessions(id)                                                                                                      | workflow_sessions     | id                              |
| CONSTRAINT  | document_tags         | document_tags_pkey                                     | PRIMARY KEY     | N/A                                                                                                                                   | document_tags         | id                              |
| CONSTRAINT  | document_tags         | uq_doc_tag                                             | UNIQUE          | N/A                                                                                                                                   | document_tags         | document_id                     |
| CONSTRAINT  | document_tags         | uq_doc_tag                                             | UNIQUE          | N/A                                                                                                                                   | document_tags         | tag_id                          |
| CONSTRAINT  | documents             | 2200_34214_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | documents             | 2200_34214_2_not_null                                  | CHECK           | title IS NOT NULL                                                                                                                     | null                  | null                            |
| CONSTRAINT  | documents             | documents_chunk_extraction_status_check                | CHECK           | (chunk_extraction_status = ANY (ARRAY['not_started'::text, 'ready'::text, 'extracting'::text, 'completed'::text, 'failed'::text]))    | documents             | chunk_extraction_status         |
| CONSTRAINT  | documents             | documents_processing_progress_check                    | CHECK           | ((processing_progress >= 0) AND (processing_progress <= 100))                                                                         | documents             | processing_progress             |
| CONSTRAINT  | documents             | documents_status_check                                 | CHECK           | (status = ANY (ARRAY['pending'::text, 'categorizing'::text, 'completed'::text, 'uploaded'::text, 'processing'::text, 'error'::text])) | documents             | status                          |
| CONSTRAINT  | documents             | documents_author_id_fkey                               | FOREIGN KEY     | REFERENCES user_profiles(id)                                                                                                          | user_profiles         | id                              |
| CONSTRAINT  | documents             | documents_pkey                                         | PRIMARY KEY     | N/A                                                                                                                                   | documents             | id                              |
| CONSTRAINT  | processing_jobs       | 2200_34306_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | processing_jobs       | processing_jobs_processing_type_check                  | CHECK           | (processing_type = ANY (ARRAY['ai_training'::text, 'content_extraction'::text, 'categorization'::text]))                              | processing_jobs       | processing_type                 |
| CONSTRAINT  | processing_jobs       | processing_jobs_progress_percentage_check              | CHECK           | ((progress_percentage >= 0) AND (progress_percentage <= 100))                                                                         | processing_jobs       | progress_percentage             |
| CONSTRAINT  | processing_jobs       | processing_jobs_status_check                           | CHECK           | (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text]))                                        | processing_jobs       | status                          |
| CONSTRAINT  | processing_jobs       | processing_jobs_workflow_session_id_fkey               | FOREIGN KEY     | REFERENCES workflow_sessions(id)                                                                                                      | workflow_sessions     | id                              |
| CONSTRAINT  | processing_jobs       | processing_jobs_pkey                                   | PRIMARY KEY     | N/A                                                                                                                                   | processing_jobs       | id                              |
| CONSTRAINT  | prompt_templates      | 2200_52435_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | prompt_templates      | 2200_52435_2_not_null                                  | CHECK           | template_name IS NOT NULL                                                                                                             | null                  | null                            |
| CONSTRAINT  | prompt_templates      | 2200_52435_3_not_null                                  | CHECK           | template_type IS NOT NULL                                                                                                             | null                  | null                            |
| CONSTRAINT  | prompt_templates      | 2200_52435_4_not_null                                  | CHECK           | prompt_text IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | prompt_templates      | prompt_templates_created_by_fkey                       | FOREIGN KEY     | REFERENCES user_profiles(id)                                                                                                          | user_profiles         | id                              |
| CONSTRAINT  | prompt_templates      | prompt_templates_pkey                                  | PRIMARY KEY     | N/A                                                                                                                                   | prompt_templates      | id                              |
| CONSTRAINT  | prompt_templates      | prompt_templates_template_name_key                     | UNIQUE          | N/A                                                                                                                                   | prompt_templates      | template_name                   |
| CONSTRAINT  | tag_dimensions        | 2200_34245_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | tag_dimensions        | 2200_34245_2_not_null                                  | CHECK           | name IS NOT NULL                                                                                                                      | null                  | null                            |
| CONSTRAINT  | tag_dimensions        | 2200_34245_3_not_null                                  | CHECK           | description IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | tag_dimensions        | tag_dimensions_pkey                                    | PRIMARY KEY     | N/A                                                                                                                                   | tag_dimensions        | id                              |
| CONSTRAINT  | tags                  | 2200_34258_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | tags                  | 2200_34258_3_not_null                                  | CHECK           | name IS NOT NULL                                                                                                                      | null                  | null                            |
| CONSTRAINT  | tags                  | 2200_34258_4_not_null                                  | CHECK           | description IS NOT NULL                                                                                                               | null                  | null                            |
| CONSTRAINT  | tags                  | tags_dimension_id_fkey                                 | FOREIGN KEY     | REFERENCES tag_dimensions(id)                                                                                                         | tag_dimensions        | id                              |
| CONSTRAINT  | tags                  | tags_pkey                                              | PRIMARY KEY     | N/A                                                                                                                                   | tags                  | id                              |
| CONSTRAINT  | user_profiles         | 2200_34199_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | user_profiles         | 2200_34199_2_not_null                                  | CHECK           | email IS NOT NULL                                                                                                                     | null                  | null                            |
| CONSTRAINT  | user_profiles         | 2200_34199_3_not_null                                  | CHECK           | full_name IS NOT NULL                                                                                                                 | null                  | null                            |
| CONSTRAINT  | user_profiles         | user_profiles_role_check                               | CHECK           | (role = ANY (ARRAY['admin'::text, 'user'::text, 'viewer'::text]))                                                                     | user_profiles         | role                            |
| CONSTRAINT  | user_profiles         | user_profiles_pkey                                     | PRIMARY KEY     | N/A                                                                                                                                   | user_profiles         | id                              |
| CONSTRAINT  | user_profiles         | user_profiles_email_key                                | UNIQUE          | N/A                                                                                                                                   | user_profiles         | email                           |
| CONSTRAINT  | workflow_metadata     | 2200_47929_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | workflow_metadata     | 2200_47929_2_not_null                                  | CHECK           | workflow_session_id IS NOT NULL                                                                                                       | null                  | null                            |
| CONSTRAINT  | workflow_metadata     | 2200_47929_3_not_null                                  | CHECK           | step IS NOT NULL                                                                                                                      | null                  | null                            |
| CONSTRAINT  | workflow_metadata     | 2200_47929_4_not_null                                  | CHECK           | metadata_key IS NOT NULL                                                                                                              | null                  | null                            |
| CONSTRAINT  | workflow_metadata     | workflow_metadata_step_check                           | CHECK           | (step = ANY (ARRAY['A'::text, 'B'::text, 'C'::text]))                                                                                 | workflow_metadata     | step                            |
| CONSTRAINT  | workflow_metadata     | workflow_metadata_workflow_session_id_fkey             | FOREIGN KEY     | REFERENCES workflow_sessions(id)                                                                                                      | workflow_sessions     | id                              |
| CONSTRAINT  | workflow_metadata     | workflow_metadata_pkey                                 | PRIMARY KEY     | N/A                                                                                                                                   | workflow_metadata     | id                              |
| CONSTRAINT  | workflow_metadata     | uq_workflow_metadata                                   | UNIQUE          | N/A                                                                                                                                   | workflow_metadata     | metadata_key                    |
| CONSTRAINT  | workflow_metadata     | uq_workflow_metadata                                   | UNIQUE          | N/A                                                                                                                                   | workflow_metadata     | step                            |
| CONSTRAINT  | workflow_metadata     | uq_workflow_metadata                                   | UNIQUE          | N/A                                                                                                                                   | workflow_metadata     | workflow_session_id             |
| CONSTRAINT  | workflow_sessions     | 2200_34274_1_not_null                                  | CHECK           | id IS NOT NULL                                                                                                                        | null                  | null                            |
| CONSTRAINT  | workflow_sessions     | workflow_sessions_belonging_rating_check               | CHECK           | ((belonging_rating >= 1) AND (belonging_rating <= 10))                                                                                | workflow_sessions     | belonging_rating                |
| CONSTRAINT  | workflow_sessions     | workflow_sessions_step_check                           | CHECK           | (step = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'complete'::text]))                                                               | workflow_sessions     | step                            |
| CONSTRAINT  | workflow_sessions     | workflow_sessions_document_id_fkey                     | FOREIGN KEY     | REFERENCES documents(id)                                                                                                              | documents             | id                              |
| CONSTRAINT  | workflow_sessions     | workflow_sessions_selected_category_id_fkey            | FOREIGN KEY     | REFERENCES categories(id)                                                                                                             | categories            | id                              |
| CONSTRAINT  | workflow_sessions     | workflow_sessions_user_id_fkey                         | FOREIGN KEY     | REFERENCES user_profiles(id)                                                                                                          | user_profiles         | id                              |
| CONSTRAINT  | workflow_sessions     | workflow_sessions_pkey                                 | PRIMARY KEY     | N/A                                                                                                                                   | workflow_sessions     | id                              |




Super Simple Table List:

| table_name            | column_count |
| --------------------- | ------------ |
| api_response_logs     | 20           |
| categories            | 9            |
| chunk_dimensions      | 59           |
| chunk_extraction_jobs | 11           |
| chunk_runs            | 14           |
| chunks                | 16           |
| custom_tags           | 10           |
| dimension_metadata    | 12           |
| document_categories   | 9            |
| document_tags         | 10           |
| documents             | 21           |
| processing_jobs       | 11           |
| prompt_templates      | 12           |
| tag_dimensions        | 8            |
| tags                  | 9            |
| user_profiles         | 19           |
| workflow_metadata     | 6            |
| workflow_sessions     | 13           |
---

## TRAIN DATA MODULE - SAFE DATABASE MIGRATION
**Generated:** 2025-10-29  
**Purpose:** Create train data conversation generation tables without breaking existing schemas  
**Conflicts Resolved:** Renamed prompt_templates → conversation_templates to avoid conflicts

### Migration Summary

This migration creates the following NEW tables for the train data module:
1. **conversations** - Core conversation records
2. **conversation_turns** - Individual conversation turns (normalized)
3. **conversation_templates** - Prompt templates for generation (RENAMED to avoid conflict)
4. **scenarios** - Scenario definitions
5. **edge_cases** - Edge case test scenarios  
6. **batch_jobs** - Batch processing jobs
7. **generation_logs** - API generation audit trail
8. **export_logs** - Export activity audit trail

### Key Changes from Original SQL

1. **Table Renaming:**
   - `prompt_templates` → `conversation_templates` (to avoid conflict with existing table)

2. **Foreign Key Updates:**
   - All references to `auth.users(id)` changed to `user_profiles(id)` (existing table)
   - All foreign keys reference existing tables: `documents`, `chunks`, `user_profiles`

3. **Safety Improvements:**
   - All `CREATE TABLE` statements use `IF NOT EXISTS`
   - All `CREATE INDEX` statements use `IF NOT EXISTS`
   - All triggers wrapped in `DO $$ ... END $$` blocks to check for existence
   - All RLS policies dropped before recreation (idempotent)

4. **References Updated:**
   - `template_id` in `generation_logs` now references `conversation_templates(id)`
   - `parent_template_id` in `scenarios` and `edge_cases` references `conversation_templates(id)`

5. **Additional Indexes:**
   - Added indexes on `created_by` fields for better query performance
   - Added indexes on category, format, and other frequently filtered fields

### File Location

The complete migration SQL is available at:
`pmc/context-ai/pmct/train-module-safe-migration.sql`

### How to Run

1. Open Supabase SQL Editor
2. Copy contents from `pmc/context-ai/pmct/train-module-safe-migration.sql`
3. Execute the SQL
4. Verify success with the output messages

The script is idempotent - you can run it multiple times safely.

### Validation Queries

After running the migration, verify success with:

```sql
-- Check all tables were created
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'conversation_turns', 'conversation_templates', 
                   'scenarios', 'edge_cases', 'generation_logs', 'export_logs', 'batch_jobs')
ORDER BY table_name;

-- Check foreign key references
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('conversations', 'conversation_turns', 'conversation_templates', 
                      'scenarios', 'edge_cases', 'generation_logs', 'export_logs', 'batch_jobs')
ORDER BY tc.table_name, kcu.column_name;
```

### Expected Outcome

After successful execution, you should have:
- 8 new tables created
- All foreign keys properly referencing existing tables
- Indexes created for optimal query performance
- RLS policies enabled and configured
- Seed data inserted (3 conversation templates)
- No conflicts with existing database schema
