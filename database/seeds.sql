-- seeds.sql — Demo data for Salesek
-- All passwords are: password
-- bcrypt hash for "password" with cost 10

BEGIN;

-- ─── Businesses ──────────────────────────────────────────────────────────────

INSERT INTO public.businesses (id, name, sector, subscription_plan, created_at) VALUES
(1, 'Salesek Demo Corp',   'technology',  'suite',      NOW() - INTERVAL '90 days'),
(2, 'Distribuciones Pérez','retail',      'stockflow',  NOW() - INTERVAL '60 days'),
(3, 'Agencia Creativa SL', 'marketing',   'salesflow',  NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- ─── Users ───────────────────────────────────────────────────────────────────
-- password hash = bcrypt("password", 10)

INSERT INTO public.users (id, business_id, name, email, password_hash, role, email_verified, created_at) VALUES
(1, 1, 'Admin Salesek',       'admin@salesek.com',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',    true, NOW() - INTERVAL '90 days'),
(2, 1, 'Owner Demo',          'owner@salesek.com',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner',    true, NOW() - INTERVAL '89 days'),
(3, 1, 'Employee Demo',       'employee@salesek.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', true, NOW() - INTERVAL '80 days'),
(4, 1, 'Supplier Demo',       'supplier@salesek.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'supplier', true, NOW() - INTERVAL '75 days'),
(5, 2, 'Maria Pérez',         'maria@distriperez.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner',    true, NOW() - INTERVAL '60 days'),
(6, 3, 'Carlos Agencia',      'carlos@agenciasl.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner',    true, NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- ─── Subscriptions ───────────────────────────────────────────────────────────

INSERT INTO public.subscriptions (id, business_id, plan, price, status, start_date) VALUES
(1, 1, 'suite',     49.00, 'active', NOW() - INTERVAL '89 days'),
(2, 2, 'stockflow', 29.00, 'active', NOW() - INTERVAL '59 days'),
(3, 3, 'salesflow', 29.00, 'active', NOW() - INTERVAL '29 days')
ON CONFLICT DO NOTHING;

-- ─── Suppliers ───────────────────────────────────────────────────────────────

INSERT INTO public.suppliers (id, business_id, name, email, contact_name, created_at) VALUES
(1, 1, 'TechParts SL',         'orders@techparts.es',      'Juan Gómez',     NOW() - INTERVAL '85 days'),
(2, 1, 'ElectroDistrib SA',    'ventas@electrodistrib.com','Ana Martínez',   NOW() - INTERVAL '80 days'),
(3, 1, 'Oficina Plus',         'pedidos@oficinaplus.es',   'Pedro Ruiz',     NOW() - INTERVAL '70 days'),
(4, 2, 'MegaDistrib SL',       'info@megadistrib.com',     'Laura Sánchez',  NOW() - INTERVAL '55 days'),
(5, 2, 'Almacenes García',     'almacen@garcia.es',        'Roberto García', NOW() - INTERVAL '50 days')
ON CONFLICT DO NOTHING;

-- ─── Products ────────────────────────────────────────────────────────────────

INSERT INTO public.products (id, business_id, supplier_id, name, category, current_stock, min_stock, price, created_at) VALUES
(1,  1, 1, 'Laptop Pro 15"',        'electronics',  8,  5, 1299.99, NOW() - INTERVAL '85 days'),
(2,  1, 1, 'Teclado Mecánico RGB',  'electronics', 25,  10,   89.99, NOW() - INTERVAL '84 days'),
(3,  1, 2, 'Monitor 27" 4K',        'electronics',  4,  5, 599.99,  NOW() - INTERVAL '83 days'),
(4,  1, 2, 'Auriculares Inalámbr.', 'electronics', 15,  8, 149.99,  NOW() - INTERVAL '82 days'),
(5,  1, 3, 'Silla Ergonómica',      'furniture',    6,  3, 349.99,  NOW() - INTERVAL '81 days'),
(6,  1, 3, 'Mesa de Oficina',       'furniture',    3,  2, 249.99,  NOW() - INTERVAL '80 days'),
(7,  1, 1, 'Ratón Inalámbrico',     'electronics', 30, 10,  39.99,  NOW() - INTERVAL '79 days'),
(8,  1, 2, 'Webcam HD 1080p',       'electronics',  2,  5, 79.99,   NOW() - INTERVAL '78 days'),
(9,  2, 4, 'Camiseta Básica M',     'clothing',    45, 20,  12.99,  NOW() - INTERVAL '55 days'),
(10, 2, 4, 'Pantalón Vaquero 32',   'clothing',    18, 15,  34.99,  NOW() - INTERVAL '54 days'),
(11, 2, 5, 'Zapatillas Running',    'footwear',     8,  10, 59.99,  NOW() - INTERVAL '53 days'),
(12, 2, 5, 'Bolsa de Deporte',      'accessories', 22, 10,  24.99,  NOW() - INTERVAL '52 days')
ON CONFLICT DO NOTHING;

-- ─── Leads ───────────────────────────────────────────────────────────────────

INSERT INTO public.leads (id, business_id, client_name, email, phone, inquiry_text, status, close_probability, product_id, quantity, created_at) VALUES
(1,  1, 'Acme Technologies SL',   'compras@acme.es',       '+34911000001', 'Necesitamos 10 laptops para nuestro equipo de desarrollo.',   'won',         100, 1, 10,  NOW() - INTERVAL '60 days'),
(2,  1, 'Distribuciones Norte',   'info@distnorte.com',    '+34911000002', 'Interesados en monitores para nuestra sala de reuniones.',    'proposal',    75,  3, 5,   NOW() - INTERVAL '45 days'),
(3,  1, 'Hotel Mediterráneo',     'it@hotelmed.es',        '+34911000003', 'Necesitamos equipar 20 habitaciones con teclados y ratones.', 'negotiation', 85,  2, 20,  NOW() - INTERVAL '30 days'),
(4,  1, 'Escuela de Idiomas Plus','admin@idiomasplus.es',  '+34911000004', 'Buscamos auriculares para laboratorio de idiomas.',          'qualified',   60,  4, 15,  NOW() - INTERVAL '25 days'),
(5,  1, 'Startup FinTech SL',     'ops@fintech.es',        '+34911000005', 'Queremos montar una oficina completa para 5 personas.',       'new',         20,  NULL, NULL, NOW() - INTERVAL '20 days'),
(6,  1, 'Consultora Jurídica MG', 'gerencia@mgconsult.es', '+34911000006', 'Necesitamos sillas ergonómicas para 8 puestos.',             'contacted',   40,  5, 8,   NOW() - INTERVAL '15 days'),
(7,  1, 'Clínica Dental Sonrisa', 'recepcion@sonrisa.es',  '+34911000007', 'Interesados en webcams para teleconsulta.',                  'proposal',    70,  8, 6,   NOW() - INTERVAL '10 days'),
(8,  1, 'Colegio San Pablo',      'secretaria@sanpablo.es','+34911000008', 'Equipos para sala de informática, necesitamos 30 ratones.',  'lost',        0,   7, 30,  NOW() - INTERVAL '40 days'),
(9,  3, 'Moda Barcelona SL',      'compras@modabarcelona.com','+34931000001','Buscamos agencia para campaña digital trimestral.',        'qualified',   65, NULL, NULL, NOW() - INTERVAL '20 days'),
(10, 3, 'Restaurante El Bueno',   'jefe@elbueno.com',      '+34931000002', 'Necesitamos diseño de carta y web para el restaurante.',     'proposal',    80, NULL, NULL, NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- ─── Lead messages ───────────────────────────────────────────────────────────

INSERT INTO public.lead_messages (id, lead_id, content, sent_by, ai_generated, sent_at) VALUES
(1,  1, 'Buenos días, estamos interesados en sus laptops para nuestro equipo.',                                   'Acme Technologies', false, NOW() - INTERVAL '60 days'),
(2,  1, 'Gracias por contactarnos. ¿Cuántas unidades necesitan y para cuándo?',                                   'Owner Demo',        false, NOW() - INTERVAL '59 days'),
(3,  1, 'Necesitamos 10 unidades para finales de mes. ¿Tienen en stock?',                                        'Acme Technologies', false, NOW() - INTERVAL '58 days'),
(4,  1, 'Confirmamos disponibilidad de 8 unidades. Podemos hacer pedido especial para las 2 restantes.',          'Owner Demo',        true,  NOW() - INTERVAL '57 days'),
(5,  1, 'Perfecto, procedemos con el pedido de 10 unidades.',                                                     'Acme Technologies', false, NOW() - INTERVAL '56 days'),
(6,  2, 'Hola, necesitamos 5 monitores para nuestra sala de reuniones. ¿Cuáles recomienda?',                     'Distribuciones Norte',false,NOW() - INTERVAL '45 days'),
(7,  2, 'Le recomendamos el Monitor 27" 4K. Excelente relación calidad-precio para reuniones corporativas.',     'Owner Demo',        true,  NOW() - INTERVAL '44 days'),
(8,  3, 'Estamos negociando el precio para 20 unidades. ¿Pueden hacer descuento por volumen?',                   'Hotel Mediterráneo',false, NOW() - INTERVAL '28 days'),
(9,  3, 'Para pedidos de más de 15 unidades aplicamos un 10% de descuento. Le preparamos presupuesto.',          'Owner Demo',        false, NOW() - INTERVAL '27 days')
ON CONFLICT DO NOTHING;

-- ─── Follow-ups ──────────────────────────────────────────────────────────────

INSERT INTO public.followups (id, lead_id, scheduled_at, sent, outcome, created_at) VALUES
(1, 2, NOW() + INTERVAL '3 days',   false, NULL,                                                NOW() - INTERVAL '44 days'),
(2, 3, NOW() + INTERVAL '1 day',    false, NULL,                                                NOW() - INTERVAL '27 days'),
(3, 4, NOW() + INTERVAL '5 days',   false, NULL,                                                NOW() - INTERVAL '24 days'),
(4, 5, NOW() + INTERVAL '7 days',   false, NULL,                                                NOW() - INTERVAL '19 days'),
(5, 6, NOW() + INTERVAL '2 days',   false, NULL,                                                NOW() - INTERVAL '14 days'),
(6, 1, NOW() - INTERVAL '55 days',  true,  'Lead respondió positivamente. Pedido confirmado.',  NOW() - INTERVAL '60 days')
ON CONFLICT DO NOTHING;

-- ─── Stock movements ─────────────────────────────────────────────────────────

INSERT INTO public.stock_movements (id, product_id, type, quantity, note, created_at) VALUES
(1,  1, 'in',    20, 'Stock inicial',                                 NOW() - INTERVAL '85 days'),
(2,  1, 'out',   10, 'Venta a Acme Technologies SL (lead ganado)',    NOW() - INTERVAL '55 days'),
(3,  1, 'in',    3,  'Reposición de emergencia TechParts SL',         NOW() - INTERVAL '50 days'),
(4,  1, 'out',   5,  'Venta directa en mostrador',                    NOW() - INTERVAL '40 days'),
(5,  2, 'in',    30, 'Stock inicial',                                 NOW() - INTERVAL '84 days'),
(6,  2, 'out',   5,  'Venta mostrador',                               NOW() - INTERVAL '70 days'),
(7,  3, 'in',    10, 'Stock inicial',                                 NOW() - INTERVAL '83 days'),
(8,  3, 'out',   6,  'Venta a cliente corporativo',                   NOW() - INTERVAL '65 days'),
(9,  4, 'in',    20, 'Stock inicial',                                 NOW() - INTERVAL '82 days'),
(10, 4, 'out',   5,  'Venta a laboratorio de idiomas',                NOW() - INTERVAL '60 days'),
(11, 7, 'in',    40, 'Stock inicial',                                 NOW() - INTERVAL '79 days'),
(12, 7, 'out',   10, 'Venta mostrador',                               NOW() - INTERVAL '55 days'),
(13, 8, 'in',    8,  'Stock inicial',                                 NOW() - INTERVAL '78 days'),
(14, 8, 'out',   6,  'Venta a clínica dental',                        NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- ─── Purchase orders ─────────────────────────────────────────────────────────

INSERT INTO public.purchase_orders (id, business_id, supplier_id, product_id, quantity, status, sent_at, confirmed_at, created_at, note) VALUES
(1, 1, 1, 1, 15, 'delivered',  NOW() - INTERVAL '55 days', NOW() - INTERVAL '52 days', NOW() - INTERVAL '56 days', 'Pedido automático generado por The Bridge al cerrar deal Acme Technologies'),
(2, 1, 2, 3, 10, 'sent',       NOW() - INTERVAL '29 days', NULL,                       NOW() - INTERVAL '30 days', 'Stock bajo — alerta automática del sistema'),
(3, 1, 2, 8, 10, 'pending',    NULL,                       NULL,                       NOW() - INTERVAL '28 days', 'Stock por debajo del mínimo — pendiente de aprobación'),
(4, 1, 3, 5, 5,  'confirmed',  NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '22 days', 'Pedido manual aprobado por el propietario'),
(5, 2, 4, 11, 20, 'pending',   NULL,                       NULL,                       NOW() - INTERVAL '15 days', 'Stock de zapatillas bajo el mínimo')
ON CONFLICT DO NOTHING;

-- ─── Notifications ───────────────────────────────────────────────────────────

INSERT INTO public.notifications (id, user_id, type, message, read, created_at) VALUES
(1,  2, 'bridge_order',   'The Bridge ha creado un pedido automático a TechParts SL por 15 unidades de Laptop Pro 15".', true,  NOW() - INTERVAL '56 days'),
(2,  2, 'low_stock',      'Monitor 27" 4K tiene stock bajo (4 unidades, mínimo 5). Se ha generado un pedido automático.', false, NOW() - INTERVAL '30 days'),
(3,  2, 'low_stock',      'Webcam HD 1080p tiene stock bajo (2 unidades, mínimo 5).',                                    false, NOW() - INTERVAL '28 days'),
(4,  3, 'lead_won',       'El lead Acme Technologies SL ha sido marcado como ganado.',                                   true,  NOW() - INTERVAL '55 days'),
(5,  2, 'order_confirmed','El pedido a Oficina Plus ha sido confirmado.',                                                 false, NOW() - INTERVAL '18 days'),
(6,  2, 'new_lead',       'Nuevo lead recibido: Colegio San Pablo.',                                                     true,  NOW() - INTERVAL '40 days'),
(7,  2, 'low_stock',      'Zapatillas Running tiene stock bajo (8 unidades, mínimo 10). Pedido generado.',               false, NOW() - INTERVAL '15 days')
ON CONFLICT DO NOTHING;

-- ─── Contact messages ────────────────────────────────────────────────────────

INSERT INTO public.contact_messages (id, name, email, company, message, created_at) VALUES
(1, 'Roberto Fernández', 'roberto@empresa.es',  'Empresa SL',      'Me interesa conocer más sobre el plan Suite. ¿Hay posibilidad de demo?',               NOW() - INTERVAL '20 days'),
(2, 'Sofia Martín',      'sofia@startup.com',   'Mi Startup',      'Somos 3 personas y necesitamos CRM. ¿El plan SalesFlow tiene límite de usuarios?',      NOW() - INTERVAL '15 days'),
(3, 'Ahmed Khalil',      'ahmed@distribuciones.ma','Distribuciones K','Tenemos un negocio de distribución. ¿Incluye gestión de pedidos a proveedores?',    NOW() - INTERVAL '10 days'),
(4, 'Emma Johnson',      'emma@uk-shop.co.uk',  'UK Shop Ltd',     'Do you have an English version? We are interested in the inventory module.',           NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Reset sequences to avoid PK conflicts on future inserts
SELECT setval('businesses_id_seq',      (SELECT MAX(id) FROM public.businesses));
SELECT setval('users_id_seq',           (SELECT MAX(id) FROM public.users));
SELECT setval('subscriptions_id_seq',   (SELECT MAX(id) FROM public.subscriptions));
SELECT setval('suppliers_id_seq',       (SELECT MAX(id) FROM public.suppliers));
SELECT setval('products_id_seq',        (SELECT MAX(id) FROM public.products));
SELECT setval('leads_id_seq',           (SELECT MAX(id) FROM public.leads));
SELECT setval('lead_messages_id_seq',   (SELECT MAX(id) FROM public.lead_messages));
SELECT setval('followups_id_seq',       (SELECT MAX(id) FROM public.followups));
SELECT setval('stock_movements_id_seq', (SELECT MAX(id) FROM public.stock_movements));
SELECT setval('purchase_orders_id_seq', (SELECT MAX(id) FROM public.purchase_orders));
SELECT setval('notifications_id_seq',   (SELECT MAX(id) FROM public.notifications));
SELECT setval('contact_messages_id_seq',(SELECT MAX(id) FROM public.contact_messages));

COMMIT;
