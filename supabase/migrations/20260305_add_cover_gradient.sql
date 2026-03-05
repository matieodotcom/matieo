-- Add cover_gradient column to memorials
-- Stores the gradient key when no cover photo is uploaded (e.g. 'blue', 'sunset', 'forest')
-- NULL means a cover photo is present and gradient is not used.

ALTER TABLE memorials ADD COLUMN IF NOT EXISTS cover_gradient text;
