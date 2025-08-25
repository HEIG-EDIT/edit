-- 01_init.sql
-- Schema for mock database matching the provided Prisma models

BEGIN;

-- Optional but handy if you want bcrypt-style hashes via crypt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop in dependency order (many-to-many table first)
DROP TABLE IF EXISTS "_CollaborationToRole" CASCADE;
DROP TABLE IF EXISTS "Collaboration" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "TwoFaChallenge" CASCADE;
DROP TABLE IF EXISTS "EmailVerificationToken" CASCADE;
DROP TABLE IF EXISTS "RefreshToken" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- =========================
-- User
-- =========================
CREATE TABLE "User" (
                        "id"               SERIAL PRIMARY KEY,
                        "userName"         TEXT NOT NULL UNIQUE,
                        "email"            TEXT NOT NULL UNIQUE,
                        "passwordHash"     TEXT,
                        "isEmailVerified"  BOOLEAN NOT NULL,
                        "twoFaMethod"      TEXT,
                        "twoFaSecret"      TEXT,
                        "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        "updatedAt"        TIMESTAMP(3)
);

-- =========================
-- RefreshToken
-- =========================
CREATE TABLE "RefreshToken" (
                                "id"             SERIAL PRIMARY KEY,
                                "tokenHash"      TEXT NOT NULL UNIQUE,
                                "deviceId"       TEXT NOT NULL,
                                "oauthProvider"  TEXT,
                                "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                "expiresAt"      TIMESTAMP(3) NOT NULL,
                                "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                "userId"         INTEGER NOT NULL,
                                CONSTRAINT "RefreshToken_userId_fkey"
                                    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
                                CONSTRAINT "RefreshToken_user_device_unique"
                                    UNIQUE ("userId","deviceId")
);

CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- =========================
-- EmailVerificationToken
-- =========================
CREATE TABLE "EmailVerificationToken" (
                                          "id"         SERIAL PRIMARY KEY,
                                          "tokenHash"  TEXT NOT NULL UNIQUE,
                                          "deviceId"   TEXT UNIQUE,
                                          "createdAt"  TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                                          "expiresAt"  TIMESTAMP(3) NOT NULL,
                                          "usedAt"     TIMESTAMP(3),
                                          "userId"     INTEGER UNIQUE,
                                          CONSTRAINT "EmailVerificationToken_userId_fkey"
                                              FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- =========================
-- TwoFaChallenge
-- =========================
CREATE TABLE "TwoFaChallenge" (
                                  "id"         SERIAL PRIMARY KEY,
                                  "tokenHash"  TEXT NOT NULL UNIQUE,
                                  "userId"     INTEGER NOT NULL,
                                  "action"     TEXT NOT NULL,  -- 'enable2fa' | 'disable2fa' | 'login' | 'changePassword' | 'passwordRecovery'
                                  "method"     TEXT NOT NULL,  -- 'totp' | 'email'
                                  "secret"     TEXT,
                                  "codeHash"   TEXT,
                                  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  "expiresAt"  TIMESTAMP(3) NOT NULL,
                                  "verifiedAt" TIMESTAMP(3),
                                  "usedAt"     TIMESTAMP(3),
                                  CONSTRAINT "TwoFaChallenge_userId_fkey"
                                      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "TwoFaChallenge_userId_idx" ON "TwoFaChallenge"("userId");

-- =========================
-- AuditLog
-- =========================
CREATE TABLE "AuditLog" (
                            "id"         SERIAL PRIMARY KEY,
                            "eventType"  TEXT NOT NULL,
                            "ipAddress"  TEXT,
                            "userAgent"  TEXT,
                            "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            "userId"     INTEGER NOT NULL,
                            CONSTRAINT "AuditLog_userId_fkey"
                                FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- =========================
-- Project
-- =========================
CREATE TABLE "Project" (
                           "id"                   SERIAL PRIMARY KEY,
                           "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           "openedAt"             TIMESTAMP(3),
                           "lastSavedAt"          TIMESTAMP(3),
                           "s3Url"                TEXT NOT NULL,
                           "projectJson"          TEXT NOT NULL,
                           "userCurrentlyEditing" BOOLEAN NOT NULL DEFAULT FALSE,
                           "creatorId"            INTEGER NOT NULL,
                           CONSTRAINT "Project_creatorId_fkey"
                               FOREIGN KEY ("creatorId") REFERENCES "User"("id")
);

-- =========================
-- Role
-- =========================
CREATE TABLE "Role" (
                        "id"   SERIAL PRIMARY KEY,
                        "name" TEXT NOT NULL
);

-- =========================
-- Collaboration
-- =========================
CREATE TABLE "Collaboration" (
                                 "id"         SERIAL PRIMARY KEY,
                                 "createdAt"  TIMESTAMP(3) NOT NULL,
                                 "userId"     INTEGER NOT NULL,
                                 "projectId"  INTEGER NOT NULL,
                                 CONSTRAINT "Collaboration_userId_fkey"
                                     FOREIGN KEY ("userId") REFERENCES "User"("id"),
                                 CONSTRAINT "Collaboration_projectId_fkey"
                                     FOREIGN KEY ("projectId") REFERENCES "Project"("id")
);

-- =========================
-- Many-to-many join: Collaboration.roles <-> Role
-- Prisma's implicit m:n typically looks like _ModelAToModelB with A first
-- Here: _CollaborationToRole with columns "A" (Collaboration.id) and "B" (Role.id)
-- =========================
CREATE TABLE "_CollaborationToRole" (
                                        "A" INTEGER NOT NULL,
                                        "B" INTEGER NOT NULL,
                                        CONSTRAINT "_CollaborationToRole_A_fkey"
                                            FOREIGN KEY ("A") REFERENCES "Collaboration"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                                        CONSTRAINT "_CollaborationToRole_B_fkey"
                                            FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique pair + helper index on B (mirrors Prisma migrations)
CREATE UNIQUE INDEX "_CollaborationToRole_AB_unique" ON "_CollaborationToRole"("A","B");
CREATE INDEX "_CollaborationToRole_B_index" ON "_CollaborationToRole"("B");

COMMIT;
