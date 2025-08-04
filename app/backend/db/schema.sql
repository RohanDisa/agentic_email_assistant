-- app/db/schema.sql

CREATE TABLE threads (
    id SERIAL PRIMARY KEY,
    thread_id TEXT UNIQUE NOT NULL,
    subject TEXT,
    snippet TEXT,
    history_id TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    message_id TEXT UNIQUE NOT NULL,
    thread_id TEXT NOT NULL,
    sender TEXT,
    recipient TEXT,
    subject TEXT,
    body TEXT,
    sent_at TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(thread_id)
);
