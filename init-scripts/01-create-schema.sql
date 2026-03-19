-- Create custom schema for the application
CREATE SCHEMA IF NOT EXISTS learnlore;

-- Grant usage on schema to the app user
GRANT USAGE ON SCHEMA learnlore TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA learnlore TO postgres;
