CREATE TABLE IF NOT EXISTS department_docs (
    id SERIAL PRIMARY KEY,
    doc_id INT REFERENCES docs(id) ON DELETE CASCADE,
    department supported_department NOT NULL,
    assigned_by INT REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (doc_id, department)
);
