-- ============================================================
-- Tropical Village Elementary School (TVES) — Reset Seed
-- School ID: 107967 | Region IV-A | Cluster 7
--
-- This script intentionally clears old/demo records before
-- loading TVES content. Run schema.sql first.
-- ============================================================
USE tves_db;
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM committee_members;
DELETE FROM committees;
DELETE FROM admin_users;
DELETE FROM school_info;
DELETE FROM content_blocks;
DELETE FROM banner_images;
DELETE FROM school_photos;
DELETE FROM org_chart;
DELETE FROM officials;
DELETE FROM staff_directory;
DELETE FROM ppas;
DELETE FROM student_features;
DELETE FROM accomplishments;
DELETE FROM learning_resources;
DELETE FROM issuances;
DELETE FROM internal_forms;
DELETE FROM external_links;
DELETE FROM citizens_charter;
DELETE FROM charter_documents;
DELETE FROM faqs;
DELETE FROM calendar_events;
DELETE FROM feedback_links;
DELETE FROM enrollment_stats;
DELETE FROM contact_messages;
DELETE FROM school_dashboard;
DELETE FROM school_dashboard_grades;
DELETE FROM school_head_chronology;
DELETE FROM news_and_updates;
DELETE FROM alumni;
DELETE FROM visitor_tokens;
DELETE FROM visitor_stats;

-- Optional: reset auto-increment counters so new rows start at id 1
ALTER TABLE committee_members AUTO_INCREMENT = 1;
ALTER TABLE committees AUTO_INCREMENT = 1;
ALTER TABLE admin_users AUTO_INCREMENT = 1;
ALTER TABLE school_info AUTO_INCREMENT = 1;
ALTER TABLE content_blocks AUTO_INCREMENT = 1;
ALTER TABLE banner_images AUTO_INCREMENT = 1;
ALTER TABLE school_photos AUTO_INCREMENT = 1;
ALTER TABLE org_chart AUTO_INCREMENT = 1;
ALTER TABLE officials AUTO_INCREMENT = 1;
ALTER TABLE staff_directory AUTO_INCREMENT = 1;
ALTER TABLE ppas AUTO_INCREMENT = 1;
ALTER TABLE student_features AUTO_INCREMENT = 1;
ALTER TABLE accomplishments AUTO_INCREMENT = 1;
ALTER TABLE learning_resources AUTO_INCREMENT = 1;
ALTER TABLE issuances AUTO_INCREMENT = 1;
ALTER TABLE internal_forms AUTO_INCREMENT = 1;
ALTER TABLE external_links AUTO_INCREMENT = 1;
ALTER TABLE citizens_charter AUTO_INCREMENT = 1;
ALTER TABLE charter_documents AUTO_INCREMENT = 1;
ALTER TABLE faqs AUTO_INCREMENT = 1;
ALTER TABLE calendar_events AUTO_INCREMENT = 1;
ALTER TABLE feedback_links AUTO_INCREMENT = 1;
ALTER TABLE enrollment_stats AUTO_INCREMENT = 1;
ALTER TABLE contact_messages AUTO_INCREMENT = 1;
ALTER TABLE school_dashboard AUTO_INCREMENT = 1;
ALTER TABLE school_dashboard_grades AUTO_INCREMENT = 1;
ALTER TABLE school_head_chronology AUTO_INCREMENT = 1;
ALTER TABLE news_and_updates AUTO_INCREMENT = 1;
ALTER TABLE alumni AUTO_INCREMENT = 1;
ALTER TABLE visitor_tokens AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- Admin user (magic-link login only; create additional users through
-- the database after deployment when the school's account policy is confirmed).
INSERT INTO admin_users (username, email, role)
VALUES ('tves-admin', '107967@deped.gov.ph', 'super_admin');

-- Verified school identity. Logo, principal photo, map, Facebook page,
-- and other unavailable assets remain blank so the UI shows a placeholder.
INSERT INTO school_info (
  id, school_name, school_id_no, school_type, address, region, province, city,
  district_division, year_established, principal_name, principal_title, motto,
  landline, mobile, email, domain, office_hours, google_maps_link, facebook_url,
  logo_url, principal_photo_url
) VALUES (
  1,
  'Tropical Village Elementary School',
  '107967',
  'Public Elementary',
  'Pabahay 2000, Tropical Village, Brgy. San Francisco, General Trias City, Cavite',
  'Region IV-A CALABARZON',
  'Cavite',
  'General Trias City',
  'Cluster 7',
  '1995',
  'Imelda S. Arevalo',
  'Principal II',
  'Teach with heart, Value each child, Excel together, Serve with pride',
  '',
  '0998-510-7967',
  '107967@deped.gov.ph',
  'DepEdTropicalVillageEs.com',
  'Monday–Friday, 8:00 AM–5:00 PM',
  '',
  '',
  '',
  ''
);

-- About content based only on the supplied TVES brief.
INSERT INTO content_blocks (page_slug, section_key, title, body_richtext, sort_order) VALUES
('about', 'vision', 'Vision Statement',
 '<h3>DepEd Vision</h3><p>We dream of Filipinos who passionately love their country and whose values and competencies enable them to realize their full potential and contribute meaningfully to building the nation.</p><p><strong>TVES school vision:</strong> Coming soon. The school vision statement will be published here after official confirmation.</p>', 1),
('about', 'mission', 'Mission Statement',
 '<h3>DepEd Mission</h3><p>To protect and promote the right of every Filipino to quality, equitable, culture-based, and complete basic education where learners learn in a child-friendly, gender-sensitive, safe, and motivating environment.</p><p><strong>TVES school mission:</strong> Coming soon. The school mission statement will be published here after official confirmation.</p>', 2),
('about', 'core_values', 'Core Values',
 '<p>Tropical Village Elementary School upholds the four DepEd core values:</p><ul><li><strong>Maka-Diyos</strong></li><li><strong>Maka-tao</strong></li><li><strong>Makakalikasan</strong></li><li><strong>Makabansa</strong></li></ul>', 3),
('about', 'goals', 'School Goals & Objectives',
 '<p>TVES school goals and objectives are <strong>Coming soon</strong> pending official school confirmation.</p>', 4),
('about', 'history', 'School History',
 '<p>Tropical Village Elementary School was established on <strong>August 1, 1995</strong>. Additional historical milestones and school-development details are <strong>Coming soon</strong>.</p>', 0),
('about', 'community_profile', 'Community Profile',
 '<p>Tropical Village Elementary School serves learners and families in Pabahay 2000, Tropical Village, Barangay San Francisco, General Trias City, Cavite.</p><p>The school provides <strong>Kinder through Grade 6</strong> elementary education, with a <strong>Madrasah</strong> special program and face-to-face learning modality.</p>', 5);

-- Calendar dates supplied in the TVES brief (school year 2026–2027).
INSERT INTO calendar_events (event_name, start_date, end_date, is_recurring, category) VALUES
('Brigada Eskwela', '2026-06-01', '2026-06-05', 0, 'school'),
('Enrollment Period', '2026-05-18', '2026-06-05', 0, 'enrollment'),
('Opening of Classes', '2026-06-08', NULL, 0, 'school'),
('Nutrition Month', '2026-07-01', '2026-07-31', 0, 'observance'),
('Buwan ng Wika', '2026-08-01', '2026-08-31', 0, 'observance'),
('Escoda Week', '2026-09-01', '2026-09-30', 0, 'school');

-- Official links; unavailable TVES social/feedback destinations are not invented.
INSERT INTO external_links (label, url, sort_order) VALUES
('DepEd Central Office', 'https://www.deped.gov.ph', 1),
('DepEd Orders', 'https://www.deped.gov.ph/orders/', 2),
('DepEd Memoranda', 'https://www.deped.gov.ph/memoranda/', 3),
('DepEd CALABARZON', 'https://depedcalabarzon.ph/', 4);

INSERT INTO feedback_links (type, label, url) VALUES
('general_feedback', 'TVES General Feedback Form — Coming soon', NULL),
('csm_survey', 'TVES Client Satisfaction Measurement Survey — Coming soon', NULL);

INSERT INTO citizens_charter (body_richtext) VALUES
('<p>The TVES Citizen''s Charter document is <strong>Coming soon</strong>. Please contact the school office for current service requirements and processing information.</p>');

INSERT INTO faqs (question, answer_richtext, sort_order) VALUES
('What grade levels does TVES offer?', '<p>Tropical Village Elementary School offers <strong>Kinder through Grade 6</strong>.</p>', 1),
('Is TVES a public school?', '<p>Yes. TVES is a <strong>Public Elementary</strong> school under the Department of Education.</p>', 2),
('Does TVES offer a special program?', '<p>TVES lists <strong>Madrasah</strong> as a special program. Further program details are Coming soon.</p>', 3),
('What learning modality does TVES use?', '<p>The current school brief identifies <strong>Face-to-Face</strong> learning.</p>', 4),
('When is enrollment for SY 2026–2027?', '<p>The supplied calendar lists enrollment from <strong>May 18 to June 5, 2026</strong>. Please contact the school for the latest requirements.</p>', 5),
('How do I contact TVES?', '<p>Email: <strong>107967@deped.gov.ph</strong><br />Mobile: <strong>0998-510-7967</strong><br />Office hours: <strong>Monday–Friday, 8:00 AM–5:00 PM</strong></p>', 6);

-- Principal only; faculty roster, photos, committees, and org chart were not supplied.
INSERT INTO officials (full_name, position, department_office, sort_order)
VALUES ('Imelda S. Arevalo', 'Principal II', 'School Administration', 1);

-- 2026–2027 dashboard facts from the brief. Grade-by-grade section counts
-- and gender breakdown remain zero until verified data is supplied.
INSERT INTO school_dashboard (
  active_school_year, enrollment_status, enrollment_count, performance_indicator,
  teaching_personnel, non_teaching_personnel
) VALUES ('2026-2027', 'Open', 2496, 'Current reported pupil count: 2,496', 71, 0);

INSERT INTO school_dashboard_grades (grade_level, sections_count, classrooms_count, sort_order) VALUES
('Kinder', 0, 0, 1),
('Grade 1', 0, 0, 2),
('Grade 2', 0, 0, 3),
('Grade 3', 0, 0, 4),
('Grade 4', 0, 0, 5),
('Grade 5', 0, 0, 6),
('Grade 6', 0, 0, 7),
('Madrasah', 0, 0, 8);

-- Aggregate enrollment is known, but the supplied brief does not include
-- Kinder–Grade 6 or male/female breakdowns. Admin can publish verified
-- values without carrying over the former school's data.
INSERT INTO enrollment_stats (
  school_year, sort_order,
  kinder_male, kinder_female, grade1_male, grade1_female,
  grade2_male, grade2_female, grade3_male, grade3_female,
  grade4_male, grade4_female, grade5_male, grade5_female,
  grade6_male, grade6_female
) VALUES ('2026-2027', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

INSERT INTO visitor_stats (total_visits, today_visits, today_date, unique_visitors)
VALUES (0, 0, CURRENT_DATE, 0);