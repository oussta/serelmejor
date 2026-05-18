# Salesek — Proyecto Final DAW 2025/26

Plataforma SaaS de gestión para pequeñas empresas que combina CRM de ventas e inventario en una sola aplicación. Cuando se cierra una venta, el stock se actualiza automáticamente.

## Stack tecnológico

- Frontend: React 18 + Vite — desplegado en Vercel
- Backend: PHP 8.3 API REST pura — desplegado en Render
- Base de datos: PostgreSQL — Render Frankfurt
- Autenticación: JWT + bcrypt
- Tiempo real: WebSockets
- Email: SendGrid API v3
- IA: Claude API (Anthropic)

## Credenciales de demo

| Rol      | Email                      | Contraseña |
|----------|----------------------------|------------|
| Admin    | admin@salesek.com          | password   |
| Employee | maria@salesek-demo.com     | password   |
| Supplier | proveedor@salesek-demo.com | password   |

## Roles y permisos

| Rol      | Acceso                                                       |
|----------|--------------------------------------------------------------|
| Admin    | Panel global, todos los negocios y usuarios de la plataforma |
| Owner    | Acceso completo a su negocio, equipo y facturación           |
| Employee | Leads, productos, pedidos — sin facturación ni configuración |
| Supplier | Solo portal de proveedores — ve y confirma sus pedidos       |

## Instalación local

1. Clonar el repositorio: `git clone https://github.com/oussta/serelmejor.git`
2. Frontend: `cd frontend && npm install && npm run dev`
3. Backend: copiar `.env.example` a `.env`, rellenar variables y ejecutar `php -S localhost:8000`
4. Base de datos: ejecutar `database/schema.sql` y luego `database/seeds.sql` en PostgreSQL

## Variables de entorno necesarias

DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT=5432, JWT_SECRET, SENDGRID_KEY, CLAUDE_KEY, FRONTEND_URL

## URLs de producción

- Frontend: https://serelmejor.vercel.app
- Backend: https://serelmejor.onrender.com

## Elementos diferenciadores

1. WebSockets — notificaciones en tiempo real
2. Despliegue profesional en Render y Vercel
3. JWT + bcrypt — autenticación avanzada
4. Claude API — IA para borradores y sugerencias de stock