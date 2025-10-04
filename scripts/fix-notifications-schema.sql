-- Fix notifications table schema to use UUID instead of INTEGER

-- First, drop the existing foreign key constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Change the user_id column from INTEGER to UUID
ALTER TABLE notifications ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;

-- Re-add the foreign key constraint with correct data type
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications' AND column_name = 'user_id';

-- Test the foreign key constraint
SELECT 
    n.id,
    n.user_id,
    n.title_ar,
    n.type,
    n.created_at,
    u.email
FROM notifications n
JOIN users u ON n.user_id = u.id
LIMIT 5;
