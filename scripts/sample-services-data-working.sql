-- Sample Services Data for ZedyoumPlus (Working passwords)
-- This script adds sample data for testing the services system

-- First, let's add some sample users (sellers) with working password hashes
-- Password for all test users: "password123"
-- This hash was generated and tested to work with bcrypt
INSERT INTO public.users (id, email, password_hash, role, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'seller1@example.com', '$2b$10$MnoRuiSJGoSsqhdVwdkJP.9byuqKe.m4yXSFPUn9NqIJTZnJb5/1C', 'seller', now()),
('22222222-2222-2222-2222-222222222222', 'seller2@example.com', '$2b$10$MnoRuiSJGoSsqhdVwdkJP.9byuqKe.m4yXSFPUn9NqIJTZnJb5/1C', 'seller', now()),
('33333333-3333-3333-3333-333333333333', 'buyer1@example.com', '$2b$10$MnoRuiSJGoSsqhdVwdkJP.9byuqKe.m4yXSFPUn9NqIJTZnJb5/1C', 'buyer', now())
ON CONFLICT (email) DO NOTHING;

-- Add profiles for the sellers
INSERT INTO public.profiles (user_id, display_name, bio, avatar_url, location, phone, is_verified, rating, completed_orders, member_since, response_time, support_rate, languages) VALUES
('11111111-1111-1111-1111-111111111111', 'أحمد المطور', 'مطور مواقع محترف مع 5 سنوات من الخبرة في تطوير المواقع والتطبيقات', '/images/avatar-fallback.svg', 'الرياض، السعودية', '+966501234567', true, 4.8, 150, '2022-01-15', 'أقل من ساعة', '100%', ARRAY['العربية', 'الإنجليزية']),
('22222222-2222-2222-2222-222222222222', 'فاطمة المصممة', 'مصممة جرافيك محترفة متخصصة في تصميم الشعارات والهويات البصرية', '/images/avatar-fallback.svg', 'دبي، الإمارات', '+971501234567', true, 4.9, 200, '2021-06-10', 'أقل من ساعتين', '98%', ARRAY['العربية', 'الإنجليزية', 'الفرنسية'])
ON CONFLICT (user_id) DO NOTHING;

-- Add sample services
INSERT INTO public.services (id, seller_id, title, description, category, tags, rating, total_orders, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'تطوير موقع إلكتروني احترافي', 'سأقوم بتطوير موقع إلكتروني احترافي ومتجاوب باستخدام أحدث التقنيات مثل React و Node.js', 'web-development', ARRAY['تطوير المواقع', 'React', 'Node.js', 'متجاوب'], 4.8, 25, now() - interval '30 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'تطبيق جوال iOS و Android', 'تطوير تطبيق جوال متكامل لـ iOS و Android باستخدام React Native', 'mobile-development', ARRAY['تطبيقات الجوال', 'React Native', 'iOS', 'Android'], 4.7, 18, now() - interval '20 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'تصميم شعار احترافي', 'سأصمم لك شعاراً احترافياً ومميزاً يعبر عن هوية علامتك التجارية', 'design', ARRAY['تصميم الشعارات', 'هوية بصرية', 'Adobe Illustrator', 'إبداع'], 4.9, 45, now() - interval '15 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'تصميم بطاقة عمل أنيقة', 'تصميم بطاقة عمل أنيقة ومهنية تناسب مجال عملك', 'design', ARRAY['بطاقات العمل', 'تصميم', 'طباعة', 'مهنية'], 4.6, 32, now() - interval '10 days')
ON CONFLICT (id) DO NOTHING;

-- Add service images
INSERT INTO public.service_images (service_id, image_url, is_primary) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800', false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800', true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800', true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800', true)
ON CONFLICT DO NOTHING;

-- Add service packages
INSERT INTO public.service_packages (service_id, name, price, delivery_time, revisions, features) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'الحزمة الأساسية', 500.00, '7 أيام', 'مراجعتان', ARRAY['تصميم متجاوب', 'صفحة رئيسية', 'صفحة من نحن', 'صفحة اتصل بنا']),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'الحزمة المتقدمة', 800.00, '10 أيام', '3 مراجعات', ARRAY['تصميم متجاوب', '5 صفحات', 'نظام إدارة المحتوى', 'تحسين محركات البحث', 'شهادة SSL']),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'الحزمة المميزة', 1200.00, '14 يوم', '5 مراجعات', ARRAY['تصميم متجاوب', '10 صفحات', 'نظام إدارة المحتوى', 'تحسين محركات البحث', 'شهادة SSL', 'تطبيق جوال', 'دعم لمدة 3 أشهر']),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'تطبيق بسيط', 1000.00, '14 يوم', 'مراجعتان', ARRAY['تصميم UI/UX', 'تطبيق iOS', 'تطبيق Android', 'قاعدة بيانات']),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'تطبيق متقدم', 2000.00, '21 يوم', '3 مراجعات', ARRAY['تصميم UI/UX', 'تطبيق iOS', 'تطبيق Android', 'قاعدة بيانات', 'API', 'إشعارات']),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 'شعار بسيط', 50.00, '3 أيام', 'مراجعتان', ARRAY['3 تصاميم أولية', 'ملف PNG', 'ملف JPG', 'ملف SVG']),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'شعار احترافي', 100.00, '5 أيام', '3 مراجعات', ARRAY['5 تصاميم أولية', 'ملف PNG', 'ملف JPG', 'ملف SVG', 'ملف AI', 'ملف EPS']),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 'تصميم بسيط', 25.00, '2 يوم', 'مراجعة واحدة', ARRAY['تصميم واحد', 'ملف PDF', 'ملف JPG', 'ملف PNG']),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'تصميم احترافي', 50.00, '3 أيام', 'مراجعتان', ARRAY['تصميمين', 'ملف PDF', 'ملف JPG', 'ملف PNG', 'ملف AI'])
ON CONFLICT DO NOTHING;

-- Add service FAQ
INSERT INTO public.service_faq (service_id, question, answer) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ما هي التقنيات المستخدمة في التطوير؟', 'أستخدم أحدث التقنيات مثل React.js للواجهة الأمامية، Node.js للخادم، وقاعدة بيانات MongoDB أو PostgreSQL.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'هل الموقع سيكون متجاوباً مع الجوال؟', 'نعم، جميع المواقع التي أطورها متجاوبة بالكامل مع جميع الأجهزة والشاشات.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ما هو وقت التسليم المتوقع؟', 'يختلف وقت التسليم حسب الحزمة المختارة، من 7 أيام للحزمة الأساسية إلى 14 يوم للحزمة المميزة.'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'هل التطبيق سيعمل على iOS و Android؟', 'نعم، سأطور التطبيق باستخدام React Native ليعمل على كلا النظامين.'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'هل يمكنني إضافة ميزات جديدة لاحقاً؟', 'نعم، يمكنني إضافة ميزات جديدة مقابل رسوم إضافية حسب التعقيد.'),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 'كم عدد التصاميم الأولية التي سأحصل عليها؟', 'ستحصل على 3-5 تصاميم أولية حسب الحزمة المختارة.'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ما هي صيغ الملفات المتوفرة؟', 'ستحصل على الملفات بصيغ PNG، JPG، SVG، وملفات المصدر AI و EPS.'),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 'هل يمكنني طلب تعديلات على التصميم؟', 'نعم، يمكنك طلب تعديلات حسب عدد المراجعات المتوفرة في الحزمة المختارة.'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'ما هي صيغ الملفات المتوفرة؟', 'ستحصل على الملفات بصيغ PDF، JPG، PNG، وملف المصدر AI.')
ON CONFLICT DO NOTHING;

-- Add service reviews
INSERT INTO public.service_reviews (service_id, user_id, rating, comment, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 5, 'عمل ممتاز! الموقع تم تسليمه في الوقت المحدد وبجودة عالية. أنصح به بشدة.', now() - interval '5 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 4, 'تطوير احترافي، التواصل كان ممتازاً. سأطلب منه مرة أخرى.', now() - interval '10 days'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 5, 'تطبيق رائع! يعمل بسلاسة على جميع الأجهزة. شكراً لك.', now() - interval '3 days'),

('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 5, 'تصميم الشعار كان أكثر من رائع! إبداع حقيقي.', now() - interval '7 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 4, 'شعار جميل ومهني. التعديلات تمت بسرعة.', now() - interval '12 days'),

('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 4, 'بطاقة عمل أنيقة ومهنية. أنصح به.', now() - interval '2 days')
ON CONFLICT DO NOTHING;
