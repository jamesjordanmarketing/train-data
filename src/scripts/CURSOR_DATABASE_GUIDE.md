# Cursor Database Helper Guide

## Overview
Your Cursor instance can now query your Supabase Bright Run V.2 database using the `cursor-db-helper.js` script. This script provides easy commands to explore and query your database tables.

## Available Tables (Complete List)
- **conversations** (0 records) - Conversation data
- **chunks** (177 records) - Document chunks/content
- **scenarios** (0 records) - Scenario data
- **templates** (5 records) - Conversation templates
- **documents** - Document metadata
- **categories** - Content categories
- **tags** - Content tags
- **workflow_sessions** - Workflow session data
- **document_categories** - Document-category relationships
- **document_tags** - Document-tag relationships
- **custom_tags** - Custom user tags
- **tag_dimensions** - Tag dimension metadata

## Quick Commands

### List All Tables
```bash
node scripts/cursor-db-helper.js list-tables
```

### Count Records in a Table
```bash
node scripts/cursor-db-helper.js count <table_name>
```
Example: `node scripts/cursor-db-helper.js count chunks`

### Query Table Data
```bash
node scripts/cursor-db-helper.js query <table_name> [--limit <number>] [--where <column>=<value>]
```

Examples:
- `node scripts/cursor-db-helper.js query chunks --limit 5`
- `node scripts/cursor-db-helper.js query templates --limit 3`
- `node scripts/cursor-db-helper.js query chunks --where id=123 --limit 1`

### Describe Table Structure
```bash
node scripts/cursor-db-helper.js describe <table_name>
```
Example: `node scripts/cursor-db-helper.js describe templates`

## Sample Data Found

### Chunks Table
Contains document content with fields like:
- `id`, `content`, `metadata`, `embedding`
- `document_id`, `chunk_index`, `token_count`
- `created_at`, `updated_at`, `created_by`

### Templates Table
Contains conversation templates with fields like:
- `template_name`, `description`, `category`, `tier`
- `template_text`, `structure`, `variables`, `tone`
- `complexity_baseline`, `usage_count`, `rating`
- `applicable_personas`, `applicable_emotions`, `applicable_topics`

## Usage in Cursor

1. **Open Terminal in Cursor**: Use Ctrl+` or View → Terminal
2. **Navigate to src directory**: `cd train-data/src`
3. **Run any command**: Use the commands above

## Environment Setup
✅ **Already Configured**: Your `.env.local` file contains:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

## TypeScript Integration
Your project also has TypeScript database services available:
- `lib/supabase.ts` - Supabase client configuration
- `lib/database.ts` - Database service functions
- Type definitions for all tables

## Example Queries for Your Data

### Explore Templates
```bash
# See all templates
node scripts/cursor-db-helper.js query templates

# Find specific template categories
node scripts/cursor-db-helper.js query templates --where category="Retirement Planning"
```

### Explore Chunks
```bash
# See recent chunks
node scripts/cursor-db-helper.js query chunks --limit 10

# Find chunks by document
node scripts/cursor-db-helper.js query chunks --where document_id="your-doc-id"
```

## Notes
- The script automatically loads environment variables from `../../.env.local`
- All queries are read-only for safety
- Use `--limit` to avoid overwhelming output
- The script provides colored output for better readability