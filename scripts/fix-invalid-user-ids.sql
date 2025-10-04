-- Script to identify and fix orders with invalid user IDs

-- 1. Check for orders with invalid buyer_id
SELECT 
    o.id as order_id,
    o.buyer_id,
    o.seller_id,
    o.status,
    o.created_at,
    CASE 
        WHEN b.id IS NULL THEN 'INVALID BUYER'
        ELSE 'VALID BUYER'
    END as buyer_status,
    CASE 
        WHEN s.id IS NULL THEN 'INVALID SELLER'
        ELSE 'VALID SELLER'
    END as seller_status
FROM orders o
LEFT JOIN users b ON o.buyer_id = b.id
LEFT JOIN users s ON o.seller_id = s.id
WHERE b.id IS NULL OR s.id IS NULL
ORDER BY o.created_at DESC;

-- 2. Count invalid orders
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN b.id IS NULL THEN 1 END) as invalid_buyer_count,
    COUNT(CASE WHEN s.id IS NULL THEN 1 END) as invalid_seller_count
FROM orders o
LEFT JOIN users b ON o.buyer_id = b.id
LEFT JOIN users s ON o.seller_id = s.id;

-- 3. Show all users in the system
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- 4. Show recent orders with valid user IDs
SELECT 
    o.id,
    o.buyer_id,
    o.seller_id,
    o.status,
    o.amount,
    o.created_at,
    b.email as buyer_email,
    s.email as seller_email
FROM orders o
JOIN users b ON o.buyer_id = b.id
JOIN users s ON o.seller_id = s.id
ORDER BY o.created_at DESC
LIMIT 10;

-- 5. If you need to delete invalid orders (BE CAREFUL!)
-- DELETE FROM orders 
-- WHERE buyer_id NOT IN (SELECT id FROM users) 
--    OR seller_id NOT IN (SELECT id FROM users);

-- 6. Check notifications table for invalid user_ids
SELECT 
    n.id,
    n.user_id,
    n.title_ar,
    n.type,
    n.created_at,
    CASE 
        WHEN u.id IS NULL THEN 'INVALID USER'
        ELSE 'VALID USER'
    END as user_status
FROM notifications n
LEFT JOIN users u ON n.user_id = u.id
WHERE u.id IS NULL
ORDER BY n.created_at DESC;
