CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE meetings (
    id BIGSERIAL PRIMARY KEY,

    title TEXT NOT NULL,

    room_name TEXT NOT NULL UNIQUE,

    creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    max_participants INT NOT NULL,

    meeting_duration_minutes INT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    ended_at TIMESTAMP
);
CREATE TABLE plans (
    id BIGSERIAL PRIMARY KEY,

    code TEXT NOT NULL UNIQUE,

    name TEXT NOT NULL,

    max_participants INT NOT NULL,

    meeting_duration_minutes INT,

    price INT NOT NULL DEFAULT 0
);
INSERT INTO plans (
    code,
    name,
    max_participants,
    meeting_duration_minutes,
    price
)
VALUES
(
    'FREE',
    'Free',
    5,
    30,
    0
),
(
    'PRO',
    'Pro',
    30,
    NULL,
   10
);

CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    plan_id BIGINT NOT NULL REFERENCES plans(id),

    started_at TIMESTAMP NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMP
);