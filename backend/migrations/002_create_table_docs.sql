CREATE TABLE IF NOT EXISTS docs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_key TEXT NOT NULL,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isSummaryGenerated BOOLEAN DEFAULT FALSE,
    conversation_id VARCHAR(255) DEFAULT NULL,
    last_date DATE DEFAULT NULL,
    reminder_sent BOOLEAN DEFAULT FALSE,
    department supported_department DEFAULT NULL
);
