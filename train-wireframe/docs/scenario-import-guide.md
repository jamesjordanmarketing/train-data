# Scenario CSV Import Guide

## Overview

The Scenario CSV Import feature allows you to bulk create scenarios from a CSV file. This is useful for:
- Creating multiple scenarios at once
- Migrating scenarios from other systems
- Batch scenario creation workflows

## CSV Format Requirements

### Required Columns

The following columns are **required** for each row:

| Column | Description | Example |
|--------|-------------|---------|
| `name` | Unique name for the scenario | "Anxious Investor - Market Volatility" |
| `template_id` | ID of the parent template | "550e8400-e29b-41d4-a716-446655440000" |
| `topic` | The conversation topic | "Market Volatility Concerns" |
| `persona` | The user persona | "Anxious Investor" |
| `emotional_arc` | The emotional journey | "anxiety to confidence" |

### Optional Columns

| Column | Description | Default |
|--------|-------------|---------|
| `description` | Detailed description of the scenario | "" (empty) |
| `context` | Additional context information | "" (empty) |
| `status` | Scenario status: `draft`, `active`, or `archived` | "draft" |

### Template Variable Columns

For each template variable, add a column with the prefix `var_`:

**Format:** `var_<variable_name>`

**Examples:**
- `var_product_name` - For a template variable named "product_name"
- `var_issue_type` - For a template variable named "issue_type"
- `var_customer_segment` - For a template variable named "customer_segment"

## Template ID Reference

To find the template ID:
1. Go to the Templates page
2. Click on a template to view details
3. Copy the UUID from the template details modal
4. Paste into the `template_id` column in your CSV

## Validation Rules

### Required Field Validation

- All required columns must have values
- Empty or whitespace-only values will fail validation

### Template Validation

- The `template_id` must exist in the database
- All template variables must have corresponding `var_*` columns
- Variable values must match the variable type:
  - `number` variables must be numeric
  - `dropdown` variables must match one of the allowed options

### Field Length Limits

| Field | Maximum Length |
|-------|----------------|
| `name` | 255 characters |
| `description` | 1000 characters |
| `context` | 2000 characters |

### Status Values

The `status` column must be one of:
- `draft` - Scenario is in draft state
- `active` - Scenario is active and ready for use
- `archived` - Scenario is archived

### Row Limits

- Maximum **100 rows** per CSV file
- For larger imports, split into multiple files

## Example CSV

See `scenario-import-template.csv` for a complete example.

```csv
name,template_id,topic,persona,emotional_arc,description,context,status,var_product_name,var_issue_type
"Anxious Investor - Market Volatility","template-uuid-1","Market Volatility","Anxious Investor","anxiety to confidence","Client concerned about market downturn","60/40 allocation","draft","Stock Portfolio","Market Volatility"
```

## Import Process

1. **Prepare CSV File**
   - Create CSV with required columns
   - Add template variable columns as needed
   - Ensure all data is valid

2. **Upload File**
   - Click "Import CSV" button in Scenarios view
   - Select your CSV file
   - Wait for parsing to complete

3. **Review Validation**
   - Check validation results table
   - Red rows indicate errors that must be fixed
   - Yellow rows indicate warnings (can still import)
   - Green rows are valid and ready to import

4. **Fix Errors** (if any)
   - Download the CSV
   - Fix invalid rows
   - Re-upload corrected file

5. **Confirm Import**
   - Review valid row count
   - Click "Import X Scenarios" button
   - Confirm the import action
   - Wait for import to complete

## Common Issues

### Missing Template ID

**Error:** `Template ID "..." not found`

**Solution:** Verify the template exists and copy the correct UUID from the Templates page.

### Missing Variable Columns

**Error:** `Missing template variable: product_name`

**Solution:** Add a column `var_product_name` with values for each row.

### Invalid Status

**Error:** `Invalid status: pending`

**Solution:** Change status to one of: `draft`, `active`, or `archived`.

### Duplicate Names

**Warning:** `Duplicate name "..." found in rows: 1, 5`

**Solution:** This is a warning only. Scenarios can have duplicate names, but it's not recommended.

### Row Limit Exceeded

**Error:** `CSV contains 150 rows. Maximum is 100.`

**Solution:** Split your CSV into multiple files with 100 rows or fewer.

## Tips for Success

1. **Start Small**: Test with 5-10 rows first to ensure format is correct
2. **Use Template**: Start with `scenario-import-template.csv` and modify it
3. **Validate Templates**: Ensure all templates exist before creating CSV
4. **Check Variables**: Verify variable names match template exactly
5. **Unique Names**: Use unique scenario names to avoid confusion
6. **Quote Strings**: Use quotes around text with commas or special characters
7. **Save as UTF-8**: Ensure CSV is saved with UTF-8 encoding

## Variable Column Naming

For a template with these variables:
```json
{
  "variables": [
    { "name": "product_name", "type": "text" },
    { "name": "issue_type", "type": "dropdown" },
    { "name": "priority_level", "type": "number" }
  ]
}
```

Your CSV should have these columns:
- `var_product_name`
- `var_issue_type`
- `var_priority_level`

## Export Template

To create a CSV template from existing scenarios:
1. Go to Scenarios view
2. Select scenarios you want to use as template
3. Click "Export" button
4. Choose CSV format
5. Use exported file as template for new imports

## Support

For issues with CSV import:
- Check validation error messages carefully
- Refer to this guide for format requirements
- Ensure template IDs are correct
- Verify all required columns are present
- Check that variable columns match template definitions

