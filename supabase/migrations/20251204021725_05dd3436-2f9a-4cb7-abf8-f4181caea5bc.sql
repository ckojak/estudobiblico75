-- Drop the old check constraint and add new one with 'estudo' option
ALTER TABLE books DROP CONSTRAINT IF EXISTS books_testament_check;
ALTER TABLE books ADD CONSTRAINT books_testament_check CHECK (testament IN ('antigo', 'novo', 'estudo'));