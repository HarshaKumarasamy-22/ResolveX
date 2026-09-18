-- ==========================================================
-- ResolveX Database Schema (PostgreSQL)
-- Aurevia Institute of Technology (AIT) - Colombo, Sri Lanka
-- "Innovate. Connect. Resolve."
-- ==========================================================

-- Drop existing tables if re-running
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'student', -- 'student' | 'lecturer' | 'staff' | 'support_staff' | 'admin' | 'user'
    department VARCHAR(100), -- e.g., 'Faculty of Computing & Software Engineering (FCSE)'
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'IT & Software', 'Network & Internet', etc.
    description VARCHAR(255),
    icon VARCHAR(50) DEFAULT 'pi-cog'
);

-- 3. REQUESTS TABLE (Core University Service Requests)
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    request_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. 'AIT-2026-0001'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    user_id INTEGER NOT NULL REFERENCES users(id), -- requester
    department VARCHAR(100) NOT NULL, -- AIT Faculty / Division
    location VARCHAR(100) NOT NULL, -- AIT Campus Location
    room_number VARCHAR(50), -- e.g., 'Lab 402', 'Lecture Hall 3', 'Room 204'
    status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'
    priority VARCHAR(30) NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
    assigned_team VARCHAR(100), -- 'IT Support', 'Network Support', 'Facilities & Maintenance', 'Laboratory Support', 'Student Services'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- 4. ASSIGNMENTS TABLE (Maintained for assignment audit trail)
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    assigned_to INTEGER NOT NULL REFERENCES users(id), -- staff / admin member
    assigned_by INTEGER NOT NULL REFERENCES users(id), -- admin
    assigned_team VARCHAR(100),
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. COMMENTS TABLE (Discussion thread integration slot)
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. ACTIVITY LOGS TABLE (Immutable audit log)
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id), -- actor
    action_type VARCHAR(50) NOT NULL, -- CREATED, ASSIGNED, STATUS_CHANGED, PRIORITY_CHANGED, COMMENTED, RESOLVED, CLOSED
    details TEXT, -- e.g., "Status changed from Pending to Assigned"
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_requests_request_code ON requests(request_code);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_category ON requests(category_id);
CREATE INDEX idx_requests_user ON requests(user_id);
CREATE INDEX idx_requests_department ON requests(department);
CREATE INDEX idx_requests_location ON requests(location);
CREATE INDEX idx_activity_request ON activity_logs(request_id);
CREATE INDEX idx_assignments_request ON assignments(request_id);
