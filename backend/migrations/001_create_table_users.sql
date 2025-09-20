CREATE TYPE supported_department AS ENUM ('Operations Department', 'Engineering & Maintenance Department', 'Procurement & Stores Department', 'Safety & Regulatory Compliance Department', 'Human Resources (HR)','Finance & Accounts Department','Executive / Board of Directors');
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(200), -- nullable, since you dropped NOT NULL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  provider VARCHAR(20) DEFAULT 'manual',
  is_valid BOOLEAN DEFAULT false NOT NULL,
  reset_password_token TEXT,
  reset_password_expires TIMESTAMP,
  department supported_department DEFAULT NULL-- department the user belongs to
);

