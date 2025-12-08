-- PostgreSQL schema for association-website
-- Run as a superuser or a role that can create extensions and types

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE user_role AS ENUM ('admin','user');
CREATE TYPE plan_period AS ENUM ('monthly','yearly');
CREATE TYPE content_status AS ENUM ('draft','published','archived');
CREATE TYPE payment_type AS ENUM ('membership','donation');
CREATE TYPE payment_status AS ENUM ('pending','completed','failed','refunded');

-- Users
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL DEFAULT 'user',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Members
CREATE TABLE members (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    member_number   TEXT NOT NULL UNIQUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plans
CREATE TABLE plans (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    period          plan_period NOT NULL,
    amount          NUMERIC(12,2) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pages
CREATE TABLE pages (
    id              SERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    content         TEXT,
    seo             JSONB,
    status          content_status NOT NULL DEFAULT 'draft',
    created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Menus
CREATE TABLE menus (
    id              SERIAL PRIMARY KEY,
    label           TEXT NOT NULL,
    url             TEXT,
    page_id         INTEGER REFERENCES pages(id) ON DELETE SET NULL,
    parent_id       INTEGER REFERENCES menus(id) ON DELETE CASCADE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    visible         BOOLEAN NOT NULL DEFAULT true
);

-- Media
CREATE TABLE media (
    id              SERIAL PRIMARY KEY,
    filename        TEXT NOT NULL,
    path            TEXT NOT NULL,
    tags            TEXT[],
    uploaded_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Posts
CREATE TABLE posts (
    id              SERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    excerpt         TEXT,
    content         TEXT,
    cover_media_id  INTEGER REFERENCES media(id) ON DELETE SET NULL,
    video_url       TEXT,
    status          content_status NOT NULL DEFAULT 'draft',
    scheduled_at    TIMESTAMP WITH TIME ZONE,
    tags            TEXT[],
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE payments (
    id              SERIAL PRIMARY KEY,
    member_id       INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    type            payment_type NOT NULL,
    amount          NUMERIC(12,2) NOT NULL,
    status          payment_status NOT NULL DEFAULT 'pending',
    paid_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes           TEXT
);

-- Expenses
CREATE TABLE expenses (
    id              SERIAL PRIMARY KEY,
    category        TEXT NOT NULL,
    amount          NUMERIC(12,2) NOT NULL,
    paid_to         TEXT,
    paid_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes           TEXT
);

-- Social Accounts
CREATE TABLE social_accounts (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    platform        TEXT NOT NULL,
    username        TEXT NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id              SERIAL PRIMARY KEY,
    actor_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,
    record_type     TEXT,
    record_id       INTEGER,
    changes         JSONB,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_members_member_number ON members(member_number);

-- Trigger to keep updated_at up to date
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- End of schema
