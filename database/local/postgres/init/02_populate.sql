BEGIN;

-- ===== Roles =====
INSERT INTO "Role" ("id", "name") VALUES
                                      (1, 'Owner'),
                                      (2, 'Editor'),
                                      (3, 'Viewer');

-- ===== Users =====
INSERT INTO "User" ("id", "userName", "email", "passwordHash", "isEmailVerified", "twoFaMethod", "twoFaSecret", "createdAt")
VALUES
    (1, 'nita_dev',     'nita@example.com',      crypt('Password123!', gen_salt('bf', 12)), TRUE,  'email', NULL, CURRENT_TIMESTAMP),
    (2, 'sangyeon_ggl', 'sangyeon@gmail.com',    NULL,                                        TRUE,  NULL,   NULL, CURRENT_TIMESTAMP),
    (3, 'miya_mslive',  'miya@outlook.com',      NULL,                                        TRUE,  NULL,   NULL, CURRENT_TIMESTAMP),
    (4, 'es_linkedin',  'es@linkedin.com',       NULL,                                        TRUE,  NULL,   NULL, CURRENT_TIMESTAMP),
    (5, 'army',         'army@example.com',      crypt('Password123!', gen_salt('bf', 12)),  FALSE, 'totp', 'JBSWY3DPEHPK3PXP', CURRENT_TIMESTAMP);

-- ===== Email Verification Tokens =====
INSERT INTO "EmailVerificationToken"
("tokenHash", "deviceId", "createdAt", "expiresAt", "usedAt", "userId")
VALUES
    (encode(digest('verify-army-1', 'sha256'), 'hex'), 'dev-iphone-army',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 day',  NULL,  5),
    (encode(digest('verify-nita-1', 'sha256'), 'hex'), 'dev-laptop-nita', CURRENT_TIMESTAMP - INTERVAL '2 days',
     CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day', 1);

-- ===== Two-Factor Challenges =====
INSERT INTO "TwoFaChallenge"
("tokenHash", "userId", "action", "method", "secret", "codeHash", "createdAt", "expiresAt", "verifiedAt", "usedAt")
VALUES
    (encode(digest('tfa-nita-login-1', 'sha256'), 'hex'), 1, 'login',       'email', NULL,
     encode(digest('123456', 'sha256'), 'hex'), CURRENT_TIMESTAMP - INTERVAL '5 minutes',
     CURRENT_TIMESTAMP + INTERVAL '5 minutes', CURRENT_TIMESTAMP - INTERVAL '3 minutes', CURRENT_TIMESTAMP - INTERVAL '2 minutes'),
    (encode(digest('tfa-sy-enable-1', 'sha256'), 'hex'),  2, 'enable2fa',   'totp',  'NB2W45DFOIZA====',
     NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 minutes', NULL, NULL),
    (encode(digest('tfa-army-recovery', 'sha256'), 'hex'), 5, 'passwordRecovery', 'email', NULL,
     encode(digest('654321', 'sha256'), 'hex'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '15 minutes', NULL, NULL);

-- ===== Refresh Tokens =====
INSERT INTO "RefreshToken"
("tokenHash", "deviceId", "oauthProvider", "createdAt", "expiresAt", "userId")
VALUES
    (encode(digest('rt-nita-laptop',    'sha256'), 'hex'), 'device-laptop-nita', NULL,    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 1),
    (encode(digest('rt-nita-phone',     'sha256'), 'hex'), 'device-phone-nita',  'google', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 1),
    (encode(digest('rt-sy-mac',         'sha256'), 'hex'), 'device-mac-sy',      NULL,    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '45 days', 2),
    (encode(digest('rt-miya-surface',   'sha256'), 'hex'), 'device-surface-miya',NULL,    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '10 days', 3),
    (encode(digest('rt-es-work',        'sha256'), 'hex'), 'device-work-es',     NULL,    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '20 days', 4);

-- ===== Projects =====
INSERT INTO "Project"
("id", "createdAt", "openedAt", "lastSavedAt", "s3Url", "projectJson", "userCurrentlyEditing", "creatorId")
VALUES
    (1, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days',
     CURRENT_TIMESTAMP - INTERVAL '1 day',  's3://mock-bucket/projects/1/project.json',
     '{"name":"Demo One","layers":[]}',     FALSE, 1),
    (2, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '12 hours',
     CURRENT_TIMESTAMP - INTERVAL '1 hour', 's3://mock-bucket/projects/2/project.json',
     '{"name":"Demo Two","layers":[{"id":1,"type":"image"}]}', TRUE, 1),
    (3, CURRENT_TIMESTAMP - INTERVAL '3 days', NULL, NULL,
     's3://mock-bucket/projects/3/project.json',
     '{"name":"Club Poster","layers":[{"id":99,"type":"text"}]}', FALSE, 3);

-- ===== Collaborations =====
INSERT INTO "Collaboration" ("id", "createdAt", "userId", "projectId") VALUES
                                                                           (1, CURRENT_TIMESTAMP - INTERVAL '2 days', 1, 1),
                                                                           (2, CURRENT_TIMESTAMP - INTERVAL '36 hours', 2, 1),
                                                                           (3, CURRENT_TIMESTAMP - INTERVAL '30 hours', 4, 1),
                                                                           (4, CURRENT_TIMESTAMP - INTERVAL '22 hours', 1, 2),
                                                                           (5, CURRENT_TIMESTAMP - INTERVAL '3 days',  3, 3),
                                                                           (6, CURRENT_TIMESTAMP - INTERVAL '2 days',  5, 3);

-- ===== Assign Roles =====
INSERT INTO "_CollaborationToRole" ("A","B") VALUES
                                                 (1, 1),
                                                 (2, 2),
                                                 (3, 3),
                                                 (4, 1),
                                                 (5, 1),
                                                 (6, 3);

-- ===== Audit Logs =====
INSERT INTO "AuditLog" ("eventType", "ipAddress", "userAgent", "createdAt", "userId") VALUES
                                                                                          ('USER_REGISTERED', '203.0.113.10', 'Mozilla/5.0', CURRENT_TIMESTAMP - INTERVAL '3 days', 1),
                                                                                          ('LOGIN_SUCCESS',   '203.0.113.10', 'Mozilla/5.0', CURRENT_TIMESTAMP - INTERVAL '2 days', 1),
                                                                                          ('LOGIN_SUCCESS',   '198.51.100.21','Chrome/126',  CURRENT_TIMESTAMP - INTERVAL '36 hours', 2),
                                                                                          ('TOKEN_REFRESH',   '198.51.100.21','Chrome/126',  CURRENT_TIMESTAMP - INTERVAL '35 hours', 2),
                                                                                          ('PROJECT_OPENED',  '192.0.2.55',   'Edge/123',    CURRENT_TIMESTAMP - INTERVAL '22 hours', 1),
                                                                                          ('PROJECT_SHARED',  '192.0.2.55',   'Edge/123',    CURRENT_TIMESTAMP - INTERVAL '20 hours', 1),
                                                                                          ('LOGIN_SUCCESS',   '203.0.113.77', 'Firefox/141', CURRENT_TIMESTAMP - INTERVAL '19 hours', 3);

COMMIT;
