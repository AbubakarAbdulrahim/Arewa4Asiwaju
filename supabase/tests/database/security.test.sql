BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET LOCAL search_path = extensions, public;
SELECT plan(96);

SELECT ok(
  EXISTS (
    SELECT 1 FROM storage.buckets
    WHERE id = 'member-profile-photos'
      AND public = FALSE
      AND file_size_limit = 5242880
      AND allowed_mime_types = ARRAY['image/jpeg','image/png']::TEXT[]
  ),
  'member profile photos use a private image-only bucket with a size limit'
);
SELECT ok(has_function_privilege('service_role', 'public.create_open_membership_with_photo(uuid,text,text,text,text,text,text,text,uuid,text,text,boolean,text,text,text,jsonb)', 'EXECUTE'), 'trusted registration service can create memberships with private photos');
SELECT ok(NOT has_function_privilege('authenticated', 'public.create_open_membership_with_photo(uuid,text,text,text,text,text,text,text,uuid,text,text,boolean,text,text,text,jsonb)', 'EXECUTE'), 'members cannot invoke open membership creation');
SELECT ok(NOT has_function_privilege('anon', 'public.create_open_membership_with_photo(uuid,text,text,text,text,text,text,text,uuid,text,text,boolean,text,text,text,jsonb)', 'EXECUTE'), 'anonymous clients cannot invoke open membership creation directly');

SELECT ok(
  EXISTS (
    SELECT 1 FROM storage.buckets
    WHERE id = 'member-id-cards'
      AND public = FALSE
      AND file_size_limit = 5242880
      AND allowed_mime_types = ARRAY['application/pdf']::TEXT[]
  ),
  'membership cards use a private PDF-only bucket with an upload size limit'
);

SELECT ok(NOT has_column_privilege('anon', 'public.events', 'virtual_link', 'SELECT'), 'public clients cannot read event joining links');
SELECT ok(NOT has_column_privilege('authenticated', 'public.events', 'virtual_link', 'SELECT'), 'signed-in clients cannot read event joining links');
SELECT ok(NOT has_column_privilege('anon', 'public.events', 'registered_count', 'SELECT'), 'public clients cannot read internal event registration counts');
SELECT ok(NOT has_column_privilege('authenticated', 'public.events', 'registered_count', 'SELECT'), 'signed-in clients cannot read internal event registration counts');
SELECT ok(has_column_privilege('anon', 'public.events', 'title', 'SELECT'), 'public clients can read published event titles');
SELECT ok(has_column_privilege('authenticated', 'public.events', 'title', 'SELECT'), 'signed-in clients can read published event titles');
SELECT ok(has_column_privilege('anon', 'public.announcements', 'content', 'SELECT'), 'public clients can read published announcement content');
SELECT ok(has_column_privilege('authenticated', 'public.announcements', 'content', 'SELECT'), 'signed-in clients can read published announcement content');
SELECT ok(NOT has_column_privilege('authenticated', 'public.profiles', 'first_name', 'UPDATE'), 'profile changes must pass through the validated transaction');
SELECT ok(NOT has_column_privilege('authenticated', 'public.profiles', 'email', 'UPDATE'), 'members cannot change their verified email directly');
SELECT ok(NOT has_column_privilege('authenticated', 'public.profiles', 'full_name', 'UPDATE'), 'members cannot forge the denormalised display name');
SELECT ok(NOT has_column_privilege('authenticated', 'public.profiles', 'date_of_birth', 'UPDATE'), 'members cannot update uncollected sensitive profile fields');
SELECT ok(has_function_privilege('authenticated', 'public.register_member_for_event(uuid)', 'EXECUTE'), 'authenticated members can use the scoped event registration action');
SELECT ok(NOT has_function_privilege('anon', 'public.register_member_for_event(uuid)', 'EXECUTE'), 'anonymous visitors cannot register members for events');
SELECT ok(has_function_privilege('authenticated', 'public.update_my_member_profile(text,text,text,text,text)', 'EXECUTE'), 'members can use the self-scoped profile update transaction');
SELECT ok(NOT has_function_privilege('anon', 'public.update_my_member_profile(text,text,text,text,text)', 'EXECUTE'), 'anonymous visitors cannot update member profiles');
SELECT ok(has_table_privilege('authenticated', 'public.notification_preferences', 'UPDATE'), 'authenticated members can manage preference rows subject to RLS');
SELECT ok(has_column_privilege('authenticated', 'public.in_app_notifications', 'read_at', 'UPDATE'), 'members can mark their own notifications as read');
SELECT ok(NOT has_column_privilege('authenticated', 'public.in_app_notifications', 'body', 'UPDATE'), 'members cannot rewrite notification content');
SELECT ok(has_function_privilege('authenticated', 'public.admin_search_members(text,public.membership_status,text,uuid,integer,integer)', 'EXECUTE'), 'signed-in clients can call the scoped member search procedure');
SELECT ok(NOT has_function_privilege('anon', 'public.admin_search_members(text,public.membership_status,text,uuid,integer,integer)', 'EXECUTE'), 'anonymous clients cannot search member records');
SELECT ok(has_function_privilege('authenticated', 'public.admin_set_membership_status(uuid,public.membership_status)', 'EXECUTE'), 'signed-in clients may request membership status changes subject to role checks');
SELECT ok(NOT has_function_privilege('anon', 'public.admin_set_membership_status(uuid,public.membership_status)', 'EXECUTE'), 'anonymous clients cannot change membership status');
SELECT ok(has_function_privilege('authenticated', 'public.admin_save_org_unit(uuid,text,text,public.org_unit_type,uuid,text,text,text)', 'EXECUTE'), 'signed-in clients may request unit changes subject to role checks');
SELECT ok(NOT has_function_privilege('anon', 'public.admin_save_org_unit(uuid,text,text,public.org_unit_type,uuid,text,text,text)', 'EXECUTE'), 'anonymous clients cannot change organisational units');
SELECT ok(has_function_privilege('authenticated', 'public.admin_list_audit(integer,integer)', 'EXECUTE'), 'signed-in clients may request audit records subject to role checks');
SELECT ok(NOT has_function_privilege('anon', 'public.admin_list_audit(integer,integer)', 'EXECUTE'), 'anonymous clients cannot access audit records');
SELECT ok(has_function_privilege('authenticated', 'public.admin_log_member_export(integer,text,public.membership_status,text)', 'EXECUTE'), 'authenticated clients may request audited exports subject to role and purpose checks');
SELECT ok(NOT has_function_privilege('anon', 'public.admin_log_member_export(integer,text,public.membership_status,text)', 'EXECUTE'), 'anonymous clients cannot log or request exports');
SELECT ok(has_function_privilege('anon', 'public.get_public_leadership()', 'EXECUTE'), 'anonymous visitors can read only the published leadership projection');
SELECT ok(NOT has_function_privilege('anon', 'public.admin_save_leadership(uuid,text,text,text,text,uuid,integer,boolean)', 'EXECUTE'), 'anonymous visitors cannot publish leadership profiles');
SELECT ok(has_function_privilege('anon', 'public.get_public_media()', 'EXECUTE'), 'anonymous visitors can read the published media projection');
SELECT ok(NOT has_function_privilege('anon', 'public.admin_save_media(uuid,text,text,text,text,text,boolean)', 'EXECUTE'), 'anonymous visitors cannot publish media records');
SELECT ok(has_function_privilege('authenticated', 'public.admin_list_event_attendance(uuid,integer,integer)', 'EXECUTE'), 'signed-in clients may request paginated attendance subject to scope');
SELECT ok(NOT has_function_privilege('anon', 'public.admin_list_event_attendance(uuid,integer,integer)', 'EXECUTE'), 'anonymous visitors cannot access event attendance');

-- Fixed IDs make ownership and hierarchy assertions readable. This test rolls
-- back every fixture so repeated runs do not pollute a development database.
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
  ('a4000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'member.one@example.test', '', now(), '{}', '{}', now(), now()),
  ('a4000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'member.two@example.test', '', now(), '{}', '{}', now(), now()),
  ('a4000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'coordinator@example.test', '', now(), '{}', '{}', now(), now()),
  ('a4000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'new.member@example.test', '', now(), '{}', '{}', now(), now()),
  ('a4000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'unverified@example.test', '', NULL, '{}', '{}', now(), now()),
  ('a4000000-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'card.member@example.test', '', now(), '{}', '{}', now(), now());

INSERT INTO public.organisational_units (id, name, code, type, parent_id, state_code)
VALUES
  ('a4000000-0000-4000-8000-000000000010', 'Database test LGA', 'TEST-LGA-KN', 'lga', (SELECT id FROM public.organisational_units WHERE code = 'ST-KN'), 'KN'),
  ('a4000000-0000-4000-8000-000000000011', 'Database test ward', 'TEST-WARD-KN', 'ward', 'a4000000-0000-4000-8000-000000000010', 'KN'),
  ('a4000000-0000-4000-8000-000000000012', 'Database test LGA in Bauchi', 'TEST-LGA-BA', 'lga', (SELECT id FROM public.organisational_units WHERE code = 'ST-BA'), 'BA');

INSERT INTO public.profiles (id, full_name, first_name, last_name, email, phone, state_of_residence, lga_of_residence)
VALUES
  ('a4000000-0000-4000-8000-000000000001', 'Member One', 'Member', 'One', 'member.one@example.test', '+2348010000001', 'Kano', 'Database test LGA'),
  ('a4000000-0000-4000-8000-000000000002', 'Member Two', 'Member', 'Two', 'member.two@example.test', '+2348010000002', 'Bauchi', 'Database test LGA in Bauchi'),
  ('a4000000-0000-4000-8000-000000000003', 'Coordinator User', 'Coordinator', 'User', 'coordinator@example.test', '+2348010000003', 'Kano', 'Database test LGA');

INSERT INTO public.memberships (id, profile_id, membership_number, state_code, org_unit_id)
VALUES
  ('a4000000-0000-4000-8000-000000000020', 'a4000000-0000-4000-8000-000000000001', 'A4A-2026-KN-999991', 'KN', 'a4000000-0000-4000-8000-000000000011'),
  ('a4000000-0000-4000-8000-000000000021', 'a4000000-0000-4000-8000-000000000002', 'A4A-2026-BA-999992', 'BA', 'a4000000-0000-4000-8000-000000000012');
INSERT INTO public.events (id,title,slug,description,category,venue,state_code,start_date,end_date,is_published,org_unit_id)
VALUES
  ('a4000000-0000-4000-8000-000000000030','Kano scoped test','kano-scoped-test','Test event for scoped aggregate reporting.','meeting','Kano','KN',now()+interval '2 days',now()+interval '2 days 1 hour',TRUE,'a4000000-0000-4000-8000-000000000011'),
  ('a4000000-0000-4000-8000-000000000031','Bauchi scoped test','bauchi-scoped-test','Test event for scoped aggregate reporting.','meeting','Bauchi','BA',now()+interval '2 days',now()+interval '2 days 1 hour',TRUE,'a4000000-0000-4000-8000-000000000012');
INSERT INTO public.event_registrations (event_id,membership_id,ticket_token)
VALUES
  ('a4000000-0000-4000-8000-000000000030','a4000000-0000-4000-8000-000000000020',repeat('1',64)),
  ('a4000000-0000-4000-8000-000000000031','a4000000-0000-4000-8000-000000000021',repeat('2',64));
INSERT INTO public.data_requests (membership_id,request_type,status)
VALUES ('a4000000-0000-4000-8000-000000000020','access','pending');
INSERT INTO public.notification_outbox (channel,recipient,body,status)
VALUES ('email','member.one@example.test','Test outbox item','pending');
INSERT INTO public.role_assignments (user_id, role, org_unit_id, state_code)
VALUES ('a4000000-0000-4000-8000-000000000003', 'lga_coordinator', 'a4000000-0000-4000-8000-000000000010', 'KN');
INSERT INTO public.consent_records (profile_id, consent_purpose, is_granted, policy_version, policy_sha256, source)
VALUES
  ('a4000000-0000-4000-8000-000000000001', 'membership_data_processing', TRUE, 'test-v1', repeat('a', 64), 'self_service'),
  ('a4000000-0000-4000-8000-000000000002', 'membership_data_processing', TRUE, 'test-v1', repeat('b', 64), 'self_service');
INSERT INTO public.id_cards (membership_id, card_version, verification_token)
VALUES ('a4000000-0000-4000-8000-000000000020', 1, repeat('c', 64));

SELECT throws_ok(
  $$UPDATE public.memberships SET membership_number = 'A4A-2026-KN-999991' WHERE id = 'a4000000-0000-4000-8000-000000000021'$$,
  '23505', NULL, 'membership numbers are unique at the database boundary'
);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'a4000000-0000-4000-8000-000000000001', TRUE);
SELECT set_config('request.jwt.claim.role', 'authenticated', TRUE);
SELECT set_config('request.jwt.claims', '{"sub":"a4000000-0000-4000-8000-000000000001","role":"authenticated"}', TRUE);
SELECT is((SELECT count(*)::INTEGER FROM public.profiles), 1, 'a member can read only their own profile');
SELECT is((SELECT count(id)::INTEGER FROM public.memberships), 1, 'a member can read their own membership');
SELECT is((SELECT count(*)::INTEGER FROM public.consent_records), 1, 'a member can read only their own consent receipt');
SELECT is((SELECT count(id)::INTEGER FROM public.in_app_notifications), 1, 'a member can read their own event notification');
SELECT is((SELECT count(id)::INTEGER FROM public.in_app_notifications WHERE profile_id = 'a4000000-0000-4000-8000-000000000002'), 0, 'a member cannot read another member notification');
SELECT is((SELECT count(*)::INTEGER FROM public.consent_records WHERE profile_id = 'a4000000-0000-4000-8000-000000000002'), 0, 'a member cannot read another member consent');
SELECT is((SELECT count(id)::INTEGER FROM public.id_cards), 1, 'a member can read safe metadata for their own card');
SELECT is((SELECT count(id)::INTEGER FROM public.memberships WHERE profile_id = 'a4000000-0000-4000-8000-000000000002'), 0, 'a member cannot read another member membership');
SELECT throws_ok(
  $$UPDATE public.memberships SET status = 'active' WHERE id = 'a4000000-0000-4000-8000-000000000020'$$,
  '42501', NULL, 'a member cannot set their own membership status'
);
SELECT throws_ok(
  $$INSERT INTO public.role_assignments (user_id, role) VALUES ('a4000000-0000-4000-8000-000000000001', 'super_admin')$$,
  '42501', NULL, 'a member cannot grant themselves a role'
);
SELECT throws_ok(
  $$SELECT * FROM public.create_verified_membership('a4000000-0000-4000-8000-000000000001', 'A', 'B', '+2348010000001', 'Kano', 'Test LGA', 'KN', 'a4000000-0000-4000-8000-000000000010', 'v1', repeat('a', 64), TRUE)$$,
  '42501', NULL, 'a client cannot call the service-only membership transaction'
);
SELECT throws_ok(
  $$SELECT verification_token FROM public.id_cards WHERE membership_id = 'a4000000-0000-4000-8000-000000000020'$$,
  '42501', NULL, 'card QR tokens are not selectable by browser clients'
);

SELECT set_config('request.jwt.claim.sub', 'a4000000-0000-4000-8000-000000000003', TRUE);
SELECT set_config('request.jwt.claims', '{"sub":"a4000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal1"}', TRUE);
SELECT is((SELECT count(id)::INTEGER FROM public.memberships), 0, 'an administrator at AAL1 cannot read scoped membership records');
SELECT set_config('request.jwt.claims', '{"sub":"a4000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal2"}', TRUE);
SELECT is((SELECT count(id)::INTEGER FROM public.memberships), 1, 'an LGA coordinator can read membership rows in descendant wards');
SELECT is((SELECT count(id)::INTEGER FROM public.memberships WHERE state_code = 'BA'), 0, 'an LGA coordinator cannot read outside their scope');
SELECT is(public.admin_reporting_summary()->>'events_next_30_days', '1', 'an LGA coordinator sees only in-scope event totals');
SELECT is(public.admin_reporting_summary()->>'event_registrations_next_30_days', '1', 'an LGA coordinator sees only in-scope attendance totals');
SELECT is(public.admin_reporting_summary()->>'privacy_open', NULL::TEXT, 'scoped coordinators do not see global privacy queue totals');
SELECT is(public.admin_reporting_summary()->>'notifications_pending', NULL::TEXT, 'scoped coordinators do not see global notification queue totals');

SET LOCAL ROLE service_role;
SELECT set_config('request.jwt.claim.sub', 'a4000000-0000-4000-8000-000000000004', TRUE);
SELECT set_config('request.jwt.claim.role', 'service_role', TRUE);
SELECT set_config('request.jwt.claims', '{"sub":"a4000000-0000-4000-8000-000000000004","role":"service_role"}', TRUE);
SELECT set_config('test.a4a.membership_number', result.membership_number, TRUE)
FROM public.create_verified_membership(
  'a4000000-0000-4000-8000-000000000004', 'New', 'Member', '+2348010000004', 'Kano',
  'Database test LGA', 'KN', 'a4000000-0000-4000-8000-000000000010', 'test-v1', repeat('d', 64), TRUE
) AS result;
SELECT ok(current_setting('test.a4a.membership_number') ~ '^A4A-[0-9]{4}-KN-[0-9]{6,}$', 'verified registration allocates a formatted unique membership number');
SELECT is((SELECT count(id)::INTEGER FROM public.profiles WHERE id = 'a4000000-0000-4000-8000-000000000004'), 1, 'verified registration creates one profile');
SELECT is((SELECT count(id)::INTEGER FROM public.memberships WHERE profile_id = 'a4000000-0000-4000-8000-000000000004'), 1, 'verified registration creates one membership');
SELECT is((SELECT count(id)::INTEGER FROM public.consent_records WHERE profile_id = 'a4000000-0000-4000-8000-000000000004'), 1, 'verified registration writes its consent receipt atomically');
SELECT is((SELECT count(id)::INTEGER FROM public.role_assignments WHERE user_id = 'a4000000-0000-4000-8000-000000000004' AND role = 'member'), 1, 'verified registration assigns only the member role');
SELECT is((SELECT membership_number FROM public.create_verified_membership(
  'a4000000-0000-4000-8000-000000000004', 'Changed', 'Payload', '+2348010000004', 'Kano',
  'Database test LGA', 'KN', 'a4000000-0000-4000-8000-000000000010', 'test-v1', repeat('d', 64), TRUE
)), current_setting('test.a4a.membership_number'), 'a retry returns the same membership number');
SELECT throws_ok(
  $$SELECT * FROM public.create_verified_membership('a4000000-0000-4000-8000-000000000005', 'No', 'Verify', '+2348010000005', 'Kano', 'Database test LGA', 'KN', 'a4000000-0000-4000-8000-000000000010', 'test-v1', repeat('e', 64), TRUE)$$,
  '42501', NULL, 'an unverified email cannot create a membership'
);
SELECT set_config('test.a4a.open_membership_number', result.membership_number, TRUE)
FROM public.create_open_membership_with_card(
  'a4000000-0000-4000-8000-000000000005', 'unverified@example.test', 'Open', NULL, 'Member',
  'Kano', 'Database test LGA', 'KN', (SELECT id FROM public.organisational_units WHERE code = 'ST-KN'),
  'test-v1', repeat('e', 64), TRUE
) AS result;
SELECT ok(current_setting('test.a4a.open_membership_number') ~ '^A4A-[0-9]{4}-KN-[0-9]{6,}$', 'open registration allocates a membership without email verification');
SELECT is((SELECT count(*)::INTEGER FROM public.memberships WHERE profile_id = 'a4000000-0000-4000-8000-000000000005'), 1, 'open registration creates one membership for the unverified Auth account');
SELECT is((SELECT count(*)::INTEGER FROM public.id_cards card JOIN public.memberships membership ON membership.id = card.membership_id WHERE membership.profile_id = 'a4000000-0000-4000-8000-000000000005'), 1, 'open registration creates an initial ID-card record');
SELECT is((SELECT membership_number FROM public.create_open_membership_with_card(
  'a4000000-0000-4000-8000-000000000005', 'unverified@example.test', 'Changed', NULL, 'Payload',
  'Kano', 'Database test LGA', 'KN', (SELECT id FROM public.organisational_units WHERE code = 'ST-KN'),
  'test-v1', repeat('e', 64), TRUE
)), current_setting('test.a4a.open_membership_number'), 'open-registration retry returns the original membership');
SELECT is((SELECT count(*)::INTEGER FROM public.id_cards card JOIN public.memberships membership ON membership.id = card.membership_id WHERE membership.profile_id = 'a4000000-0000-4000-8000-000000000005'), 1, 'open-registration retry does not create a duplicate card');
SELECT * FROM public.create_open_membership_with_photo(
  'a4000000-0000-4000-8000-000000000005', 'unverified@example.test', 'Open', NULL, 'Member',
  'Kano', 'Database test LGA', 'KN', (SELECT id FROM public.organisational_units WHERE code = 'ST-KN'),
  'test-v1', repeat('e', 64), TRUE, 'members/a4000000-0000-4000-8000-000000000005/profile.jpg', 'tertiary', 'Test University',
  '{"phone":"08012345678","is_student":"yes","ward":"Test Ward","lga_code":"KMC","course_of_study":"Computer Science","study_level":"300 level","institution_campus":"Main Campus","department":"Computing","graduation_year":"2028"}'::JSONB
);
RESET ROLE;
SELECT is((SELECT email_confirmed_at IS NULL FROM auth.users WHERE id = 'a4000000-0000-4000-8000-000000000005'), TRUE, 'open membership creation does not require or change email verification');
SELECT is((SELECT photo_storage_path FROM public.profiles WHERE id = 'a4000000-0000-4000-8000-000000000005'), 'members/a4000000-0000-4000-8000-000000000005/profile.jpg', 'photo registration records only the private storage path');
SELECT is((SELECT institution_name FROM public.profiles WHERE id = 'a4000000-0000-4000-8000-000000000005'), 'Test University', 'photo registration stores the optional institution name');
SELECT is((SELECT phone FROM public.profiles WHERE id = 'a4000000-0000-4000-8000-000000000005'), '08012345678', 'photo registration stores the submitted contact number');
SELECT is((SELECT course_of_study FROM public.profiles WHERE id = 'a4000000-0000-4000-8000-000000000005'), 'Computer Science', 'photo registration stores the student course');
SELECT is((SELECT study_level FROM public.profiles WHERE id = 'a4000000-0000-4000-8000-000000000005'), '300 level', 'photo registration stores the student level');
SET LOCAL ROLE service_role;

SELECT set_config('test.a4a.card_membership_id', result.membership_id::TEXT, TRUE),
       set_config('test.a4a.card_number', result.membership_number, TRUE),
       set_config('test.a4a.card_id', result.id_card_id::TEXT, TRUE),
       set_config('test.a4a.card_token', result.verification_token, TRUE)
FROM public.create_verified_membership_with_card(
  'a4000000-0000-4000-8000-000000000006', 'card.member@example.test', 'Card', NULL, 'Member',
  'Kano', 'Database test LGA', 'KN', (SELECT id FROM public.organisational_units WHERE code = 'ST-KN'),
  'test-v1', repeat('f', 64), TRUE
) AS result;
SELECT ok(current_setting('test.a4a.card_number') ~ '^A4A-[0-9]{4}-KN-[0-9]{6,}$', 'verified registration allocates a membership number');
SELECT is((SELECT status::TEXT FROM public.memberships WHERE id = current_setting('test.a4a.card_membership_id')::UUID), 'active', 'verified email creates an active membership');
SELECT is((SELECT phone::TEXT FROM public.profiles WHERE id = 'a4000000-0000-4000-8000-000000000006'), NULL::TEXT, 'registration does not collect an unverified phone number');
SELECT is((SELECT status::TEXT FROM public.id_cards WHERE id = current_setting('test.a4a.card_id')::UUID), 'active', 'membership transaction creates an active ID-card record');
SELECT is((SELECT status FROM public.card_generation_jobs WHERE id_card_id = current_setting('test.a4a.card_id')::UUID), 'pending', 'membership transaction enqueues card generation');
SELECT ok(public.claim_card_generation_job(current_setting('test.a4a.card_id')::UUID), 'card-generation job can be claimed');
SELECT ok(NOT public.claim_card_generation_job(current_setting('test.a4a.card_id')::UUID), 'an active card-generation lease prevents duplicate work');
UPDATE public.card_generation_jobs SET status = 'failed', last_error_code = 'test_failure' WHERE id_card_id = current_setting('test.a4a.card_id')::UUID;
SELECT ok(public.claim_card_generation_job(current_setting('test.a4a.card_id')::UUID), 'a failed card-generation job can be retried');
SELECT is((SELECT attempts FROM public.card_generation_jobs WHERE id_card_id = current_setting('test.a4a.card_id')::UUID), 2, 'card-generation retry count is recorded');
SELECT ok(public.consume_registration_rate_limit(ARRAY[repeat('a', 64)], 2, 3600), 'rate limiter allows requests under the limit');
SELECT ok(public.consume_registration_rate_limit(ARRAY[repeat('a', 64)], 2, 3600), 'rate limiter allows the final request in its window');
SELECT ok(NOT public.consume_registration_rate_limit(ARRAY[repeat('a', 64)], 2, 3600), 'rate limiter rejects requests over the limit');
SELECT is((SELECT membership_number FROM public.create_verified_membership_with_card(
  'a4000000-0000-4000-8000-000000000006', 'card.member@example.test', 'Card', NULL, 'Member',
  'Kano', 'Database test LGA', 'KN', (SELECT id FROM public.organisational_units WHERE code = 'ST-KN'),
  'test-v1', repeat('f', 64), TRUE
)), current_setting('test.a4a.card_number'), 'concurrent-safe retry returns the same membership number');
SELECT is((SELECT verification_token::TEXT FROM public.id_cards WHERE id = current_setting('test.a4a.card_id')::UUID), current_setting('test.a4a.card_token'), 'retry preserves the original opaque card token');
SELECT set_config('test.a4a.replacement_card_id', result.id_card_id::TEXT, TRUE),
       set_config('test.a4a.replacement_card_token', result.verification_token, TRUE)
FROM public.replace_membership_card('a4000000-0000-4000-8000-000000000006', current_setting('test.a4a.card_membership_id')::UUID) AS result;
SELECT ok(current_setting('test.a4a.replacement_card_id') <> current_setting('test.a4a.card_id'), 'card replacement issues a new version');
SELECT is((SELECT status::TEXT FROM public.id_cards WHERE id = current_setting('test.a4a.card_id')::UUID), 'replaced', 'previous card is revoked from active verification');
SELECT is((SELECT status FROM public.card_generation_jobs WHERE id_card_id = current_setting('test.a4a.replacement_card_id')::UUID), 'pending', 'replacement card has its own retryable generation job');
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'a4000000-0000-4000-8000-000000000006', TRUE);
SELECT set_config('request.jwt.claim.role', 'authenticated', TRUE);
SELECT set_config('request.jwt.claims', '{"sub":"a4000000-0000-4000-8000-000000000006","role":"authenticated"}', TRUE);
SELECT throws_ok(
  $$SELECT * FROM public.create_verified_membership_with_card('a4000000-0000-4000-8000-000000000006', 'card.member@example.test', 'Card', NULL, 'Member', 'Kano', 'Database test LGA', 'KN', (SELECT id FROM public.organisational_units WHERE code = 'ST-KN'), 'test-v1', repeat('f', 64), TRUE)$$,
  '42501', NULL, 'authenticated users cannot call the privileged verified membership transaction'
);
RESET ROLE;
SET LOCAL ROLE service_role;
SELECT set_config('request.jwt.claim.role', 'service_role', TRUE);
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', TRUE);

SELECT * FROM finish();
ROLLBACK;
