-- Rename the stakeholders table to connections (terminology change).
-- Preserves all existing rows and columns; only the table name changes.
ALTER TABLE stakeholders RENAME TO connections;
