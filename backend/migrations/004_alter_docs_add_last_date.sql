-- backend/migrations/005_add_last_date_to_docs.sql
ALTER TABLE docs ADD COLUMN last_date DATE DEFAULT NULL;