-- ==========================================================
-- ResolveX Database Seed Data
-- ==========================================================

-- Clear existing data
TRUNCATE activity_logs, comments, assignments, requests, categories, users RESTART IDENTITY CASCADE;

-- 1. SEED CATEGORIES
INSERT INTO categories (name, description) VALUES
('IT Support', 'Hardware, software installation, OS issues, and email access'),
('Network & Wi-Fi', 'LAN connectivity, Wi-Fi outages, VPN access, and DNS issues'),
('Facility & Electrical', 'Air conditioning, power supply, lighting, and elevator issues'),
('Maintenance', 'Carpentry, plumbing, furniture repair, and civil works'),
('Administrative', 'ID cards, visitor passes, parking permits, and stationary');

-- 2. SEED USERS (Password for all accounts: "Password@123" / hashed)
-- Hash: $2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecp5C6TbGP.OmBvKy
INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES
('Admin Harsha', 'admin@resolvex.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecp5C6TbGP.OmBvKy', 'admin', TRUE),
('Staff Alex', 'alex.staff@resolvex.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecp5C6TbGP.OmBvKy', 'admin', TRUE),
('Staff Sarah', 'sarah.staff@resolvex.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecp5C6TbGP.OmBvKy', 'admin', TRUE),
('User John Doe', 'john@resolvex.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecp5C6TbGP.OmBvKy', 'user', TRUE),
('User Priya Kumar', 'priya@resolvex.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecp5C6TbGP.OmBvKy', 'user', TRUE),
('User David Smith', 'david@resolvex.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecp5C6TbGP.OmBvKy', 'user', FALSE);

-- 3. SEED REQUESTS
INSERT INTO requests (title, description, category_id, user_id, status, priority, created_at, updated_at, resolved_at) VALUES
('Slow Wi-Fi connectivity in 3rd Floor Lab', 'Wi-Fi keeps dropping every 10 minutes in the lab, impacting work.', 2, 4, 'Assigned', 'High', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NULL),
('Air Conditioner leaking water in Room 204', 'AC unit is continuously dripping water onto workstations.', 3, 5, 'In Progress', 'Critical', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NULL),
('Need Visual Studio Enterprise license', 'Need license keys for new batch of developers starting next week.', 1, 4, 'Pending', 'Medium', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL),
('Broken chair wheel in conference room B', 'One caster wheel is cracked and wobbles heavily.', 4, 5, 'Resolved', 'Low', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('New employee access card request', 'Access card creation for newly joined operations engineer.', 5, 4, 'Closed', 'Medium', NOW() - INTERVAL '7 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

-- 4. SEED ASSIGNMENTS
INSERT INTO assignments (request_id, assigned_to, assigned_by, assigned_at) VALUES
(1, 2, 1, NOW() - INTERVAL '2 days'),
(2, 3, 1, NOW() - INTERVAL '1 day'),
(4, 2, 1, NOW() - INTERVAL '3 days'),
(5, 3, 1, NOW() - INTERVAL '6 days');

-- 5. SEED COMMENTS
INSERT INTO comments (request_id, user_id, message, created_at) VALUES
(1, 4, 'Issue is also happening near the server rack area.', NOW() - INTERVAL '2 days'),
(1, 2, 'We have dispatched a technician to inspect the router access point.', NOW() - INTERVAL '2 days'),
(2, 3, 'Technician ordered replacement drain pipe.', NOW() - INTERVAL '1 day');

-- 6. SEED ACTIVITY LOGS
INSERT INTO activity_logs (request_id, user_id, action_type, details, created_at) VALUES
(1, 4, 'CREATED', 'Request created with Medium priority', NOW() - INTERVAL '3 days'),
(1, 1, 'ASSIGNED', 'Assigned to Staff Alex by Admin Harsha', NOW() - INTERVAL '2 days'),
(1, 1, 'PRIORITY_CHANGED', 'Priority elevated to High', NOW() - INTERVAL '2 days'),
(2, 5, 'CREATED', 'Request created with Critical priority', NOW() - INTERVAL '2 days'),
(2, 1, 'ASSIGNED', 'Assigned to Staff Sarah by Admin Harsha', NOW() - INTERVAL '1 day'),
(2, 3, 'STATUS_CHANGED', 'Status changed from Assigned to In Progress', NOW() - INTERVAL '1 day'),
(4, 5, 'CREATED', 'Request created with Low priority', NOW() - INTERVAL '5 days'),
(4, 2, 'RESOLVED', 'Wheel replaced successfully', NOW() - INTERVAL '1 day'),
(5, 4, 'CREATED', 'Request created', NOW() - INTERVAL '7 days'),
(5, 1, 'CLOSED', 'Ticket closed after employee verified card access', NOW() - INTERVAL '4 days');
