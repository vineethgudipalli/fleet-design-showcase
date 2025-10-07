-- GCP CloudSQL PostgreSQL Database Schema for Fleet Design Showcase Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and basic user info
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  figma_api_token TEXT, -- Encrypted Figma API token
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fleet management personas
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366F1', -- Hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default personas (alphabetically ordered)
INSERT INTO personas (name, description, color) VALUES
('Asset Manager', 'Manages fleet assets and lifecycle', '#EC4899'),
('Compliance Manager', 'Ensures regulatory compliance and safety standards', '#EF4444'),
('Dispatcher', 'Coordinates vehicle schedules and routes', '#10B981'),
('Driver', 'Vehicle operators and field personnel', '#F97316'),
('Fleet Manager', 'Oversees entire fleet operations and strategy', '#3B82F6'),
('IT Administrator', 'Handles technology systems and integrations', '#06B6D4'),
('Maintenance Manager', 'Oversees vehicle maintenance and repairs', '#8B5CF6'),
('Owner/Operator', 'Business owner or fleet operator', '#84CC16'),
('Safety Manager', 'Manages safety protocols and incident response', '#F59E0B'),
('Sustainability Manager', 'Focuses on environmental impact and efficiency', '#22C55E'),
('Technician', 'Maintenance and repair specialists', '#6366F1');

-- Experience categories
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- Icon name from lucide-react
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default experiences
INSERT INTO experiences (name, description, icon) VALUES
('Discover', 'Exploration and discovery interfaces', 'compass'),
('Onboard', 'User onboarding workflows and setup', 'user-plus'),
('Shop', 'E-commerce and purchasing flows', 'shopping-bag'),
('Core OS', 'Core operating system features and workflows', 'zap'),
('Applications', 'Application-specific features and tools', 'grid'),
('Growth', 'Growth and expansion features', 'trending-up'),
('Support', 'Help, support, and customer service interfaces', 'headphones');

-- Work table (prototypes/projects)
CREATE TABLE work (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  figma_file_id VARCHAR(255), -- Figma file ID
  figma_node_id VARCHAR(255), -- Figma node ID for specific frames
  title VARCHAR(255) NOT NULL,
  description TEXT,
  problem_summary TEXT NOT NULL, -- 2-line problem summary
  video_url TEXT, -- Video demonstration link
  thumbnail_url TEXT, -- Generated or uploaded thumbnail
  embed_url TEXT, -- Figma embed URL
  figma_link TEXT, -- Original Figma link
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255), -- Cached from Figma API or user input
  author_avatar VARCHAR(255), -- Cached from Figma API
  persona VARCHAR(100), -- Direct persona name for simplicity
  experience VARCHAR(50), -- Direct experience name for simplicity
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_work_author ON work(author_id);
CREATE INDEX idx_work_persona ON work(persona);
CREATE INDEX idx_work_experience ON work(experience);
CREATE INDEX idx_work_status ON work(status);
CREATE INDEX idx_work_created ON work(created_at DESC);

-- Reactions table for the LinkedIn-style reaction system
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_id UUID REFERENCES work(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('heart', 'like', 'idea')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one reaction per user per work item
  UNIQUE(work_id, user_id)
);

CREATE INDEX idx_reactions_work ON reactions(work_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);

-- Comments table for collaborative feedback
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_id UUID REFERENCES work(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name VARCHAR(255), -- For non-authenticated users or cached name
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For threaded comments
  content TEXT NOT NULL,
  x_position FLOAT, -- For positioned comments on designs
  y_position FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_work ON comments(work_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- System settings table for admin configuration
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, setting_type) VALUES
('app_name', 'Fleet Design Showcase', 'Application display name', 'string'),
('figma_api_token', '', 'Global Figma API token for imports', 'string'),
('max_upload_size', '50', 'Maximum file upload size in MB', 'number'),
('enable_public_access', 'true', 'Allow public viewing of prototypes', 'boolean'),
('default_reaction_limit', '100', 'Maximum reactions per user per day', 'number'),
('maintenance_mode', 'false', 'Enable maintenance mode', 'boolean');

-- Tags table for flexible categorization
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work tags junction table
CREATE TABLE work_tags (
  work_id UUID REFERENCES work(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (work_id, tag_id)
);

-- Activity log for audit trail
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);

-- Admin sessions table for secure authentication
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_user ON admin_sessions(user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_updated_at BEFORE UPDATE ON work FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW popular_work AS
SELECT 
  w.*,
  COUNT(DISTINCT r.id) as reaction_count,
  COUNT(DISTINCT c.id) as comment_count
FROM work w
LEFT JOIN reactions r ON w.id = r.work_id
LEFT JOIN comments c ON w.id = c.work_id
WHERE w.status = 'active'
GROUP BY w.id
ORDER BY reaction_count DESC, w.created_at DESC;

CREATE VIEW recent_work AS
SELECT 
  w.*,
  COUNT(DISTINCT r.id) as reaction_count,
  COUNT(DISTINCT c.id) as comment_count
FROM work w
LEFT JOIN reactions r ON w.id = r.work_id
LEFT JOIN comments c ON w.id = c.work_id
WHERE w.status = 'active'
GROUP BY w.id
ORDER BY w.created_at DESC;

-- Create default admin user (change password in production!)
INSERT INTO users (email, name, role) VALUES
('admin@fleet.com', 'System Administrator', 'admin');

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fleet_admin;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fleet_admin;