-- AREWA4ASIWAJU DIGITAL PLATFORM: SEED DATA
-- Migration: 20261009000003_seed_data.sql
-- Description: Organizational hierarchy baseline, states, campus chapters, and initial news/events

-- 1. APEX NATIONAL ORGANISATIONAL UNIT
INSERT INTO organisational_units (id, name, code, type, description)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Arewa4Asiwaju National Headquarters',
  'NAT-A4A',
  'national',
  'National executive coordinating council for the 19 Northern Nigerian States & FCT'
) ON CONFLICT (code) DO NOTHING;

-- 2. STATE CHAPTER UNITS (19 Northern States + FCT)
INSERT INTO organisational_units (name, code, type, parent_id, state_code)
VALUES
  ('Adamawa State Chapter', 'ST-AD', 'state', '11111111-1111-1111-1111-111111111111', 'AD'),
  ('Bauchi State Chapter', 'ST-BA', 'state', '11111111-1111-1111-1111-111111111111', 'BA'),
  ('Benue State Chapter', 'ST-BN', 'state', '11111111-1111-1111-1111-111111111111', 'BN'),
  ('Borno State Chapter', 'ST-BO', 'state', '11111111-1111-1111-1111-111111111111', 'BO'),
  ('FCT Abuja Chapter', 'ST-FCT', 'state', '11111111-1111-1111-1111-111111111111', 'FCT'),
  ('Gombe State Chapter', 'ST-GM', 'state', '11111111-1111-1111-1111-111111111111', 'GM'),
  ('Jigawa State Chapter', 'ST-JG', 'state', '11111111-1111-1111-1111-111111111111', 'JG'),
  ('Kaduna State Chapter', 'ST-KD', 'state', '11111111-1111-1111-1111-111111111111', 'KD'),
  ('Kano State Chapter', 'ST-KN', 'state', '11111111-1111-1111-1111-111111111111', 'KN'),
  ('Katsina State Chapter', 'ST-KT', 'state', '11111111-1111-1111-1111-111111111111', 'KT'),
  ('Kebbi State Chapter', 'ST-KB', 'state', '11111111-1111-1111-1111-111111111111', 'KB'),
  ('Kogi State Chapter', 'ST-KG', 'state', '11111111-1111-1111-1111-111111111111', 'KG'),
  ('Kwara State Chapter', 'ST-KW', 'state', '11111111-1111-1111-1111-111111111111', 'KW'),
  ('Nasarawa State Chapter', 'ST-NS', 'state', '11111111-1111-1111-1111-111111111111', 'NS'),
  ('Niger State Chapter', 'ST-NG', 'state', '11111111-1111-1111-1111-111111111111', 'NG'),
  ('Plateau State Chapter', 'ST-PL', 'state', '11111111-1111-1111-1111-111111111111', 'PL'),
  ('Sokoto State Chapter', 'ST-SK', 'state', '11111111-1111-1111-1111-111111111111', 'SK'),
  ('Taraba State Chapter', 'ST-TR', 'state', '11111111-1111-1111-1111-111111111111', 'TR'),
  ('Yobe State Chapter', 'ST-YB', 'state', '11111111-1111-1111-1111-111111111111', 'YB'),
  ('Zamfara State Chapter', 'ST-ZM', 'state', '11111111-1111-1111-1111-111111111111', 'ZM')
ON CONFLICT (code) DO NOTHING;

-- 3. PROMINENT CAMPUS CHAPTERS
INSERT INTO organisational_units (name, code, type, state_code, description)
VALUES
  ('BUK Campus Directorate (Bayero University Kano)', 'CHP-BUK', 'campus_chapter', 'KN', 'Student wing executive council across Old & New campuses'),
  ('ABU Zaria Campus Directorate', 'CHP-ABU', 'campus_chapter', 'KD', 'Student wing executive council across Samaru & Kongo campuses'),
  ('UDUS Sokoto Campus Directorate', 'CHP-UDUS', 'campus_chapter', 'SK', 'Student wing mobilization wing across main campus'),
  ('UNIMAID Maiduguri Campus Directorate', 'CHP-UNIMAID', 'campus_chapter', 'BO', 'Student wing leadership chapter'),
  ('UNIJOS Jos Campus Directorate', 'CHP-UNIJOS', 'campus_chapter', 'PL', 'Plateau student wing chapter'),
  ('FUT Minna Campus Directorate', 'CHP-FUTMIN', 'campus_chapter', 'NG', 'Niger state student mobilization wing')
ON CONFLICT (code) DO NOTHING;

-- 4. INITIAL PUBLISHED NEWS & ANNOUNCEMENTS
INSERT INTO announcements (title, slug, excerpt, content, category, is_published, published_at, author_name)
VALUES
  (
    'Arewa4Asiwaju Launches Central Digital Supporter Portal and High-Security Digital ID System',
    'launch-of-central-digital-portal',
    'The official student and youth movement has unveiled its automated digital membership platform across the 19 northern states and the FCT.',
    'In a landmark initiative to deepen grassroots civic engagement and empower progressive youth across Northern Nigeria, the Arewa4Asiwaju National Directorate has officially deployed its state-of-the-art digital infrastructure. The platform enables automated supporter verification, secure digital identity issuance with cryptographic QR validation, and direct student representation across all accredited tertiary institutions.',
    'press_release',
    TRUE,
    NOW() - INTERVAL '2 days',
    'National Directorate of Digital Media'
  ),
  (
    'National Youth Leadership & Tech Innovation Summit Announced for Abuja',
    'national-youth-leadership-tech-summit',
    'Over 5,000 delegates from student union bodies, artisan councils, and youth directorates set to convene at the International Conference Centre.',
    'The summit will bring together regional coordinators, campus ambassadors, and grassroots mobilizers to formulate actionable policy briefs on digital economy expansion, agricultural modern technology, and vocational grants for Northern youth.',
    'announcement',
    TRUE,
    NOW() - INTERVAL '5 days',
    'Directorate of Youth Engagement'
  )
ON CONFLICT (slug) DO NOTHING;

-- 5. INITIAL EVENTS
INSERT INTO events (title, slug, description, category, venue, state_code, start_date, end_date, capacity, is_published)
VALUES
  (
    'Arewa Youth Leadership & Digital Economy Summit 2026',
    'arewa-youth-leadership-summit-2026',
    'Annual national conference uniting tertiary student leaders, innovators, and grassroots coordinators across the 19 Northern states.',
    'symposium',
    'International Conference Centre (ICC), Central Area, Abuja',
    'FCT',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '6 hours',
    2500,
    TRUE
  ),
  (
    'BUK Campus Civic Mobilization Symposium',
    'buk-campus-civic-symposium',
    'Interactive campus dialogue on youth empowerment, student welfare schemes, and civic participation.',
    'training',
    'Musa Abdullahi Auditorium, Bayero University Kano (New Campus)',
    'KN',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '21 days' + INTERVAL '4 hours',
    1200,
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;
