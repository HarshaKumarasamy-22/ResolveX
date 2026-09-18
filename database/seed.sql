-- ==========================================================
-- ResolveX Database Seed Data
-- Aurevia Institute of Technology (AIT) - Colombo, Sri Lanka
-- "Innovate. Connect. Resolve."
-- ==========================================================

-- Clear existing data
TRUNCATE activity_logs, comments, assignments, requests, categories, users RESTART IDENTITY CASCADE;

-- 1. SEED 8 OFFICIAL AIT CATEGORIES
INSERT INTO categories (name, description, icon) VALUES
('IT & Software', 'Computer hardware issues, operating system errors, software licenses, IDEs, and LMS portal bugs', 'pi-desktop'),
('Network & Internet', 'Campus Wi-Fi outages, high-speed LAN connectivity, VPN access, and firewall permissions', 'pi-wifi'),
('Classroom & Laboratory', 'Digital projectors, smart podiums, lab workstations, audio equipment, and lab instrumentation', 'pi-video'),
('Facilities & Maintenance', 'Air conditioning malfunctions, electrical power outlets, lighting, plumbing, and structural maintenance', 'pi-wrench'),
('Academic Services', 'Exam timetable queries, student grading portal, course enrollment issues, and academic transcripts', 'pi-book'),
('Student Services', 'Student ID card reissuance, parking permits, student club room reservations, and hostel amenities', 'pi-id-card'),
('Library Services', 'Digital library database access, IEEE/ScienceDirect subscriptions, book return system, and quiet study room booking', 'pi-bookmark'),
('Administrative Services', 'Staff equipment procurement, official document processing, visitor passes, and departmental supplies', 'pi-briefcase');

-- 2. SEED REALISTIC AIT USERS (Password for all accounts: "Password@123")
-- Hash: $2b$10$JBzYbo6KB91qPI8SF3X.IOQXdzA4uSUstKaMkJojdf6y5EWI0AONO
INSERT INTO users (full_name, email, password_hash, role, department, phone, is_active) VALUES
('Harsha Bandara', 'admin@ait.lk', '$2b$10$JBzYbo6KB91qPI8SF3X.IOQXdzA4uSUstKaMkJojdf6y5EWI0AONO', 'admin', 'Student Affairs & Support Services', '+94 77 123 4567', TRUE),
('Chaminda Silva', 'support.it@ait.lk', '$2b$10$JBzYbo6KB91qPI8SF3X.IOQXdzA4uSUstKaMkJojdf6y5EWI0AONO', 'support_staff', 'Faculty of Computing & Software Engineering', '+94 77 234 5678', TRUE),
('Kasun Fernando', 'support.facilities@ait.lk', '$2b$10$JBzYbo6KB91qPI8SF3X.IOQXdzA4uSUstKaMkJojdf6y5EWI0AONO', 'support_staff', 'Student Affairs & Support Services', '+94 77 345 6789', TRUE),
('Kavindu Perera', 'student@ait.lk', '$2b$10$JBzYbo6KB91qPI8SF3X.IOQXdzA4uSUstKaMkJojdf6y5EWI0AONO', 'student', 'Faculty of Computing & Software Engineering', '+94 71 456 7890', TRUE),
('Dr. Anura Jayawardena', 'lecturer@ait.lk', '$2b$10$JBzYbo6KB91qPI8SF3X.IOQXdzA4uSUstKaMkJojdf6y5EWI0AONO', 'lecturer', 'Faculty of Engineering & Technology', '+94 70 567 8901', TRUE),
('Nimmi Wickramasinghe', 'staff@ait.lk', '$2b$10$JBzYbo6KB91qPI8SF3X.IOQXdzA4uSUstKaMkJojdf6y5EWI0AONO', 'staff', 'Faculty of Business & Management', '+94 76 678 9012', TRUE),
('Malith Senanayake', 'malith.design@ait.lk', '$2b$10$JBzYbo6KB91qPI8SF3X.IOQXdzA4uSUstKaMkJojdf6y5EWI0AONO', 'student', 'Faculty of Design & Digital Media', '+94 75 789 0123', TRUE),
('Dilshan Ranatunga', 'support.net@ait.lk', '$2b$10$JBzYbo6KB91qPI8SF3X.IOQXdzA4uSUstKaMkJojdf6y5EWI0AONO', 'support_staff', 'Faculty of Computing & Software Engineering', '+94 78 890 1234', TRUE);

-- 3. SEED REALISTIC AIT SERVICE REQUESTS
INSERT INTO requests (request_code, title, description, category_id, user_id, department, location, room_number, status, priority, assigned_team, created_at, updated_at, resolved_at) VALUES
(
  'AIT-2026-0001',
  'Campus Wi-Fi connectivity dropping continuously in Computing Lab 3',
  'During practical lab sessions, the Eduroam and AIT-Student Wi-Fi access points drop every 5-10 minutes, disrupting online compiler tests.',
  2, -- Network & Internet
  4, -- Kavindu Perera (Student)
  'Faculty of Computing & Software Engineering',
  'Computing Building',
  'Computer Lab 3 - Level 2',
  'Assigned',
  'High',
  'Network Support',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days',
  NULL
),
(
  'AIT-2026-0002',
  'Main ceiling Air Conditioner leaking water directly onto lecture podium',
  'The dual inverter AC unit in Lecture Hall A is continuously dripping condensed water onto the presenter desk and multimedia cabling.',
  4, -- Facilities & Maintenance
  5, -- Dr. Anura Jayawardena (Lecturer)
  'Faculty of Engineering & Technology',
  'Lecture Halls',
  'Lecture Hall A (Capacity 250)',
  'In Progress',
  'Urgent',
  'Facilities & Maintenance',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day',
  NULL
),
(
  'AIT-2026-0003',
  'Student LMS portal throwing 500 error when uploading assignment PDF',
  'Several 3rd-year software engineering students are unable to submit their final semester project archives due to a file size timeout on the student portal.',
  1, -- IT & Software
  4, -- Kavindu Perera (Student)
  'Faculty of Computing & Software Engineering',
  'Innovation Centre',
  'Software Incubation Suite',
  'Pending',
  'Medium',
  'IT Support',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NULL
),
(
  'AIT-2026-0004',
  'Smart Interactive Projector HDMI output flickering in Business Room 301',
  'HDMI port 1 on the wall panel has a loose connector, causing the projector display to turn black intermittently during lectures.',
  3, -- Classroom & Laboratory
  6, -- Nimmi Wickramasinghe (Staff)
  'Faculty of Business & Management',
  'Business Building',
  'Executive Seminar Room 301',
  'Resolved',
  'Low',
  'Classroom & Laboratory',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  'AIT-2026-0005',
  'RFID Student ID Card contactless chip replacement request',
  'Student ID RFID chip failed scan test at the AIT Library turnstile and campus cafeteria payment terminal.',
  6, -- Student Services
  7, -- Malith Senanayake (Student)
  'Faculty of Design & Digital Media',
  'Student Centre',
  'Helpdesk Counter 2',
  'Closed',
  'Low',
  'Student Services',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
),
(
  'AIT-2026-0006',
  'IEEE Xplore and Springer digital research access license renewal',
  'Research students and faculty members are encountering subscription expired warnings when accessing IEEE journals via campus proxy.',
  7, -- Library Services
  5, -- Dr. Anura Jayawardena (Lecturer)
  'Student Affairs & Support Services',
  'Library',
  'Digital Research Commons - 3rd Floor',
  'Assigned',
  'High',
  'IT Support',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '1 day',
  NULL
);

-- 4. SEED ASSIGNMENTS
INSERT INTO assignments (request_id, assigned_to, assigned_by, assigned_team, assigned_at) VALUES
(1, 8, 1, 'Network Support', NOW() - INTERVAL '2 days'),
(2, 3, 1, 'Facilities & Maintenance', NOW() - INTERVAL '1 day'),
(4, 2, 1, 'Laboratory Support', NOW() - INTERVAL '3 days'),
(5, 1, 1, 'Student Services', NOW() - INTERVAL '6 days'),
(6, 2, 1, 'IT Support', NOW() - INTERVAL '1 day');

-- 5. SEED COMMENTS
INSERT INTO comments (request_id, user_id, message, created_at) VALUES
(1, 4, 'Issue occurs primarily between 10:30 AM and 1:00 PM when student density in Lab 3 is highest.', NOW() - INTERVAL '2 days'),
(1, 8, 'Network operations team is provisioning an additional Aruba AP in Lab 3 ceiling grid today.', NOW() - INTERVAL '2 days'),
(2, 5, 'Please expedite before tomorrow morning''s Robotics and Automation lecture.', NOW() - INTERVAL '1 day'),
(2, 3, 'Maintenance crew is onsite replacing the condensate drain pump.', NOW() - INTERVAL '1 day');

-- 6. SEED ACTIVITY LOGS
INSERT INTO activity_logs (request_id, user_id, action_type, details, created_at) VALUES
(1, 4, 'CREATED', 'Request created with High priority by Kavindu Perera', NOW() - INTERVAL '3 days'),
(1, 1, 'ASSIGNED', 'Assigned to Dilshan Ranatunga (Network Support) by Admin Harsha Bandara', NOW() - INTERVAL '2 days'),
(2, 5, 'CREATED', 'Request created with Urgent priority by Dr. Anura Jayawardena', NOW() - INTERVAL '2 days'),
(2, 1, 'ASSIGNED', 'Assigned to Kasun Fernando (Facilities & Maintenance) by Admin Harsha Bandara', NOW() - INTERVAL '1 day'),
(2, 3, 'STATUS_CHANGED', 'Status changed from Assigned to In Progress', NOW() - INTERVAL '1 day'),
(4, 6, 'CREATED', 'Request created with Low priority by Nimmi Wickramasinghe', NOW() - INTERVAL '5 days'),
(4, 2, 'RESOLVED', 'HDMI wall panel cable assembly replaced and tested', NOW() - INTERVAL '1 day'),
(5, 7, 'CREATED', 'Request created by Malith Senanayake', NOW() - INTERVAL '7 days'),
(5, 1, 'CLOSED', 'Replacement RFID card issued and verified at turnstile', NOW() - INTERVAL '4 days'),
(6, 5, 'CREATED', 'Request created with High priority by Dr. Anura Jayawardena', NOW() - INTERVAL '4 days'),
(6, 1, 'ASSIGNED', 'Assigned to Chaminda Silva (IT Support) by Admin Harsha Bandara', NOW() - INTERVAL '1 day');
