-- Seed test document for production testing
-- Run this in Supabase SQL Editor after deploying to production

-- Insert test document with mock ID for compatibility
INSERT INTO documents (id, title, summary, content, status, author_id, created_at, updated_at)
VALUES (
  'doc-1',
  'Complete Customer Onboarding System Blueprint',
  'Comprehensive 7-step customer onboarding methodology that has resulted in 89% customer retention and 40% faster time-to-value across 500+ implementations.',
  '# Customer Onboarding System Blueprint

## Overview
This comprehensive document outlines our proprietary 7-step customer onboarding methodology that has resulted in 89% customer retention and 40% faster time-to-value across 500+ implementations.

## The 7-Step Framework

### Step 1: Discovery & Mapping
Our initial discovery process involves a detailed assessment of the customer''s current state, pain points, and desired outcomes.

### Step 2: Customization Planning
Based on discovery findings, we create a tailored implementation plan that addresses specific customer needs.

### Step 3: Technical Setup
Our technical team handles all system configuration, integrations, and customizations.

### Step 4: Team Training
Comprehensive training program covering platform fundamentals and advanced features.

### Step 5: Pilot Program
Controlled rollout with selected user groups to validate configuration.

### Step 6: Full Deployment
Complete system rollout with dedicated support team monitoring.

### Step 7: Optimization & Success Review
Continuous improvement based on metrics and feedback.',
  'pending',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

