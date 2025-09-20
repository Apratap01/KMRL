CREATE TYPE supported_language AS ENUM ('English', 'Hindi', 'Kannada', 'Bengali', 'Telugu','Malayalam','Tamil');
CREATE TABLE summaries (
    id SERIAL PRIMARY KEY,
    doc_id INT REFERENCES docs(id) ON DELETE CASCADE,
    language supported_language NOT NULL, 
    summary JSONB NOT NULL, 
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
