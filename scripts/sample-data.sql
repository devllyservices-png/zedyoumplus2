-- Sample data for testing the Algerian E-commerce Platform

-- Insert sample categories
INSERT INTO categories (name_ar, name_en, slug, description_ar, description_en, icon) VALUES
('التصميم والجرافيك', 'Design & Graphics', 'design', 'خدمات التصميم الجرافيكي والهوية البصرية', 'Graphic design and visual identity services', 'palette'),
('البرمجة والتطوير', 'Programming & Development', 'programming', 'تطوير المواقع والتطبيقات', 'Web and app development services', 'code'),
('التسويق الرقمي', 'Digital Marketing', 'marketing', 'خدمات التسويق الإلكتروني والسوشيال ميديا', 'Digital marketing and social media services', 'megaphone'),
('الكتابة والترجمة', 'Writing & Translation', 'writing', 'خدمات الكتابة والترجمة المتخصصة', 'Professional writing and translation services', 'pen-tool'),
('المونتاج والفيديو', 'Video & Animation', 'video', 'مونتاج الفيديو والرسوم المتحركة', 'Video editing and animation services', 'video'),
('الأعمال والاستشارات', 'Business & Consulting', 'business', 'الاستشارات التجارية وخدمات الأعمال', 'Business consulting and services', 'briefcase'),
('الموسيقى والصوتيات', 'Music & Audio', 'music', 'خدمات الموسيقى والتسجيل الصوتي', 'Music and audio recording services', 'music');

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, phone, is_seller, is_verified) VALUES
('ahmed.mohamed@example.com', '$2b$10$example_hash', 'أحمد', 'محمد', '+213555123456', true, true),
('fatima.benali@example.com', '$2b$10$example_hash', 'فاطمة', 'بن علي', '+213555234567', true, true),
('youssef.algerian@example.com', '$2b$10$example_hash', 'يوسف', 'الجزائري', '+213555345678', true, false),
('sara.kasmi@example.com', '$2b$10$example_hash', 'سارة', 'قاسمي', '+213555456789', true, true),
('karim.boualam@example.com', '$2b$10$example_hash', 'كريم', 'بوعلام', '+213555567890', true, true),
('nadia.hamdi@example.com', '$2b$10$example_hash', 'نادية', 'حمدي', '+213555678901', true, true);

-- Insert sample services
INSERT INTO services (seller_id, category_id, title_ar, title_en, description_ar, description_en, price, delivery_time, image_url, features_ar, features_en, rating, total_reviews, total_orders) VALUES
(1, 1, 'تصميم شعار احترافي مع هوية بصرية كاملة', 'Professional Logo Design with Complete Brand Identity', 'سأقوم بتصميم شعار احترافي وفريد لعلامتك التجارية مع تقديم الهوية البصرية الكاملة', 'I will design a professional and unique logo for your brand with complete visual identity', 5000.00, 3, '/professional-logo-design.svg', ARRAY['تصميم شعار فريد', 'هوية بصرية كاملة', '3 مراجعات مجانية', 'ملفات عالية الجودة'], ARRAY['Unique logo design', 'Complete visual identity', '3 free revisions', 'High-quality files'], 4.9, 127, 89),
(2, 2, 'تطوير موقع ووردبريس متجاوب ومحسن للسيو', 'Responsive WordPress Website Development with SEO', 'تطوير موقع ووردبريس احترافي متجاوب مع جميع الأجهزة ومحسن لمحركات البحث', 'Professional responsive WordPress website development optimized for search engines', 15000.00, 7, '/wordpress-development.svg', ARRAY['تصميم متجاوب', 'محسن للسيو', 'لوحة تحكم سهلة', 'دعم فني'], ARRAY['Responsive design', 'SEO optimized', 'Easy admin panel', 'Technical support'], 4.8, 89, 67),
(3, 3, 'إدارة حسابات التواصل الاجتماعي لمدة شهر', 'Social Media Management for One Month', 'إدارة شاملة لحساباتك على منصات التواصل الاجتماعي مع إنشاء محتوى جذاب', 'Complete management of your social media accounts with engaging content creation', 8000.00, 1, '/social-media-management.svg', ARRAY['إدارة يومية', 'محتوى جذاب', 'تقارير أسبوعية', 'رد على التعليقات'], ARRAY['Daily management', 'Engaging content', 'Weekly reports', 'Comment responses'], 4.7, 156, 234),
(4, 4, 'كتابة محتوى تسويقي وإعلاني احترافي', 'Professional Marketing and Advertising Content Writing', 'كتابة محتوى تسويقي مقنع وجذاب لموقعك أو حملاتك الإعلانية', 'Persuasive and engaging marketing content for your website or advertising campaigns', 3000.00, 2, '/content-writing.svg', ARRAY['محتوى مقنع', 'بحث عن الكلمات المفتاحية', 'محسن للسيو', 'مراجعة مجانية'], ARRAY['Persuasive content', 'Keyword research', 'SEO optimized', 'Free revision'], 4.9, 203, 178),
(5, 5, 'مونتاج فيديو احترافي مع مؤثرات بصرية', 'Professional Video Editing with Visual Effects', 'مونتاج احترافي لفيديوهاتك مع إضافة المؤثرات البصرية والصوتية', 'Professional editing for your videos with visual and audio effects', 12000.00, 5, '/video-editing.svg', ARRAY['مونتاج احترافي', 'مؤثرات بصرية', 'تصحيح الألوان', 'موسيقى خلفية'], ARRAY['Professional editing', 'Visual effects', 'Color correction', 'Background music'], 4.8, 74, 56),
(6, 4, 'ترجمة نصوص متخصصة عربي-إنجليزي', 'Specialized Arabic-English Translation', 'ترجمة احترافية ودقيقة للنصوص المتخصصة في مختلف المجالات', 'Professional and accurate translation of specialized texts in various fields', 2500.00, 1, '/translation-services.svg', ARRAY['ترجمة دقيقة', 'مراجعة لغوية', 'تسليم سريع', 'سرية تامة'], ARRAY['Accurate translation', 'Language review', 'Fast delivery', 'Complete confidentiality'], 4.9, 312, 445);

-- Insert sample digital products
INSERT INTO digital_products (title_ar, title_en, description_ar, description_en, price, original_price, image_url, features_ar, features_en, badge_ar, badge_en, product_type, stock_quantity, total_sold) VALUES
('اشتراك نتفليكس - شهر واحد', 'Netflix Subscription - One Month', 'احصل على اشتراك نتفليكس لمدة شهر كامل بأفضل الأسعار', 'Get Netflix subscription for a full month at the best prices', 1500.00, 2000.00, '/netflix.svg', ARRAY['تسليم فوري', 'ضمان شهر كامل', 'دعم فني 24/7'], ARRAY['Instant delivery', 'Full month guarantee', '24/7 technical support'], 'الأكثر مبيعًا', 'Best Seller', 'subscription', 50, 234),
('بطاقة شحن بلايستيشن 50$', 'PlayStation Gift Card $50', 'بطاقة شحن أصلية لمتجر بلايستيشن بقيمة 50 دولار', 'Original PlayStation Store gift card worth $50', 8500.00, 9000.00, '/playstation.svg', ARRAY['كود أصلي', 'يعمل في جميع البلدان', 'تسليم خلال دقائق'], ARRAY['Original code', 'Works in all countries', 'Delivery within minutes'], 'عرض محدود', 'Limited Offer', 'gift_card', 25, 156),
('بطاقة شحن إكس بوكس 25$', 'Xbox Gift Card $25', 'بطاقة شحن أصلية لمتجر إكس بوكس بقيمة 25 دولار', 'Original Xbox Store gift card worth $25', 4200.00, 4500.00, '/xbox.svg', ARRAY['متوافق مع Xbox Live', 'صالح لسنة كاملة', 'تفعيل فوري'], ARRAY['Compatible with Xbox Live', 'Valid for full year', 'Instant activation'], 'جديد', 'New', 'gift_card', 30, 89),
('اشتراك سبوتيفاي بريميوم', 'Spotify Premium Subscription', 'اشتراك سبوتيفاي بريميوم للاستماع بدون إعلانات', 'Spotify Premium subscription for ad-free listening', 1200.00, 1500.00, '/spotify.svg', ARRAY['بدون إعلانات', 'جودة عالية', 'تحميل للاستماع بدون إنترنت'], ARRAY['No ads', 'High quality', 'Download for offline listening'], 'توفير 20%', 'Save 20%', 'subscription', 40, 178);

-- Insert sample seller profiles
INSERT INTO seller_profiles (user_id, business_name, bio_ar, bio_en, skills, portfolio_urls, response_time, languages, total_earnings) VALUES
(1, 'استوديو أحمد للتصميم', 'مصمم جرافيك محترف مع خبرة 5 سنوات في تصميم الهويات البصرية', 'Professional graphic designer with 5 years experience in visual identity design', ARRAY['تصميم الشعارات', 'الهوية البصرية', 'التصميم الطباعي'], ARRAY['https://portfolio1.example.com', 'https://behance.net/ahmed'], 2, ARRAY['العربية', 'الإنجليزية'], 125000.00),
(2, 'فاطمة للتطوير', 'مطورة مواقع متخصصة في ووردبريس وتطوير المتاجر الإلكترونية', 'Web developer specialized in WordPress and e-commerce development', ARRAY['WordPress', 'WooCommerce', 'PHP', 'JavaScript'], ARRAY['https://portfolio2.example.com'], 1, ARRAY['العربية', 'الإنجليزية', 'الفرنسية'], 340000.00),
(3, 'يوسف للتسويق الرقمي', 'خبير تسويق رقمي متخصص في إدارة حسابات التواصل الاجتماعي', 'Digital marketing expert specialized in social media management', ARRAY['Facebook Ads', 'Instagram Marketing', 'Content Creation'], ARRAY['https://portfolio3.example.com'], 3, ARRAY['العربية'], 89000.00);
