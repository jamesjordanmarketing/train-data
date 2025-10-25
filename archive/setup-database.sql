-- Supabase Database Setup Script for Document Categorization System
-- Run this in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table first (referenced by other tables)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'user', 'viewer')) DEFAULT 'user',
    organization_id UUID,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    author_id UUID REFERENCES user_profiles(id),
    status TEXT CHECK (status IN ('pending', 'categorizing', 'completed')) DEFAULT 'pending',
    file_path TEXT,
    file_size INTEGER,
    metadata JSONB DEFAULT '{}'
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    examples TEXT[] DEFAULT '{}',
    is_high_value BOOLEAN DEFAULT false,
    impact_description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tag_dimensions table
CREATE TABLE IF NOT EXISTS tag_dimensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    multi_select BOOLEAN DEFAULT false,
    required BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dimension_id UUID REFERENCES tag_dimensions(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    risk_level INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workflow_sessions table
CREATE TABLE IF NOT EXISTS workflow_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id),
    user_id UUID REFERENCES user_profiles(id),
    step TEXT CHECK (step IN ('A', 'B', 'C', 'complete')) DEFAULT 'A',
    belonging_rating INTEGER CHECK (belonging_rating >= 1 AND belonging_rating <= 10),
    selected_category_id UUID REFERENCES categories(id),
    selected_tags JSONB DEFAULT '{}',
    custom_tags JSONB DEFAULT '[]',
    is_draft BOOLEAN DEFAULT true,
    completed_steps TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create processing_jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_session_id UUID REFERENCES workflow_sessions(id),
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    processing_type TEXT CHECK (processing_type IN ('ai_training', 'content_extraction', 'categorization')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    result_data JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_author_id ON documents(author_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_document_id ON workflow_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_user_id ON workflow_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_status ON workflow_sessions(step);

-- Insert sample data

-- Insert sample user
INSERT INTO user_profiles (id, email, full_name, role, preferences) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'john.doe@company.com', 'John Doe', 'admin', '{"auto_save_interval": 30, "default_category_suggestions": true}');

-- Insert sample categories
INSERT INTO categories (id, name, description, examples, is_high_value, impact_description, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Complete Systems & Methodologies', 'End-to-end business systems, frameworks, or methodologies that provide comprehensive solutions', ARRAY['Customer onboarding systems', 'Sales frameworks', 'Implementation methodologies'], true, 'High training value - provides complete business context and methodology', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Proprietary Strategies & Approaches', 'Unique business strategies, competitive advantages, or innovative approaches specific to your organization', ARRAY['Competitive positioning strategies', 'Unique value propositions', 'Market differentiation approaches'], true, 'High training value - captures unique competitive intelligence and strategic thinking', 2);

-- Insert sample tag dimensions
INSERT INTO tag_dimensions (id, name, description, multi_select, required, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440003', 'Authorship', 'Who created or contributed to this content', false, true, 1),
('550e8400-e29b-41d4-a716-446655440004', 'Content Format', 'The format and structure of the content', true, false, 2),
('550e8400-e29b-41d4-a716-446655440005', 'Disclosure Risk', 'Risk level if this content were to be publicly disclosed', false, true, 3),
('550e8400-e29b-41d4-a716-446655440006', 'Intended Use', 'How this content is intended to be used', true, true, 4);

-- Insert sample tags
INSERT INTO tags (id, dimension_id, name, description, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Brand/Company', 'Created by your organization or brand', 1),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'Team Member', 'Created by internal team members', 2),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'Level 1 - Minimal Risk', 'Public-facing content with no confidential information', 1),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440006', 'Training', 'Content used for training purposes', 1),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440006', 'Marketing', 'Content used for marketing purposes', 2);

-- Insert sample documents
INSERT INTO documents (id, title, content, summary, author_id, status, file_size, metadata) VALUES 
('550e8400-e29b-41d4-a716-446655440012', 'Complete Customer Onboarding System Blueprint', '# Customer Onboarding System Blueprint\n\n## Overview\nThis comprehensive document...', 'Comprehensive customer onboarding methodology with 7-step framework, proprietary tools, and proven ROI metrics across 500+ implementations.', '550e8400-e29b-41d4-a716-446655440000', 'pending', 25600, '{"word_count": 1250, "estimated_reading_time": "5 minutes", "content_type": "business_methodology"}'),
('550e8400-e29b-41d4-a716-446655440013', 'Sales Enablement: Competitive Battle Cards', '# Competitive Battle Cards - Q4 2024\n\n## Overview\nUpdated competitive intelligence...', 'Sales enablement battle cards with competitive analysis, objection handling, and win/loss insights for Q4 2024.', '550e8400-e29b-41d4-a716-446655440000', 'pending', 18200, '{"word_count": 890, "estimated_reading_time": "4 minutes", "content_type": "sales_enablement"}');

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - adjust based on your security requirements)
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view documents" ON documents
    FOR SELECT USING (true); -- Adjust based on your organization logic

CREATE POLICY "Users can view their own workflow sessions" ON workflow_sessions
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own processing jobs" ON processing_jobs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM workflow_sessions ws 
        WHERE ws.id = workflow_session_id 
        AND ws.user_id::text = auth.uid()::text
    ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tag_dimensions_updated_at BEFORE UPDATE ON tag_dimensions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_sessions_updated_at BEFORE UPDATE ON workflow_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_jobs_updated_at BEFORE UPDATE ON processing_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database setup completed successfully! Tables created with sample data.' as result;