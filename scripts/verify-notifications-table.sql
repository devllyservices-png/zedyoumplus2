-- Verify notifications table structure and permissions

-- Check if table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'notifications';

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'notifications';

-- Test insert (replace with actual user ID)
-- INSERT INTO notifications (user_id, title_ar, message_ar, type) 
-- VALUES ('your-user-id-here', 'Test', 'Test message', 'system');

-- Check recent notifications
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- Check notification counts by type
SELECT type, COUNT(*) as count 
FROM notifications 
GROUP BY type;

-- Check unread notifications
SELECT COUNT(*) as unread_count 
FROM notifications 
WHERE is_read = false;
