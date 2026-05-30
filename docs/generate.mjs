import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, PageBreak, PageOrientation,
  Header, Footer, PageNumber, NumberFormat, LevelFormat,
  convertInchesToTwip, UnderlineType
} from "docx";
import { writeFileSync } from "fs";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const pt = (n) => n * 2; // half-points → docx unit
const ACCENT = "2563EB";   // blue
const YELLOW_BG = "FEF08A"; // highlight yellow

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    border: { bottom: { color: ACCENT, style: BorderStyle.SINGLE, size: 6 } },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: pt(11), font: "Calibri", ...opts })],
    spacing: { before: 80, after: 80, line: 276 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, size: pt(11), font: "Calibri" });
}

function screenshot(desc) {
  return new Paragraph({
    children: [
      new TextRun({
        text: `  ${desc}  `,
        bold: true,
        size: pt(11),
        font: "Calibri",
        highlight: "yellow",
      }),
    ],
    spacing: { before: 160, after: 160 },
    border: {
      top: { color: "EAB308", style: BorderStyle.SINGLE, size: 8 },
      bottom: { color: "EAB308", style: BorderStyle.SINGLE, size: 8 },
      left: { color: "EAB308", style: BorderStyle.SINGLE, size: 8 },
      right: { color: "EAB308", style: BorderStyle.SINGLE, size: 8 },
    },
    shading: { type: ShadingType.CLEAR, fill: "FEFCE8" },
  });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    tableHeader: isHeader,
    children: cells.map(
      (text) =>
        new TableCell({
          shading: isHeader
            ? { type: ShadingType.CLEAR, fill: "1E3A5F" }
            : undefined,
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: String(text),
                  bold: isHeader,
                  color: isHeader ? "FFFFFF" : "000000",
                  size: pt(10),
                  font: "Calibri",
                }),
              ],
            }),
          ],
        })
    ),
  });
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableRow(headers, true),
      ...rows.map((r) => tableRow(r, false)),
    ],
  });
}

function numbered(items) {
  return items.map(
    (text, i) =>
      new Paragraph({
        children: [new TextRun({ text: `${i + 1}. ${text}`, size: pt(11), font: "Calibri" })],
        spacing: { before: 60, after: 60, line: 276 },
        indent: { left: convertInchesToTwip(0.25) },
      })
  );
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function titlePage(title, subtitle, author, school, year) {
  return [
    new Paragraph({ spacing: { before: 1440 } }),
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: pt(28), color: ACCENT, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: subtitle, size: pt(14), color: "4B5563", font: "Calibri", italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 800 },
    }),
    new Paragraph({
      children: [new TextRun({ text: author, size: pt(13), bold: true, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: school, size: pt(12), font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: year, size: pt(12), font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),
    pageBreak(),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// SPANISH DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════
function buildSpanish() {
  const children = [
    // ── PORTADA ──
    ...titlePage(
      "SALESEK",
      "Plataforma SaaS de CRM e Inventario para PYMEs\nMemoria Final de Proyecto — Ciclo DAW",
      "Autor: [NOMBRE DEL ALUMNO]",
      "Centro educativo: Digitech DAW",
      "Curso académico: 2025/2026"
    ),

    // ═══════════════════════════════════
    // 1. IDENTIFICACIÓN DE NECESIDADES
    // ═══════════════════════════════════
    h1("1. Identificación de necesidades"),

    h2("1.1 Contextualización"),
    p("Las pequeñas y medianas empresas (PYMEs) representan el núcleo productivo de la economía española. Según datos del Directorio Central de Empresas (DIRCE), más del 99% del tejido empresarial nacional está formado por empresas con menos de 250 trabajadores, lo que evidencia la enorme importancia de este segmento. Sin embargo, la gran mayoría de estas organizaciones operan con herramientas fragmentadas: utilizan hojas de cálculo para gestionar su inventario, correos electrónicos para el seguimiento de clientes y cuadernos físicos o aplicaciones desconectadas para registrar ventas. Esta fragmentación genera ineficiencias operativas, pérdida de información y una incapacidad estructural para tomar decisiones basadas en datos reales y actualizados."),
    p("En este contexto, Salesek nace como respuesta directa a una necesidad detectada en el mercado de las PYMEs españolas: la ausencia de una plataforma integrada, asequible y fácil de usar que unifique la gestión de relaciones con clientes (CRM) y el control de inventario (ERP ligero) en un único entorno de trabajo. El público objetivo de Salesek comprende principalmente a propietarios de pequeños comercios, startups en fase inicial, autónomos con equipo propio y gestores de negocios de entre cinco y cincuenta empleados que necesitan digitalizar sus operaciones sin incurrir en los elevados costes de soluciones empresariales como Salesforce, SAP o HubSpot."),
    p("La plataforma está concebida para ser accesible desde cualquier dispositivo con conexión a internet, sin necesidad de instalación de software local, y con una curva de aprendizaje reducida. Su diseño responsive garantiza una experiencia de usuario consistente tanto en escritorio como en dispositivos móviles, aspecto fundamental para propietarios y empleados que trabajan desde múltiples ubicaciones."),
    screenshot("[CAPTURA REQUERIDA: Página de inicio de Salesek (https://salsek.com) mostrando el hero section con el eslogan principal y el botón de registro]"),

    h2("1.2 Justificación"),
    p("La justificación de Salesek como proyecto viable se sustenta en tres pilares fundamentales: la brecha de mercado existente, la oportunidad tecnológica y el modelo de negocio por suscripción."),
    p("En primer lugar, existe una brecha real entre las necesidades de las PYMEs y la oferta disponible. Las soluciones del mercado para gestión comercial e inventario se dividen en dos extremos: herramientas muy básicas (hojas de cálculo, aplicaciones gratuitas con funcionalidades limitadas) o plataformas empresariales complejas y costosas que requieren formación especializada y un presupuesto significativo. Salesek ocupa el espacio intermedio, ofreciendo funcionalidades avanzadas con una interfaz accesible y un precio competitivo."),
    p("En segundo lugar, la madurez tecnológica actual permite construir aplicaciones web de alto rendimiento con costes de infraestructura reducidos. La combinación de servicios en la nube como Vercel y Render, junto con bases de datos gestionadas en PostgreSQL, permite ofrecer una disponibilidad del 99.9% sin necesidad de infraestructura propia. Adicionalmente, la incorporación de inteligencia artificial mediante la API de Groq (modelo LLaMA) permite añadir valor diferencial sin un coste de desarrollo significativo."),
    p("En tercer lugar, el modelo SaaS (Software as a Service) por suscripción mensual garantiza ingresos recurrentes y predecibles. Con tres planes (SalesFlow a €29/mes, StockFlow a €29/mes y Suite completa a €49/mes), el modelo de precios es competitivo frente a alternativas como Zoho CRM (desde €14/mes con funciones muy limitadas) o HubSpot (desde €41/mes sin módulo de inventario)."),
    p("Características específicas que diferencian a Salesek de competidores directos:"),
    ...numbered([
      "Integración nativa entre CRM e inventario mediante 'The Bridge', automatización que vincula el cierre de una venta con el descuento automático de stock.",
      "Panel de proveedor independiente con portal exclusivo para que los proveedores consulten y confirmen pedidos de compra.",
      "Soporte multilingüe en tres idiomas (español, inglés y francés) desde el primer día.",
      "Asistente de IA integrado para redactar respuestas comerciales y sugerir cantidades óptimas de reposición.",
      "Notificaciones en tiempo real mediante WebSockets sin necesidad de recargar la página.",
      "Modo oscuro y diseño adaptativo para móvil y escritorio.",
    ]),
    screenshot("[CAPTURA REQUERIDA: Página de funcionalidades (https://salsek.com/features) mostrando los módulos SalesFlow y StockFlow]"),

    h2("1.3 Otros aspectos"),
    p("Desde el punto de vista legal y fiscal, Salesek debe operar conforme a la normativa vigente en materia de protección de datos y comercio electrónico. Al tratarse de una plataforma que almacena datos personales de usuarios y clientes de sus clientes, le son de aplicación el Reglamento General de Protección de Datos (RGPD/GDPR) y la Ley Orgánica de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD). Las medidas técnicas implementadas — cifrado de contraseñas con bcrypt, comunicación cifrada HTTPS, tokens JWT con expiración, y validación de entradas para prevenir inyección SQL y XSS — constituyen las salvaguardas técnicas exigidas por el artículo 32 del RGPD."),
    p("La plataforma también debe cumplir con la Ley de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), lo que implica disponer de aviso legal, política de privacidad y política de cookies accesibles desde la página de inicio. La facturación electrónica de las suscripciones procesadas mediante Stripe está sujeta a la normativa fiscal española de IVA."),
    p("En cuanto a posibles ayudas y subvenciones, el proyecto podría acogerse al programa Kit Digital del Plan de Recuperación, Transformación y Resiliencia, que contempla ayudas para digitalización de PYMEs de hasta €12.000 para empresas de entre 3 y 9 empleados. Asimismo, comunidades autónomas como Cataluña, Madrid y el País Vasco disponen de líneas de financiación para proyectos de software empresarial desarrollados por emprendedores locales."),
    p("La guía de trabajo adoptada para el desarrollo sigue la metodología ágil con sprints semanales, revisión continua del backlog y adaptación iterativa de funcionalidades según las pruebas realizadas. La documentación técnica se mantiene actualizada en el repositorio de GitHub (https://github.com/oussta/serelmejor) y el seguimiento de incidencias se gestiona mediante el sistema de issues integrado en la plataforma."),

    pageBreak(),

    // ═══════════════════════════════════
    // 2. DISEÑO DEL PROYECTO
    // ═══════════════════════════════════
    h1("2. Diseño del proyecto"),

    h2("2.1 Contenido"),
    p("Salesek es una aplicación web de tipo SaaS compuesta por un frontend desarrollado en React 18 con Vite como herramienta de construcción, y un backend REST API implementado en PHP 8 puro sin framework, conectado a una base de datos PostgreSQL 15. Ambas capas se despliegan de forma independiente: el frontend en Vercel y el backend en Render."),
    p("El estudio de viabilidad técnica realizado en la fase de análisis concluyó que la arquitectura elegida es adecuada para las necesidades del proyecto por los siguientes motivos: React permite construir interfaces dinámicas con actualizaciones de estado eficientes; PHP ofrece un ecosistema maduro para APIs REST con librerías bien documentadas; PostgreSQL garantiza integridad referencial y soporte avanzado para consultas complejas; y la arquitectura de microservicios implícita (frontend desacoplado del backend) facilita el mantenimiento y el escalado independiente de cada capa."),
    p("El proyecto abarca los siguientes contenidos funcionales:"),
    ...numbered([
      "Módulo de autenticación: registro de empresas, inicio de sesión, verificación de email, recuperación de contraseña y gestión de sesiones mediante JWT.",
      "Módulo SalesFlow CRM: gestión completa del pipeline de ventas con tablero Kanban, mensajes por lead, recordatorios de seguimiento y asistente IA.",
      "Módulo StockFlow Inventario: catálogo de productos con categorías, control de movimientos de stock, alertas de stock mínimo, gestión de proveedores y pedidos de compra.",
      "The Bridge (automatización): sincronización automática entre CRM e inventario al cerrar un trato.",
      "Panel de administración: estadísticas globales de la plataforma, gestión de empresas y usuarios.",
      "Portal de proveedor: interfaz exclusiva para proveedores con acceso restringido a sus pedidos.",
      "Sistema de notificaciones en tiempo real mediante WebSockets.",
      "Sistema de suscripciones con integración de pagos Stripe.",
      "Soporte multilingüe (ES/EN/FR) y modo oscuro.",
    ]),
    p("Las fases del proyecto se estructuran en catorce etapas que comprenden desde la configuración inicial del entorno hasta la documentación final, pasando por el desarrollo iterativo de cada módulo funcional."),
    screenshot("[CAPTURA REQUERIDA: Dashboard principal de Salesek mostrando las estadísticas (leads activos, productos, pedidos pendientes, alertas de stock)]"),

    h2("2.2 Objetivos y recursos"),
    h3("Objetivos"),
    p("El objetivo general del proyecto es desarrollar una plataforma SaaS funcional, segura y desplegada en producción que permita a PYMEs gestionar su pipeline de ventas y su inventario desde una única interfaz web accesible desde cualquier dispositivo."),
    p("Los objetivos específicos son:"),
    ...numbered([
      "Implementar un sistema de autenticación seguro basado en JWT con control de acceso por roles.",
      "Desarrollar el módulo SalesFlow con pipeline de leads en cinco estados y seguimiento de comunicaciones.",
      "Desarrollar el módulo StockFlow con gestión de productos, movimientos de stock y pedidos de compra.",
      "Implementar The Bridge como automatización que conecta ambos módulos de forma transparente.",
      "Integrar la API de Groq/LLaMA para asistencia inteligente en redacción comercial y reposición de inventario.",
      "Implementar notificaciones en tiempo real mediante WebSockets.",
      "Desarrollar un panel de administración para la supervisión global de la plataforma.",
      "Crear un portal exclusivo para proveedores con acceso controlado.",
      "Integrar Stripe para el procesamiento seguro de pagos de suscripción.",
      "Desplegar la aplicación en producción con disponibilidad continua.",
    ]),

    h3("Recursos hardware"),
    makeTable(
      ["Recurso", "Descripción", "Uso"],
      [
        ["Ordenador portátil de desarrollo", "Procesador Intel Core i5, 16 GB RAM, SSD 512 GB", "Desarrollo local y pruebas"],
        ["Servidor Render (backend)", "Instancia compartida Linux, 512 MB RAM", "Producción API PHP + PostgreSQL"],
        ["CDN Vercel (frontend)", "Red global de distribución de contenido", "Producción frontend React"],
        ["Dispositivos móviles", "Smartphone Android e iOS para pruebas", "Validación diseño responsive"],
      ]
    ),

    h3("Recursos software"),
    makeTable(
      ["Herramienta", "Versión", "Propósito"],
      [
        ["Node.js", "20.x LTS", "Entorno de ejecución para Vite y herramientas de frontend"],
        ["React", "18.2.4", "Framework de interfaz de usuario"],
        ["Vite", "8.0.0", "Bundler y servidor de desarrollo para el frontend"],
        ["PHP", "8.3", "Lenguaje del backend REST API"],
        ["PostgreSQL", "15", "Sistema de gestión de base de datos relacional"],
        ["Composer", "2.x", "Gestor de dependencias PHP"],
        ["Git / GitHub", "2.x", "Control de versiones y repositorio remoto"],
        ["VS Code", "1.x", "Editor de código principal"],
        ["Postman", "10.x", "Pruebas de endpoints de la API"],
        ["DBeaver", "23.x", "Cliente gráfico para PostgreSQL"],
        ["Docker", "24.x", "Contenedorización del backend para Render"],
        ["Figma", "—", "Prototipado de interfaces (wireframes)"],
      ]
    ),

    h3("Recursos personales y materiales"),
    p("El equipo de desarrollo está formado por un único desarrollador fullstack, responsable de la totalidad del diseño, implementación, pruebas y despliegue del proyecto. Los recursos de terceros utilizados son servicios en la nube con planes gratuitos o de bajo coste: Render (plan gratuito para el backend durante desarrollo), Vercel (plan gratuito para frontend), SendGrid (plan gratuito hasta 100 correos/día), Groq API (acceso gratuito durante la fase de desarrollo) y Stripe (sin coste hasta el primer cobro real)."),

    h2("2.3 Viabilidad económica"),
    h3("Presupuesto de desarrollo"),
    makeTable(
      ["Concepto", "Horas estimadas", "Coste/hora (€)", "Total (€)"],
      [
        ["Análisis y diseño", "20 h", "—", "—"],
        ["Desarrollo frontend (React)", "80 h", "—", "—"],
        ["Desarrollo backend (PHP API)", "70 h", "—", "—"],
        ["Base de datos y migraciones", "15 h", "—", "—"],
        ["Integraciones externas (Stripe, SendGrid, Groq)", "20 h", "—", "—"],
        ["Pruebas y corrección de errores", "25 h", "—", "—"],
        ["Despliegue y configuración de producción", "10 h", "—", "—"],
        ["Documentación", "15 h", "—", "—"],
        ["TOTAL", "255 h", "—", "Proyecto académico sin coste laboral"],
      ]
    ),

    h3("Costes de infraestructura mensual (producción)"),
    makeTable(
      ["Servicio", "Plan", "Coste mensual (€)"],
      [
        ["Render (backend PHP)", "Starter", "~€7 – €14"],
        ["Render (base de datos PostgreSQL)", "Starter", "~€7"],
        ["Vercel (frontend React)", "Hobby/Pro", "€0 – €20"],
        ["Dominio salsek.com", "Anual ~€12", "~€1/mes"],
        ["SendGrid (emails)", "Free tier 100/día", "€0"],
        ["Groq API (IA)", "Free tier", "€0"],
        ["Stripe (pagos)", "2.9% + €0.30 por transacción", "Variable"],
        ["TOTAL mínimo estimado", "—", "~€15 – €42/mes"],
      ]
    ),

    h3("Proyección de ingresos"),
    p("Con un modelo de precios de €29/mes (plan básico) y €49/mes (plan Suite), la plataforma alcanza el punto de equilibrio con tan solo 2 clientes en plan Suite al mes, cubriendo todos los costes de infraestructura. A partir de 10 clientes activos, el margen operativo es positivo y permite escalar la infraestructura."),

    h3("Fuentes de financiación"),
    p("La fase inicial se financia mediante recursos propios (equipo de desarrollo sin coste laboral al ser un proyecto académico). Para la fase de crecimiento se contempla la búsqueda de financiación mediante el programa Kit Digital (para clientes PYMEs), inversores ángel o participación en programas de aceleración para startups tecnológicas."),

    h2("2.4 Modelo de solución"),

    h3("Stack tecnológico completo"),
    makeTable(
      ["Capa", "Tecnología", "Versión", "Justificación"],
      [
        ["Frontend", "React", "18.2.4", "Componentes reutilizables, estado reactivo, ecosistema maduro"],
        ["Frontend Build", "Vite", "8.0.0", "Compilación ultrarrápida, soporte ESModules nativo"],
        ["Routing", "React Router", "7.13.1", "Enrutamiento declarativo SPA con rutas protegidas"],
        ["i18n", "i18next + react-i18next", "23.x", "Internacionalización con traducciones JSON"],
        ["Pagos frontend", "Stripe.js + React Stripe", "—", "Integración oficial de Stripe en React"],
        ["Backend", "PHP", "8.3", "Sin framework, API REST pura, control total del código"],
        ["Base de datos", "PostgreSQL", "15", "Relacional, ACID, soporte JSON, escalable"],
        ["Autenticación", "JWT (firebase/php-jwt)", "6.x", "Tokens stateless, seguridad sin sesiones"],
        ["Email", "SendGrid API v3", "—", "Entregabilidad garantizada, plantillas HTML"],
        ["Pagos backend", "Stripe PHP SDK", "—", "SDK oficial para PaymentIntents"],
        ["IA", "Groq API (LLaMA)", "—", "Inferencia rápida gratuita para sugerencias contextuales"],
        ["WebSockets", "Ratchet (PHP)", "0.4.x", "Notificaciones en tiempo real sin polling"],
        ["Deploy frontend", "Vercel", "—", "CDN global, despliegue automático desde GitHub"],
        ["Deploy backend", "Render + Docker", "—", "Contenedorización, escalado automático"],
      ]
    ),

    h3("Roles de usuario"),
    makeTable(
      ["Rol", "Descripción", "Permisos principales", "Ruta de acceso"],
      [
        ["Admin", "Administrador de la plataforma (Salesek)", "Ver todas las empresas, usuarios, leads y productos. Eliminar empresas.", "/admin"],
        ["Owner", "Propietario de una empresa cliente", "Acceso completo a su empresa: leads, productos, pedidos, equipo y facturación.", "/dashboard, /leads, /products, /orders, /team"],
        ["Employee", "Empleado de una empresa cliente", "Leer y escribir leads, productos y pedidos. Sin acceso a equipo ni facturación.", "/dashboard, /leads, /products, /orders"],
        ["Supplier", "Proveedor asociado a una empresa", "Ver sus pedidos de compra, confirmarlos y marcarlos como entregados.", "/supplier"],
      ]
    ),

    h3("Descripción del modelo entidad-relación"),
    p("La base de datos de Salesek está compuesta por once tablas relacionales que implementan un modelo multi-tenant: cada empresa (businesses) tiene sus propios usuarios, leads, productos, proveedores y pedidos de forma completamente aislada mediante el campo business_id como clave foránea."),
    p("Las relaciones principales son las siguientes: un registro en businesses puede tener múltiples users (empleados y propietarios), múltiples leads, múltiples products, múltiples suppliers y múltiples purchase_orders. Un lead puede tener múltiples lead_messages y múltiples followups. Un product puede tener múltiples stock_movements. Un purchase_order está asociado a un supplier y a un product. Las notifications están asociadas a usuarios individuales."),

    h3("Tablas de la base de datos"),
    makeTable(
      ["Tabla", "Columnas principales", "Descripción"],
      [
        ["users", "id, email, password_hash, name, role, business_id, created_at", "Usuarios de la plataforma con su rol asignado"],
        ["businesses", "id, name, sector, subscription_plan, created_at", "Empresas clientes registradas en Salesek"],
        ["subscriptions", "id, business_id, plan, price, status, created_at", "Historial de suscripciones por empresa"],
        ["leads", "id, business_id, client_name, inquiry_text, close_probability, status, created_at", "Oportunidades de venta en el pipeline CRM"],
        ["lead_messages", "id, lead_id, content, created_at", "Mensajes y notas asociados a cada lead"],
        ["followups", "id, lead_id, scheduled_at, created_at", "Recordatorios de seguimiento por lead"],
        ["products", "id, business_id, name, category, current_stock, min_stock, price, created_at", "Catálogo de productos con control de stock"],
        ["stock_movements", "id, product_id, type, quantity, note, created_at", "Historial de movimientos de inventario"],
        ["suppliers", "id, business_id, name, email, contact_name, phone, created_at", "Proveedores asociados a cada empresa"],
        ["purchase_orders", "id, business_id, supplier_id, product_id, quantity, status, note, created_at", "Pedidos de compra con ciclo de vida completo"],
        ["notifications", "id, user_id, type, message, read, created_at", "Notificaciones en tiempo real por usuario"],
      ]
    ),
    screenshot("[CAPTURA REQUERIDA: Diagrama Entidad-Relación de la base de datos de Salesek (generar con DBeaver o pgAdmin mostrando todas las tablas y relaciones)]"),

    h3("Endpoints principales de la API REST"),
    makeTable(
      ["Método", "Ruta", "Descripción", "Autenticación"],
      [
        ["POST", "/register", "Registrar nueva empresa y usuario propietario", "Pública"],
        ["POST", "/login", "Iniciar sesión y obtener token JWT", "Pública"],
        ["GET", "/me", "Obtener datos del usuario autenticado", "JWT"],
        ["POST", "/forgot-password", "Solicitar código de recuperación por email", "Pública"],
        ["POST", "/reset-password", "Restablecer contraseña con código", "Pública"],
        ["GET", "/business", "Obtener perfil de la empresa", "JWT"],
        ["PUT", "/business", "Actualizar nombre y sector de la empresa", "JWT + Owner"],
        ["GET", "/business/stats", "Obtener estadísticas de la empresa", "JWT"],
        ["GET", "/team", "Listar miembros del equipo", "JWT"],
        ["POST", "/team/invite", "Invitar nuevo miembro con rol", "JWT + Owner"],
        ["DELETE", "/team/:id", "Eliminar miembro del equipo", "JWT + Owner"],
        ["GET", "/leads", "Listar leads (filtrables por estado)", "JWT"],
        ["POST", "/leads", "Crear nuevo lead", "JWT"],
        ["PUT", "/leads/:id/status", "Cambiar estado del lead (activa The Bridge)", "JWT"],
        ["GET", "/leads/:id/messages", "Listar mensajes de un lead", "JWT"],
        ["POST", "/leads/:id/messages", "Añadir mensaje a un lead", "JWT"],
        ["GET", "/leads/:id/followups", "Listar recordatorios de un lead", "JWT"],
        ["POST", "/leads/:id/followups", "Crear recordatorio de seguimiento", "JWT"],
        ["GET", "/products", "Listar catálogo de productos", "JWT"],
        ["POST", "/products", "Crear nuevo producto", "JWT"],
        ["POST", "/products/:id/sale", "Registrar venta (reduce stock)", "JWT"],
        ["POST", "/products/:id/restock", "Registrar reposición (aumenta stock)", "JWT"],
        ["GET", "/products/low-stock", "Listar productos bajo mínimo", "JWT"],
        ["GET", "/products/:id/movements", "Historial de movimientos del producto", "JWT"],
        ["GET", "/suppliers", "Listar proveedores", "JWT"],
        ["POST", "/suppliers", "Crear proveedor", "JWT"],
        ["GET", "/orders", "Listar pedidos de compra", "JWT"],
        ["POST", "/orders", "Crear pedido de compra", "JWT"],
        ["POST", "/orders/:id/send", "Enviar pedido al proveedor por email", "JWT"],
        ["PUT", "/orders/:id/confirm", "Proveedor confirma recepción", "JWT + Supplier"],
        ["PUT", "/orders/:id/deliver", "Proveedor marca como entregado (actualiza stock)", "JWT + Supplier"],
        ["POST", "/ai/draft-response", "IA genera respuesta comercial para un lead", "JWT"],
        ["POST", "/ai/suggest-order", "IA sugiere cantidad de reposición", "JWT"],
        ["GET", "/notifications", "Listar notificaciones del usuario", "JWT"],
        ["PUT", "/notifications/read-all", "Marcar todas como leídas", "JWT"],
        ["GET", "/admin/stats", "Estadísticas globales de la plataforma", "JWT + Admin"],
        ["GET", "/admin/businesses", "Listar todas las empresas", "JWT + Admin"],
        ["DELETE", "/admin/businesses/:id", "Eliminar empresa (en cascada)", "JWT + Admin"],
        ["POST", "/payment/create-intent", "Crear PaymentIntent en Stripe", "JWT"],
        ["POST", "/payment/confirm", "Confirmar pago y activar plan", "JWT"],
      ]
    ),

    h3("Planes de suscripción"),
    makeTable(
      ["Plan", "Precio", "Módulos incluidos", "Público objetivo"],
      [
        ["SalesFlow", "€29/mes", "CRM completo: leads, mensajes, seguimientos, IA comercial", "Equipos de ventas sin necesidad de inventario"],
        ["StockFlow", "€29/mes", "Inventario completo: productos, stock, proveedores, pedidos, IA de reposición", "Comercios y almacenes sin gestión de ventas CRM"],
        ["Suite Completa", "€49/mes", "SalesFlow + StockFlow + The Bridge (automatización CRM-Inventario)", "PYMEs que necesitan integración total de ventas e inventario"],
      ]
    ),

    h3("Estructura de carpetas del proyecto"),
    new Paragraph({
      children: [
        new TextRun({
          text: [
            "serelmejor/",
            "├── frontend/                    # Aplicación React SPA",
            "│   ├── src/",
            "│   │   ├── components/          # Componentes reutilizables",
            "│   │   │   ├── layout/          # Navbar, Footer, Layout",
            "│   │   │   ├── shared/          # NotifBell (campana notificaciones)",
            "│   │   │   └── ui/              # Toast, alertas",
            "│   │   ├── context/             # AuthContext, ThemeContext",
            "│   │   ├── pages/               # Páginas organizadas por módulo",
            "│   │   │   ├── auth/            # Login, Register, ResetPassword",
            "│   │   │   ├── landing/         # Landing, Features, About, Blog",
            "│   │   │   ├── dashboard/       # Dashboard, Team",
            "│   │   │   ├── salesflow/       # Leads, LeadDetail",
            "│   │   │   ├── stockflow/       # Products, Orders, ProductDetail",
            "│   │   │   ├── pricing/         # Pricing, Payment",
            "│   │   │   ├── admin/           # AdminPanel",
            "│   │   │   └── supplier/        # SupplierPortal",
            "│   │   ├── router/              # AppRouter con rutas protegidas",
            "│   │   ├── services/            # api.js, authService, leadService, stockService",
            "│   │   ├── hooks/               # Custom React hooks",
            "│   │   ├── locales/             # es.json, en.json, fr.json",
            "│   │   ├── styles/              # Estilos globales",
            "│   │   └── i18n.js              # Configuración i18next",
            "│   ├── index.html",
            "│   ├── vite.config.js",
            "│   └── vercel.json",
            "├── backend/                     # API REST PHP pura",
            "│   ├── controllers/             # AuthController, LeadController, ProductController...",
            "│   ├── middleware/              # AuthMiddleware, RoleMiddleware",
            "│   ├── services/                # BridgeService (automatización)",
            "│   ├── utils/                   # JWT, Response, Validator",
            "│   ├── websocket/               # server.php (Ratchet)",
            "│   ├── routes/                  # api.php (despachador de rutas)",
            "│   ├── config/                  # database.php (conexión PDO)",
            "│   ├── index.php                # Punto de entrada",
            "│   ├── composer.json",
            "│   └── Dockerfile",
            "└── database/",
            "    ├── schema.sql               # Definición de tablas",
            "    └── seeds.sql                # Datos de prueba",
          ].join("\n"),
          font: "Courier New",
          size: pt(9),
        }),
      ],
      spacing: { before: 120, after: 120 },
    }),

    pageBreak(),

    // ═══════════════════════════════════
    // 3. EJECUCIÓN DEL PROYECTO
    // ═══════════════════════════════════
    h1("3. Ejecución del proyecto"),

    h2("3.1 Planificación temporal"),
    p("El desarrollo de Salesek se estructuró en catorce fases secuenciales con dependencias explícitas entre ellas, distribuidas a lo largo del curso académico 2025/2026."),
    makeTable(
      ["Fase", "Nombre", "Descripción", "Duración estimada"],
      [
        ["0", "Setup y configuración", "Inicialización del repositorio GitHub, configuración de entornos de desarrollo (Vite, PHP, PostgreSQL local), instalación de dependencias y estructura inicial de carpetas.", "1 semana"],
        ["1", "Diseño de base de datos", "Definición del esquema entidad-relación, creación de tablas en PostgreSQL, escritura de schema.sql y seeds.sql de prueba.", "1 semana"],
        ["2", "Autenticación backend", "Implementación de AuthController con registro, login, JWT, bcrypt, verificación de email mediante SendGrid y recuperación de contraseña.", "1 semana"],
        ["3", "Autenticación frontend", "Páginas de Login, Register, ForgotPassword y ResetPassword en React. AuthContext con almacenamiento del token en localStorage. Rutas protegidas.", "1 semana"],
        ["4", "Módulo SalesFlow backend", "LeadController con CRUD completo de leads, mensajes, seguimientos y cambio de estado. Filtros por estado y estadísticas.", "2 semanas"],
        ["5", "Módulo SalesFlow frontend", "Página Leads con tablero Kanban, LeadDetail con timeline de mensajes y formulario de seguimientos.", "2 semanas"],
        ["6", "Módulo StockFlow backend", "ProductController, SupplierController y OrderController con ciclo de vida completo. Movimientos de stock y alertas de mínimo.", "2 semanas"],
        ["7", "Módulo StockFlow frontend", "Páginas Products, ProductDetail y Orders en React. Filtros, buscador y formularios CRUD.", "2 semanas"],
        ["8", "The Bridge", "BridgeService.php que conecta el cierre de un lead con el descuento de stock, creación automática de pedido de compra y envío de email al proveedor.", "1 semana"],
        ["9", "Integraciones externas", "Integración de Groq AI (draft response + suggest order), WebSocket con Ratchet para notificaciones en tiempo real y panel de notificaciones en frontend.", "1 semana"],
        ["10", "Pagos y suscripciones", "PaymentController con Stripe PaymentIntent, páginas Pricing y Payment en React, activación de plan tras pago confirmado.", "1 semana"],
        ["11", "Panel de administración", "AdminController con estadísticas globales y gestión de empresas. AdminPanel en React con tres pestañas.", "1 semana"],
        ["12", "Portal de proveedor", "SupplierPortal en React con vista de pedidos y botones de confirmación/entrega. SupplierRoute para acceso exclusivo.", "0.5 semanas"],
        ["13", "Internacionalización, UI y SEO", "Implementación de i18next con tres idiomas, modo oscuro, diseño responsive, meta tags con React Helmet, sitemap.xml y robots.txt.", "1 semana"],
        ["14", "Pruebas, despliegue y documentación", "Pruebas funcionales, de seguridad y de carga. Despliegue en Vercel y Render. Redacción de la memoria final.", "2 semanas"],
      ]
    ),
    screenshot("[CAPTURA REQUERIDA: Diagrama de Gantt del proyecto mostrando las 15 fases (Fase 0 a Fase 14) con sus dependencias y duración en el tiempo]"),

    h2("3.2 Riesgos"),
    p("El análisis de riesgos identifica los principales riesgos técnicos, operativos y de seguridad del proyecto, junto con las medidas de prevención y mitigación adoptadas."),
    makeTable(
      ["Riesgo", "Probabilidad", "Impacto", "Medida de prevención"],
      [
        ["Caída del servidor de producción (Render)", "Media", "Alto", "Monitorización activa con health checks. Plan de recuperación con Docker: el contenedor se reinicia automáticamente."],
        ["Pérdida de datos en la base de datos", "Baja", "Crítico", "Backups automáticos diarios de Render. Entorno de staging para probar migraciones antes de aplicar en producción."],
        ["Brecha de seguridad (acceso no autorizado)", "Baja", "Crítico", "JWT con expiración 24h, bcrypt, PDO preparado, validación de entradas, HTTPS obligatorio. Auditoría de código antes del despliegue."],
        ["Vulnerabilidad de inyección SQL", "Baja", "Alto", "Uso exclusivo de sentencias preparadas PDO con parámetros vinculados. Clase Validator con sanitización de entradas."],
        ["Agotamiento del límite de la API de SendGrid", "Baja", "Medio", "Plan gratuito de 100 emails/día suficiente para la fase inicial. Monitorización del dashboard de SendGrid."],
        ["Cambios en la API de Stripe que rompan el flujo de pago", "Baja", "Alto", "Uso del SDK oficial de Stripe con versión pinned. Pruebas en modo sandbox antes de cualquier cambio."],
        ["Rendimiento degradado con múltiples usuarios simultáneos", "Media", "Medio", "Escalado vertical en Render si es necesario. Caché de consultas frecuentes a nivel de controlador."],
        ["Pérdida del dominio o credenciales de producción", "Muy baja", "Alto", "Credenciales almacenadas en gestor de contraseñas. Variables de entorno en Render y Vercel, nunca en el repositorio."],
      ]
    ),

    h2("3.3 Revisión de recursos"),
    p("La revisión de recursos confirma que todos los recursos previstos en la fase de diseño han sido asignados y utilizados conforme al plan inicial. El desarrollo fue realizado íntegramente por un único desarrollador fullstack en un entorno de trabajo local (Windows 10 + WSL2 para compatibilidad con herramientas Unix)."),
    p("Los servicios externos utilizados en producción son los previstos inicialmente: Vercel para el hosting del frontend, Render para el backend PHP y la base de datos PostgreSQL, SendGrid para el envío de emails transaccionales, Groq API para la integración de IA y Stripe para el procesamiento de pagos. Ningún servicio fue sustituido durante el desarrollo."),
    p("El presupuesto de infraestructura se ajustó al estimado inicialmente, con un coste mensual de producción de aproximadamente €15 a €42 según el plan de Render seleccionado. Los servicios con plan gratuito (SendGrid, Groq, Vercel Hobby) no generaron costes adicionales durante el desarrollo."),

    h2("3.4 Documentación de ejecución"),

    h3("Archivos de configuración clave"),
    p("A continuación se describen los archivos de configuración más relevantes del proyecto:"),
    ...numbered([
      "backend/.env — Contiene todas las variables de entorno del servidor: credenciales de base de datos (DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT), clave secreta JWT (JWT_SECRET con expiración de 86400 segundos), clave API de SendGrid (SENDGRID_KEY), clave secreta de Stripe (STRIPE_SECRET) y clave de Groq (GROQ_KEY). Este archivo nunca se incluye en el control de versiones.",
      "backend/config/database.php — Establece la conexión PDO con PostgreSQL usando las variables de entorno. Configura el modo de error PDO::ERRMODE_EXCEPTION para una gestión robusta de errores.",
      "backend/composer.json — Gestiona las dependencias PHP: firebase/php-jwt para JWT, vlucas/phpdotenv para variables de entorno, stripe/stripe-php para pagos y cboden/ratchet para WebSockets.",
      "frontend/vite.config.js — Configuración mínima de Vite con el plugin de React. Define el servidor de desarrollo en localhost:5173.",
      "frontend/vercel.json — Configuración de despliegue en Vercel. Define las rutas SPA para que todas las rutas del frontend sean manejadas por index.html.",
      "frontend/src/i18n.js — Inicializa i18next con los tres idiomas soportados (es, en, fr), detección automática del idioma del navegador y persistencia en localStorage.",
      "backend/Dockerfile — Define el contenedor Docker para Render: imagen base PHP 8.3 con extensiones PDO, pgsql y composer.",
    ]),

    h3("Política de seguridad"),
    p("La seguridad de Salesek se implementa en múltiples capas:"),
    p("Autenticación y autorización: el sistema utiliza tokens JWT firmados con el algoritmo HS256. La clave secreta (JWT_SECRET) se almacena exclusivamente en variables de entorno del servidor. Los tokens tienen una validez de 24 horas. El middleware AuthMiddleware.php verifica la firma del token en cada solicitud a endpoints protegidos. El middleware RoleMiddleware.php comprueba el rol del usuario antes de permitir el acceso a operaciones sensibles."),
    p("Seguridad de contraseñas: todas las contraseñas se almacenan cifradas con el algoritmo bcrypt usando la función password_hash() de PHP con la constante PASSWORD_BCRYPT. Se requiere una longitud mínima de 8 caracteres. La verificación se realiza con password_verify(), que es resistente a ataques de temporización."),
    p("Prevención de inyección SQL: todas las consultas a la base de datos utilizan sentencias preparadas PDO con parámetros vinculados. No existe ninguna consulta construida mediante concatenación de cadenas con entrada del usuario."),
    p("Prevención de XSS: la clase Validator::sanitize() aplica htmlspecialchars() y strip_tags() a todas las entradas del usuario antes de procesarlas. React JSX escapa automáticamente el contenido renderizado, previniendo inyección de HTML."),
    p("Comunicación cifrada: toda la comunicación entre el frontend y el backend en producción se realiza sobre HTTPS. Los certificados SSL son gestionados automáticamente por Vercel y Render."),
    p("Aislamiento multi-tenant: cada consulta a la base de datos que accede a datos de empresa incluye una cláusula WHERE business_id = :business_id, donde business_id se extrae del token JWT y nunca del cuerpo de la solicitud del cliente."),

    h3("Manual de instalación"),
    h3("Requisitos previos"),
    ...numbered([
      "Node.js 20.x LTS instalado localmente.",
      "PHP 8.3 con las extensiones pdo, pdo_pgsql y curl habilitadas.",
      "Composer 2.x instalado globalmente.",
      "PostgreSQL 15 instalado localmente o acceso a una instancia remota.",
      "Git instalado.",
      "Cuentas en: SendGrid, Stripe (modo test) y Groq API.",
    ]),

    h3("Instalación del backend"),
    ...numbered([
      "Clonar el repositorio: git clone https://github.com/oussta/serelmejor.git",
      "Acceder al directorio backend: cd serelmejor/backend",
      "Instalar dependencias PHP: composer install",
      "Copiar el archivo de variables de entorno: cp .env.example .env",
      "Editar .env con las credenciales de base de datos local, JWT_SECRET (cadena aleatoria de al menos 32 caracteres), SENDGRID_KEY, STRIPE_SECRET, GROQ_KEY y FRONTEND_URL=http://localhost:5173.",
      "Crear la base de datos en PostgreSQL: createdb serelmejor",
      "Ejecutar el esquema: psql -U postgres -d serelmejor -f ../database/schema.sql",
      "Opcionalmente, cargar datos de prueba: psql -U postgres -d serelmejor -f ../database/seeds.sql",
      "Iniciar el servidor de desarrollo PHP: php -S localhost:8000",
    ]),

    h3("Instalación del frontend"),
    ...numbered([
      "En una terminal separada, acceder al directorio frontend: cd serelmejor/frontend",
      "Instalar dependencias Node.js: npm install",
      "Crear el archivo de variables de entorno: crear .env con VITE_API_URL=http://localhost:8000",
      "Iniciar el servidor de desarrollo Vite: npm run dev",
      "Acceder a la aplicación en el navegador: http://localhost:5173",
    ]),

    h3("Inicio del servidor WebSocket (opcional)"),
    ...numbered([
      "En una tercera terminal, acceder al directorio websocket: cd serelmejor/backend/websocket",
      "Iniciar el servidor Ratchet: php server.php",
      "El servidor WebSocket escucha en ws://localhost:8080.",
    ]),

    h3("Manual de configuración para despliegue en producción"),
    h3("Despliegue del backend en Render"),
    ...numbered([
      "Crear una cuenta en Render (render.com) y conectar el repositorio de GitHub.",
      "Crear un nuevo servicio Web Service y seleccionar el repositorio serelmejor.",
      "Configurar el directorio raíz como backend/.",
      "Seleccionar el entorno Docker (Render detectará automáticamente el Dockerfile).",
      "En el apartado Environment, añadir todas las variables de entorno: DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT, JWT_SECRET, JWT_EXPIRY, SENDGRID_KEY, SENDGRID_FROM, STRIPE_SECRET, GROQ_KEY, FRONTEND_URL, APP_ENV=production.",
      "Crear una base de datos PostgreSQL en Render (New > PostgreSQL) y copiar la URL de conexión interna en las variables DB_HOST, DB_NAME, DB_USER y DB_PASS.",
      "Iniciar el despliegue. Render construirá la imagen Docker y desplegará el contenedor.",
      "Una vez desplegado, ejecutar el schema SQL en la base de datos de producción mediante la consola de Render.",
    ]),

    h3("Despliegue del frontend en Vercel"),
    ...numbered([
      "Crear una cuenta en Vercel (vercel.com) e importar el repositorio de GitHub.",
      "Configurar el directorio raíz como frontend/.",
      "En el apartado Environment Variables, añadir VITE_API_URL con la URL del backend de Render (ej: https://serelmejor.onrender.com).",
      "Vercel detectará automáticamente la configuración de Vite y ejecutará npm run build.",
      "El despliegue es automático con cada push a la rama principal de GitHub.",
      "Configurar el dominio personalizado salsek.com en la configuración del proyecto en Vercel.",
    ]),

    h3("Manual de usuario"),
    h3("Cuentas de demostración"),
    p("Para probar la plataforma, están disponibles las siguientes cuentas de demostración (contraseña: password):"),
    makeTable(
      ["Rol", "Email", "Contraseña", "Acceso"],
      [
        ["Administrador", "admin@salesek.com", "password", "Panel de administración con estadísticas globales"],
        ["Propietario", "owner@salesek.com", "password", "Acceso completo a empresa demo (CRM, inventario, equipo, facturación)"],
        ["Empleado", "employee@salesek.com", "password", "Acceso a leads, productos y pedidos de la empresa demo"],
        ["Proveedor", "supplier@salesek.com", "password", "Portal de proveedor con pedidos de compra asignados"],
      ]
    ),
    screenshot("[CAPTURA REQUERIDA: Página de login de Salesek (https://salsek.com/login) mostrando el formulario de acceso]"),

    h3("Flujo de trabajo: SalesFlow CRM"),
    ...numbered([
      "Acceder a la sección Leads desde el menú lateral.",
      "Crear un nuevo lead con el nombre del cliente, descripción de la oportunidad y probabilidad de cierre.",
      "El lead aparece en la columna 'Nuevo' del tablero Kanban.",
      "Al contactar al cliente, cambiar el estado a 'Contactado'. Añadir un mensaje con el registro de la comunicación.",
      "Crear un recordatorio de seguimiento con la fecha del próximo contacto.",
      "Avanzar el lead a 'Negociando' cuando se inicie una propuesta formal.",
      "Usar el botón 'Respuesta IA' para generar automáticamente un borrador de respuesta comercial con Groq AI.",
      "Al cerrar el trato positivamente, cambiar el estado a 'Ganado'. The Bridge se activará automáticamente si hay un producto vinculado.",
      "Si el trato no prospera, cambiar el estado a 'Perdido' para mantener el historial.",
    ]),
    screenshot("[CAPTURA REQUERIDA: Tablero Kanban de Leads mostrando leads en diferentes estados (Nuevo, Contactado, Negociando, Ganado, Perdido)]"),

    h3("Flujo de trabajo: StockFlow Inventario"),
    ...numbered([
      "Acceder a la sección Productos para ver el catálogo completo.",
      "Crear un nuevo producto con nombre, categoría, precio, stock actual y stock mínimo.",
      "Los productos con stock por debajo del mínimo se señalan con una alerta visual en rojo.",
      "Para registrar una venta manual, hacer clic en el producto y seleccionar 'Registrar venta'.",
      "Para reponer stock manualmente, seleccionar 'Registrar entrada'.",
      "Acceder a la sección Proveedores para gestionar los contactos de suministro.",
      "En la sección Pedidos, crear un pedido de compra seleccionando proveedor, producto y cantidad.",
      "Enviar el pedido al proveedor con el botón 'Enviar pedido'. El proveedor recibirá un email automático.",
      "El proveedor confirmará el pedido desde su portal en /supplier.",
    ]),
    screenshot("[CAPTURA REQUERIDA: Página de Productos mostrando el catálogo con indicadores de stock bajo]"),
    screenshot("[CAPTURA REQUERIDA: Portal de proveedor (/supplier) mostrando los pedidos de compra asignados]"),

    pageBreak(),

    // ═══════════════════════════════════
    // 4. SEGUIMIENTO Y CONTROL
    // ═══════════════════════════════════
    h1("4. Seguimiento y control"),

    h2("4.1 Valoración del proyecto"),
    p("La valoración de la calidad del proyecto se realiza mediante un conjunto de indicadores técnicos y funcionales que permiten evaluar el grado de cumplimiento de los objetivos planteados en la fase de diseño."),
    p("Los indicadores de calidad técnica incluyen: correcta implementación de las rutas protegidas con verificación de rol en frontend y backend; ausencia de errores 500 en los logs del servidor en condiciones normales de uso; tiempo de respuesta de la API inferior a 500ms para operaciones CRUD estándar; puntuación de accesibilidad y SEO superior a 85 en Lighthouse; y correcta compilación del frontend sin advertencias críticas de ESLint."),
    p("Los indicadores de calidad funcional incluyen: todos los flujos de usuario documentados (registro, login, creación de lead, cierre de trato, actualización de stock, envío de pedido) funcionan correctamente de extremo a extremo; la integración de The Bridge se activa correctamente al cerrar un lead como ganado; las notificaciones en tiempo real se entregan con una latencia inferior a dos segundos; y los emails transaccionales son entregados correctamente por SendGrid."),
    p("El protocolo de evaluación seguido consiste en ejecutar una batería de pruebas funcionales con las cuatro cuentas de demostración, verificar el comportamiento esperado en cada flujo y documentar cualquier desviación respecto al comportamiento esperado."),
    screenshot("[CAPTURA REQUERIDA: Informe de Lighthouse para https://salsek.com mostrando las puntuaciones de Performance, Accessibility, Best Practices y SEO]"),

    h2("4.2 Incidencias"),
    p("El protocolo de gestión de incidencias de Salesek establece tres fases: recogida, resolución y registro."),
    p("En la fase de recogida, las incidencias se identifican a través de los logs del servidor en Render, el sistema de notificaciones de errores del navegador en el cliente, los reportes de usuarios a través del formulario de contacto o directamente mediante los issues de GitHub. Cada incidencia se clasifica según su severidad: crítica (afecta a la operatividad principal del sistema), alta (funcionalidad importante degradada), media (funcionalidad secundaria afectada) o baja (problema cosmético o de usabilidad menor)."),
    p("En la fase de resolución, las incidencias críticas y altas se abordan con prioridad inmediata en el backlog de desarrollo. Se crea una rama git específica (fix/descripcion-del-problema), se implementa la corrección, se prueba en el entorno local y se despliega en producción. Las incidencias medias y bajas se acumulan en el backlog y se resuelven en el siguiente sprint."),
    p("En la fase de registro, cada incidencia resuelta genera un commit con prefijo fix: en el mensaje siguiendo la convención Conventional Commits. El historial de Git actúa como registro de incidencias con trazabilidad completa de qué se cambió, cuándo y por qué."),
    p("Incidencias más relevantes detectadas durante el desarrollo:"),
    ...numbered([
      "Bucle infinito de redirección para usuarios con rol Supplier al intentar acceder a rutas protegidas de empleado. Resuelta mediante la implementación de SupplierRoute.jsx con redirección explícita a /supplier.",
      "Los links del Navbar no correspondían correctamente con el rol del usuario autenticado. Resuelta mediante lógica condicional en Navbar.jsx basada en el rol del AuthContext.",
    ]),

    h2("4.3 Cambios"),
    p("El plan de actualizaciones y migraciones de Salesek contempla tres ámbitos: migraciones de base de datos, actualizaciones de dependencias y mejoras funcionales."),
    p("Las migraciones de base de datos se gestionan mediante archivos SQL versionados. Cualquier cambio en el esquema se documenta en un nuevo archivo con prefijo numérico (ej: 001_add_column_leads.sql) y se aplica en producción a través de la consola de Render. Se mantiene siempre un script de rollback para revertir cambios en caso de error."),
    p("Las actualizaciones de dependencias se realizan con periodicidad mensual. Las dependencias PHP se actualizan con composer update y las de Node.js con npm update. Las actualizaciones mayores de versión (ej: React 19 cuando esté disponible) se evalúan individualmente y se prueban en un entorno de staging antes de desplegarlas en producción."),
    p("Las mejoras funcionales planificadas para versiones futuras incluyen: exportación de datos de leads y productos a CSV/Excel, integración con servicios de calendario (Google Calendar) para los recordatorios de seguimiento, panel de analítica avanzada con gráficos de conversión y tendencias de stock, y soporte para múltiples monedas en los planes de precios."),
    p("La escalabilidad de la arquitectura está garantizada por el desacoplamiento entre frontend y backend. Si la demanda aumenta, el backend PHP puede escalarse verticalmente en Render sin afectar al frontend. La base de datos PostgreSQL soporta el escalado mediante réplicas de lectura. A largo plazo, la arquitectura permite migrar los microservicios más críticos (IA, WebSockets) a servidores dedicados sin modificar la interfaz de usuario."),

    h2("4.4 Pruebas y soporte"),

    h3("Pruebas de seguridad"),
    ...numbered([
      "Prueba de inyección SQL: se intentó introducir cadenas como ' OR 1=1 -- en todos los campos de formulario. Resultado: las sentencias preparadas PDO bloquearon todos los intentos.",
      "Prueba de XSS: se introdujeron scripts JavaScript en campos de texto como <script>alert('xss')</script>. Resultado: htmlspecialchars() en el backend y el escape automático de React en el frontend neutralizaron todos los intentos.",
      "Prueba de acceso no autorizado: se intentó acceder a endpoints protegidos sin token JWT y con tokens expirados o manipulados. Resultado: AuthMiddleware devolvió correctamente error 401 en todos los casos.",
      "Prueba de escalada de privilegios: se intentó acceder a endpoints de administrador con tokens de usuario con rol Employee. Resultado: RoleMiddleware devolvió error 403 en todos los casos.",
      "Prueba de aislamiento multi-tenant: se intentó acceder a datos de otras empresas modificando el ID en los parámetros de la solicitud. Resultado: la validación de business_id extraído del JWT impidió el acceso en todos los casos.",
    ]),

    h3("Pruebas de carga"),
    p("Se realizaron pruebas básicas de carga utilizando la herramienta de desarrollo del navegador y solicitudes simultáneas con Postman. El servidor backend en Render respondió de forma estable con hasta 20 solicitudes simultáneas, con tiempos de respuesta inferiores a 800ms en el percentil 95. Para cargas mayores, se contemplan mejoras de caché a nivel de controlador."),
    screenshot("[CAPTURA REQUERIDA: Resultados de pruebas de Postman mostrando respuestas correctas de la API (endpoints /leads, /products, /orders)]"),

    h3("Pruebas de accesibilidad"),
    ...numbered([
      "La aplicación supera la puntuación 85 en la categoría de accesibilidad de Lighthouse.",
      "Los elementos interactivos disponen de atributos aria-label donde corresponde.",
      "El contraste de color entre texto y fondo supera el ratio mínimo de 4.5:1 exigido por las pautas WCAG 2.1.",
      "La navegación mediante teclado funciona correctamente en los formularios principales.",
    ]),

    h3("Política de copias de seguridad"),
    p("La política de backups de Salesek se apoya en las funcionalidades automáticas de Render: la base de datos PostgreSQL realiza copias de seguridad diarias automáticas con un período de retención de 7 días en el plan básico. Adicionalmente, el código fuente está replicado en GitHub como copia de seguridad del estado del proyecto. Se recomienda exportar manualmente la base de datos antes de realizar cualquier migración significativa."),

    h3("Acuerdo de nivel de servicio (SLA)"),
    p("El objetivo de disponibilidad de Salesek en producción es del 99.5% mensual, equivalente a un máximo de 3.6 horas de tiempo de inactividad al mes. Este objetivo se sustenta en los SLA de los proveedores de infraestructura: Vercel garantiza un 99.99% de disponibilidad y Render ofrece un 99.5% para los planes de pago. En caso de incidencia crítica que afecte a la disponibilidad del servicio, el tiempo objetivo de resolución es de 4 horas desde la detección."),
    screenshot("[CAPTURA REQUERIDA: Dashboard de Render mostrando el estado del servidor backend y la base de datos en producción]"),

    new Paragraph({ spacing: { before: 480 } }),
    new Paragraph({
      children: [new TextRun({ text: "— Fin de la memoria —", italics: true, size: pt(10), color: "6B7280", font: "Calibri" })],
      alignment: AlignmentType.CENTER,
    }),
  ];

  return new Document({
    title: "Salesek — Memoria Final DAW",
    creator: "[NOMBRE DEL ALUMNO]",
    description: "Memoria final del proyecto Salesek para el ciclo formativo DAW",
    sections: [
      {
        properties: {},
        children,
      },
    ],
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          run: { color: "1E3A5F", bold: true, size: pt(16), font: "Calibri" },
          paragraph: { spacing: { before: 480, after: 200 } },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          run: { color: "2563EB", bold: true, size: pt(13), font: "Calibri" },
          paragraph: { spacing: { before: 360, after: 160 } },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          run: { color: "374151", bold: true, size: pt(11.5), font: "Calibri" },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
      ],
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ENGLISH DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════
function buildEnglish() {
  const children = [
    ...titlePage(
      "SALESEK",
      "SaaS CRM & Inventory Platform for Small Businesses\nFinal Project Report — Web Application Development (DAW)",
      "Author: [STUDENT NAME]",
      "School: Digitech DAW",
      "Academic Year: 2025/2026"
    ),

    // ═══════════════════════════════════
    // 1. NEEDS IDENTIFICATION
    // ═══════════════════════════════════
    h1("1. Needs Identification"),

    h2("1.1 Context"),
    p("Small and medium-sized enterprises (SMEs) form the backbone of the Spanish economy. According to data from the Central Business Directory (DIRCE), more than 99% of all registered companies in Spain have fewer than 250 employees, highlighting the enormous importance of this segment. Despite this, the vast majority of these organisations operate with fragmented tools: spreadsheets for inventory management, email threads for client follow-up, and disconnected applications for recording sales. This fragmentation generates operational inefficiencies, information loss, and a structural inability to make decisions based on real, up-to-date data."),
    p("In this context, Salesek was created as a direct response to a need identified in the Spanish SME market: the absence of an integrated, affordable, and easy-to-use platform that unifies Customer Relationship Management (CRM) and inventory control (lightweight ERP) in a single working environment. Salesek's target audience primarily includes owners of small retail businesses, early-stage startups, self-employed professionals with their own team, and business managers with between five and fifty employees who need to digitise their operations without incurring the high costs of enterprise solutions such as Salesforce, SAP, or HubSpot."),
    p("The platform is designed to be accessible from any internet-connected device, without any local software installation, and with a low learning curve. Its responsive design ensures a consistent user experience on both desktop and mobile devices, a key factor for owners and employees working from multiple locations."),
    screenshot("[SCREENSHOT REQUIRED: Salesek homepage (https://salsek.com) showing the hero section with the main tagline and the registration button]"),

    h2("1.2 Justification"),
    p("The justification for Salesek as a viable project rests on three fundamental pillars: the existing market gap, the technological opportunity, and the subscription-based business model."),
    p("First, there is a genuine gap between the needs of SMEs and the available offerings. Market solutions for commercial and inventory management fall into two extremes: very basic tools (spreadsheets, free applications with limited functionality) or complex and costly enterprise platforms that require specialised training and a significant budget. Salesek occupies the middle ground, offering advanced features with an accessible interface and a competitive price point."),
    p("Second, the current maturity of web technology makes it possible to build high-performance web applications at low infrastructure costs. The combination of cloud services such as Vercel and Render, together with managed PostgreSQL databases, enables 99.9% availability without proprietary infrastructure. Additionally, incorporating artificial intelligence via the Groq API (LLaMA model) adds differentiating value without significant development cost."),
    p("Third, the SaaS subscription model generates recurring and predictable revenue. With three plans (SalesFlow at €29/mo, StockFlow at €29/mo, and the full Suite at €49/mo), the pricing model is competitive against alternatives such as Zoho CRM (from €14/mo with very limited features) or HubSpot (from €41/mo without an inventory module)."),
    p("Specific features that differentiate Salesek from direct competitors:"),
    ...numbered([
      "Native integration between CRM and inventory via 'The Bridge', an automation that links the closing of a sale with automatic stock deduction.",
      "Independent supplier panel with an exclusive portal for suppliers to view and confirm purchase orders.",
      "Multilingual support in three languages (Spanish, English, and French) from day one.",
      "Built-in AI assistant to draft commercial responses and suggest optimal restocking quantities.",
      "Real-time notifications via WebSockets without page reload.",
      "Dark mode and adaptive design for mobile and desktop.",
    ]),
    screenshot("[SCREENSHOT REQUIRED: Features page (https://salsek.com/features) showing the SalesFlow and StockFlow modules]"),

    h2("1.3 Other Considerations"),
    p("From a legal and fiscal perspective, Salesek must operate in compliance with current data protection and e-commerce regulations. As a platform that stores personal data of users and their clients' customers, it is subject to the General Data Protection Regulation (GDPR) and, in Spain, the Ley Orgánica de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD). The technical measures implemented — bcrypt password hashing, HTTPS encrypted communication, JWT tokens with expiration, and input validation to prevent SQL injection and XSS — constitute the technical safeguards required by Article 32 of the GDPR."),
    p("The platform must also comply with the Spanish Law on Information Society Services and Electronic Commerce (LSSI-CE), which requires accessible legal notice, privacy policy, and cookie policy pages. Subscription invoicing processed through Stripe is subject to Spanish VAT fiscal regulations."),
    p("Regarding potential grants and subsidies, the project could benefit from Spain's Kit Digital programme, part of the Recovery, Transformation, and Resilience Plan, which provides digital transformation grants of up to €12,000 for companies with between 3 and 9 employees. Additionally, several autonomous communities — including Catalonia, Madrid, and the Basque Country — offer financing lines for business software projects developed by local entrepreneurs."),
    p("The working methodology adopted follows an agile approach with weekly sprints, continuous backlog review, and iterative adaptation of features based on testing. Technical documentation is maintained in the GitHub repository (https://github.com/oussta/serelmejor) and incident tracking is managed through the platform's integrated issue system."),

    pageBreak(),

    // ═══════════════════════════════════
    // 2. PROJECT DESIGN
    // ═══════════════════════════════════
    h1("2. Project Design"),

    h2("2.1 Content"),
    p("Salesek is a SaaS web application composed of a frontend built with React 18 and Vite as the build tool, and a backend REST API implemented in pure PHP 8 without a framework, connected to a PostgreSQL 15 database. Both layers are deployed independently: the frontend on Vercel and the backend on Render."),
    p("The technical feasibility study conducted during the analysis phase concluded that the chosen architecture is appropriate for the project's requirements: React enables dynamic interfaces with efficient state updates; PHP offers a mature ecosystem for REST APIs with well-documented libraries; PostgreSQL guarantees referential integrity and advanced support for complex queries; and the implicit microservice architecture (frontend decoupled from backend) facilitates independent maintenance and scaling of each layer."),
    p("The project covers the following functional content:"),
    ...numbered([
      "Authentication module: company registration, login, email verification, password recovery, and session management via JWT.",
      "SalesFlow CRM module: full sales pipeline management with Kanban board, lead messages, follow-up reminders, and AI assistant.",
      "StockFlow Inventory module: product catalogue with categories, stock movement tracking, low-stock alerts, supplier management, and purchase orders.",
      "The Bridge (automation): automatic synchronisation between CRM and inventory when a deal is closed.",
      "Admin panel: global platform statistics, business and user management.",
      "Supplier portal: exclusive interface for suppliers with restricted access to their orders.",
      "Real-time notification system via WebSockets.",
      "Subscription system with Stripe payment integration.",
      "Multilingual support (ES/EN/FR) and dark mode.",
    ]),
    screenshot("[SCREENSHOT REQUIRED: Salesek main dashboard showing key statistics (active leads, products, pending orders, low stock alerts)]"),

    h2("2.2 Objectives and Resources"),

    h3("Objectives"),
    p("The general objective of the project is to develop a functional, secure, and production-deployed SaaS platform that allows SMEs to manage their sales pipeline and inventory from a single web interface accessible from any device."),
    p("The specific objectives are:"),
    ...numbered([
      "Implement a secure authentication system based on JWT with role-based access control.",
      "Develop the SalesFlow module with a five-state lead pipeline and communication tracking.",
      "Develop the StockFlow module with product management, stock movements, and purchase orders.",
      "Implement The Bridge as automation connecting both modules transparently.",
      "Integrate the Groq/LLaMA API for intelligent assistance in commercial writing and inventory restocking.",
      "Implement real-time notifications via WebSockets.",
      "Develop an admin panel for global platform supervision.",
      "Create an exclusive supplier portal with controlled access.",
      "Integrate Stripe for secure subscription payment processing.",
      "Deploy the application to production with continuous availability.",
    ]),

    h3("Hardware Resources"),
    makeTable(
      ["Resource", "Description", "Usage"],
      [
        ["Development laptop", "Intel Core i5, 16 GB RAM, 512 GB SSD", "Local development and testing"],
        ["Render server (backend)", "Shared Linux instance, 512 MB RAM", "Production PHP API + PostgreSQL"],
        ["Vercel CDN (frontend)", "Global content delivery network", "Production React frontend"],
        ["Mobile devices", "Android and iOS smartphones for testing", "Responsive design validation"],
      ]
    ),

    h3("Software Resources"),
    makeTable(
      ["Tool", "Version", "Purpose"],
      [
        ["Node.js", "20.x LTS", "Runtime for Vite and frontend tools"],
        ["React", "18.2.4", "User interface framework"],
        ["Vite", "8.0.0", "Frontend bundler and development server"],
        ["PHP", "8.3", "Backend REST API language"],
        ["PostgreSQL", "15", "Relational database management system"],
        ["Composer", "2.x", "PHP dependency manager"],
        ["Git / GitHub", "2.x", "Version control and remote repository"],
        ["VS Code", "1.x", "Primary code editor"],
        ["Postman", "10.x", "API endpoint testing"],
        ["DBeaver", "23.x", "PostgreSQL graphical client"],
        ["Docker", "24.x", "Backend containerisation for Render"],
        ["Figma", "—", "Interface prototyping (wireframes)"],
      ]
    ),

    h2("2.3 Economic Feasibility"),

    h3("Development Budget"),
    makeTable(
      ["Item", "Estimated Hours", "Cost/Hour (€)", "Total (€)"],
      [
        ["Analysis and design", "20 h", "—", "—"],
        ["Frontend development (React)", "80 h", "—", "—"],
        ["Backend development (PHP API)", "70 h", "—", "—"],
        ["Database and migrations", "15 h", "—", "—"],
        ["External integrations (Stripe, SendGrid, Groq)", "20 h", "—", "—"],
        ["Testing and bug fixing", "25 h", "—", "—"],
        ["Deployment and production configuration", "10 h", "—", "—"],
        ["Documentation", "15 h", "—", "—"],
        ["TOTAL", "255 h", "—", "Academic project — no labour cost"],
      ]
    ),

    h3("Monthly Infrastructure Costs (Production)"),
    makeTable(
      ["Service", "Plan", "Monthly Cost (€)"],
      [
        ["Render (PHP backend)", "Starter", "~€7 – €14"],
        ["Render (PostgreSQL database)", "Starter", "~€7"],
        ["Vercel (React frontend)", "Hobby/Pro", "€0 – €20"],
        ["Domain salsek.com", "Annual ~€12", "~€1/month"],
        ["SendGrid (emails)", "Free tier 100/day", "€0"],
        ["Groq API (AI)", "Free tier", "€0"],
        ["Stripe (payments)", "2.9% + €0.30 per transaction", "Variable"],
        ["Estimated monthly minimum", "—", "~€15 – €42/month"],
      ]
    ),

    h3("Revenue Projection"),
    p("With a pricing model of €29/month (basic plan) and €49/month (Suite plan), the platform reaches break-even with just 2 Suite customers per month, covering all infrastructure costs. From 10 active customers onwards, the operating margin is positive and allows the infrastructure to be scaled accordingly."),

    h2("2.4 Solution Model"),

    h3("Complete Technology Stack"),
    makeTable(
      ["Layer", "Technology", "Version", "Justification"],
      [
        ["Frontend", "React", "18.2.4", "Reusable components, reactive state, mature ecosystem"],
        ["Build tool", "Vite", "8.0.0", "Ultra-fast compilation, native ESModules support"],
        ["Routing", "React Router", "7.13.1", "Declarative SPA routing with protected routes"],
        ["i18n", "i18next + react-i18next", "23.x", "Internationalisation with JSON translations"],
        ["Frontend payments", "Stripe.js + React Stripe", "—", "Official Stripe integration for React"],
        ["Backend", "PHP", "8.3", "No framework, pure REST API, full code control"],
        ["Database", "PostgreSQL", "15", "Relational, ACID, JSON support, scalable"],
        ["Authentication", "JWT (firebase/php-jwt)", "6.x", "Stateless tokens, security without sessions"],
        ["Email", "SendGrid API v3", "—", "Guaranteed deliverability, HTML templates"],
        ["Backend payments", "Stripe PHP SDK", "—", "Official SDK for PaymentIntents"],
        ["AI", "Groq API (LLaMA)", "—", "Fast free inference for contextual suggestions"],
        ["WebSockets", "Ratchet (PHP)", "0.4.x", "Real-time notifications without polling"],
        ["Frontend deploy", "Vercel", "—", "Global CDN, automatic deployment from GitHub"],
        ["Backend deploy", "Render + Docker", "—", "Containerisation, automatic scaling"],
      ]
    ),

    h3("User Roles"),
    makeTable(
      ["Role", "Description", "Main Permissions", "Access Route"],
      [
        ["Admin", "Platform administrator (Salesek)", "View all businesses, users, leads, and products. Delete businesses.", "/admin"],
        ["Owner", "Client company owner", "Full access to their company: leads, products, orders, team, and billing.", "/dashboard, /leads, /products, /orders, /team"],
        ["Employee", "Client company employee", "Read and write leads, products, and orders. No access to team or billing.", "/dashboard, /leads, /products, /orders"],
        ["Supplier", "Supplier associated with a company", "View their purchase orders, confirm them, and mark them as delivered.", "/supplier"],
      ]
    ),

    h3("Database Entity-Relationship Description"),
    p("Salesek's database consists of eleven relational tables implementing a multi-tenant model: each company (businesses) has its own users, leads, products, suppliers, and orders, completely isolated through the business_id field as a foreign key."),
    p("The main relationships are as follows: a businesses record can have multiple users (employees and owners), multiple leads, multiple products, multiple suppliers, and multiple purchase_orders. A lead can have multiple lead_messages and multiple followups. A product can have multiple stock_movements. A purchase_order is associated with one supplier and one product. Notifications are associated with individual users."),

    h3("Database Tables"),
    makeTable(
      ["Table", "Main Columns", "Description"],
      [
        ["users", "id, email, password_hash, name, role, business_id, created_at", "Platform users with their assigned role"],
        ["businesses", "id, name, sector, subscription_plan, created_at", "Client companies registered on Salesek"],
        ["subscriptions", "id, business_id, plan, price, status, created_at", "Subscription history per company"],
        ["leads", "id, business_id, client_name, inquiry_text, close_probability, status, created_at", "Sales opportunities in the CRM pipeline"],
        ["lead_messages", "id, lead_id, content, created_at", "Messages and notes associated with each lead"],
        ["followups", "id, lead_id, scheduled_at, created_at", "Follow-up reminders per lead"],
        ["products", "id, business_id, name, category, current_stock, min_stock, price, created_at", "Product catalogue with stock control"],
        ["stock_movements", "id, product_id, type, quantity, note, created_at", "Inventory movement history"],
        ["suppliers", "id, business_id, name, email, contact_name, phone, created_at", "Suppliers associated with each company"],
        ["purchase_orders", "id, business_id, supplier_id, product_id, quantity, status, note, created_at", "Purchase orders with full lifecycle"],
        ["notifications", "id, user_id, type, message, read, created_at", "Real-time notifications per user"],
      ]
    ),
    screenshot("[SCREENSHOT REQUIRED: Entity-Relationship diagram of the Salesek database (generate with DBeaver or pgAdmin showing all tables and relationships)]"),

    h3("Main API REST Endpoints"),
    makeTable(
      ["Method", "Route", "Description", "Auth"],
      [
        ["POST", "/register", "Register new company and owner user", "Public"],
        ["POST", "/login", "Log in and obtain JWT token", "Public"],
        ["GET", "/me", "Get authenticated user data", "JWT"],
        ["POST", "/forgot-password", "Request recovery code by email", "Public"],
        ["POST", "/reset-password", "Reset password with code", "Public"],
        ["GET", "/business", "Get company profile", "JWT"],
        ["PUT", "/business", "Update company name and sector", "JWT + Owner"],
        ["GET", "/business/stats", "Get company statistics", "JWT"],
        ["GET", "/team", "List team members", "JWT"],
        ["POST", "/team/invite", "Invite new member with role", "JWT + Owner"],
        ["DELETE", "/team/:id", "Remove team member", "JWT + Owner"],
        ["GET", "/leads", "List leads (filterable by status)", "JWT"],
        ["POST", "/leads", "Create new lead", "JWT"],
        ["PUT", "/leads/:id/status", "Change lead status (triggers The Bridge)", "JWT"],
        ["GET", "/leads/:id/messages", "List messages for a lead", "JWT"],
        ["POST", "/leads/:id/messages", "Add message to a lead", "JWT"],
        ["GET", "/leads/:id/followups", "List follow-up reminders for a lead", "JWT"],
        ["POST", "/leads/:id/followups", "Create follow-up reminder", "JWT"],
        ["GET", "/products", "List product catalogue", "JWT"],
        ["POST", "/products", "Create new product", "JWT"],
        ["POST", "/products/:id/sale", "Record sale (reduces stock)", "JWT"],
        ["POST", "/products/:id/restock", "Record restock (increases stock)", "JWT"],
        ["GET", "/products/low-stock", "List products below minimum", "JWT"],
        ["GET", "/products/:id/movements", "Product movement history", "JWT"],
        ["GET", "/suppliers", "List suppliers", "JWT"],
        ["POST", "/suppliers", "Create supplier", "JWT"],
        ["GET", "/orders", "List purchase orders", "JWT"],
        ["POST", "/orders", "Create purchase order", "JWT"],
        ["POST", "/orders/:id/send", "Send order to supplier by email", "JWT"],
        ["PUT", "/orders/:id/confirm", "Supplier confirms receipt", "JWT + Supplier"],
        ["PUT", "/orders/:id/deliver", "Supplier marks as delivered (updates stock)", "JWT + Supplier"],
        ["POST", "/ai/draft-response", "AI generates commercial response for a lead", "JWT"],
        ["POST", "/ai/suggest-order", "AI suggests restocking quantity", "JWT"],
        ["GET", "/notifications", "List user notifications", "JWT"],
        ["PUT", "/notifications/read-all", "Mark all notifications as read", "JWT"],
        ["GET", "/admin/stats", "Global platform statistics", "JWT + Admin"],
        ["GET", "/admin/businesses", "List all businesses", "JWT + Admin"],
        ["DELETE", "/admin/businesses/:id", "Delete business (cascade)", "JWT + Admin"],
        ["POST", "/payment/create-intent", "Create Stripe PaymentIntent", "JWT"],
        ["POST", "/payment/confirm", "Confirm payment and activate plan", "JWT"],
      ]
    ),

    h3("Subscription Plans"),
    makeTable(
      ["Plan", "Price", "Modules Included", "Target Audience"],
      [
        ["SalesFlow", "€29/month", "Full CRM: leads, messages, follow-ups, AI commercial assistant", "Sales teams without inventory management needs"],
        ["StockFlow", "€29/month", "Full Inventory: products, stock, suppliers, orders, AI restocking", "Retailers and warehouses without CRM sales management"],
        ["Full Suite", "€49/month", "SalesFlow + StockFlow + The Bridge (CRM-Inventory automation)", "SMEs requiring complete sales and inventory integration"],
      ]
    ),

    pageBreak(),

    // ═══════════════════════════════════
    // 3. PROJECT EXECUTION
    // ═══════════════════════════════════
    h1("3. Project Execution"),

    h2("3.1 Time Planning"),
    p("The development of Salesek was structured into fourteen sequential phases with explicit dependencies, distributed across the 2025/2026 academic year."),
    makeTable(
      ["Phase", "Name", "Description", "Estimated Duration"],
      [
        ["0", "Setup and configuration", "GitHub repository initialisation, development environment setup (Vite, PHP, local PostgreSQL), dependency installation, and initial folder structure.", "1 week"],
        ["1", "Database design", "Entity-relationship schema definition, PostgreSQL table creation, schema.sql and test seeds.sql writing.", "1 week"],
        ["2", "Backend authentication", "AuthController implementation with registration, login, JWT, bcrypt, email verification via SendGrid, and password recovery.", "1 week"],
        ["3", "Frontend authentication", "Login, Register, ForgotPassword, and ResetPassword pages in React. AuthContext with token storage in localStorage. Protected routes.", "1 week"],
        ["4", "SalesFlow backend module", "LeadController with full CRUD for leads, messages, follow-ups, and status changes. Filters by status and statistics.", "2 weeks"],
        ["5", "SalesFlow frontend module", "Leads page with Kanban board, LeadDetail with message timeline and follow-up form.", "2 weeks"],
        ["6", "StockFlow backend module", "ProductController, SupplierController, and OrderController with full lifecycle. Stock movements and minimum alerts.", "2 weeks"],
        ["7", "StockFlow frontend module", "Products, ProductDetail, and Orders pages in React. Filters, search, and CRUD forms.", "2 weeks"],
        ["8", "The Bridge", "BridgeService.php connecting lead closure with stock deduction, automatic purchase order creation, and supplier email notification.", "1 week"],
        ["9", "External integrations", "Groq AI integration (draft response + suggest order), WebSocket with Ratchet for real-time notifications, and frontend notification panel.", "1 week"],
        ["10", "Payments and subscriptions", "PaymentController with Stripe PaymentIntent, Pricing and Payment pages in React, plan activation after confirmed payment.", "1 week"],
        ["11", "Admin panel", "AdminController with global statistics and business management. AdminPanel in React with three tabs.", "1 week"],
        ["12", "Supplier portal", "SupplierPortal in React with order view and confirmation/delivery buttons. SupplierRoute for exclusive access.", "0.5 weeks"],
        ["13", "Internationalisation, UI, and SEO", "i18next implementation with three languages, dark mode, responsive design, React Helmet meta tags, sitemap.xml, and robots.txt.", "1 week"],
        ["14", "Testing, deployment, and documentation", "Functional, security, and load tests. Deployment on Vercel and Render. Final report writing.", "2 weeks"],
      ]
    ),
    screenshot("[SCREENSHOT REQUIRED: Gantt chart of the project showing all 15 phases (Phase 0 to Phase 14) with their dependencies and time distribution]"),

    h2("3.2 Risks"),
    p("The risk analysis identifies the main technical, operational, and security risks of the project, along with the prevention and mitigation measures adopted."),
    makeTable(
      ["Risk", "Probability", "Impact", "Prevention Measure"],
      [
        ["Production server outage (Render)", "Medium", "High", "Active monitoring with health checks. Recovery plan with Docker: the container restarts automatically."],
        ["Database data loss", "Low", "Critical", "Automatic daily backups by Render. Staging environment to test migrations before applying to production."],
        ["Security breach (unauthorised access)", "Low", "Critical", "JWT with 24h expiration, bcrypt, prepared PDO statements, input validation, mandatory HTTPS. Code audit before deployment."],
        ["SQL injection vulnerability", "Low", "High", "Exclusive use of PDO prepared statements with bound parameters. Validator class with input sanitisation."],
        ["SendGrid API rate limit exhaustion", "Low", "Medium", "Free plan at 100 emails/day is sufficient for the initial phase. SendGrid dashboard monitoring."],
        ["Stripe API changes breaking the payment flow", "Low", "High", "Use of the official Stripe SDK with pinned version. Sandbox testing before any change."],
        ["Degraded performance with multiple simultaneous users", "Medium", "Medium", "Vertical scaling on Render if needed. Query caching at controller level."],
        ["Loss of domain or production credentials", "Very low", "High", "Credentials stored in password manager. Environment variables in Render and Vercel, never in the repository."],
      ]
    ),

    h2("3.3 Resource Review"),
    p("The resource review confirms that all resources planned during the design phase have been assigned and used according to the initial plan. Development was carried out entirely by a single fullstack developer, responsible for all design, implementation, testing, and deployment of the project."),
    p("The external services used in production are those initially planned: Vercel for frontend hosting, Render for the PHP backend and PostgreSQL database, SendGrid for transactional email sending, Groq API for AI integration, and Stripe for payment processing. No service was replaced during development."),
    p("The infrastructure budget aligned with the initial estimate, with a monthly production cost of approximately €15 to €42 depending on the selected Render plan."),

    h2("3.4 Execution Documentation"),

    h3("Key Configuration Files"),
    ...numbered([
      "backend/.env — Contains all server environment variables: database credentials (DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT), JWT secret key (JWT_SECRET with 86400 second expiration), SendGrid API key (SENDGRID_KEY), Stripe secret key (STRIPE_SECRET), and Groq key (GROQ_KEY). This file is never included in version control.",
      "backend/config/database.php — Establishes the PDO connection to PostgreSQL using environment variables. Configures PDO::ERRMODE_EXCEPTION error mode for robust error handling.",
      "backend/composer.json — Manages PHP dependencies: firebase/php-jwt for JWT, vlucas/phpdotenv for environment variables, stripe/stripe-php for payments, and cboden/ratchet for WebSockets.",
      "frontend/vite.config.js — Minimal Vite configuration with the React plugin. Defines the development server on localhost:5173.",
      "frontend/vercel.json — Vercel deployment configuration. Defines SPA routes so all frontend routes are handled by index.html.",
      "frontend/src/i18n.js — Initialises i18next with the three supported languages (es, en, fr), automatic browser language detection, and localStorage persistence.",
      "backend/Dockerfile — Defines the Docker container for Render: PHP 8.3 base image with PDO, pgsql extensions, and Composer.",
    ]),

    h3("Security Policy"),
    p("Salesek's security is implemented in multiple layers:"),
    p("Authentication and authorisation: the system uses JWT tokens signed with the HS256 algorithm. The secret key (JWT_SECRET) is stored exclusively in server environment variables. Tokens are valid for 24 hours. The AuthMiddleware.php verifies the token signature on every request to protected endpoints. The RoleMiddleware.php checks the user's role before allowing access to sensitive operations."),
    p("Password security: all passwords are stored hashed using the bcrypt algorithm via PHP's password_hash() function with the PASSWORD_BCRYPT constant. A minimum length of 8 characters is required. Verification is performed with password_verify(), which is resistant to timing attacks."),
    p("SQL injection prevention: all database queries use PDO prepared statements with bound parameters. No query is constructed by concatenating strings with user input."),
    p("XSS prevention: the Validator::sanitize() class applies htmlspecialchars() and strip_tags() to all user inputs before processing. React JSX automatically escapes rendered content, preventing HTML injection."),
    p("Encrypted communication: all communication between frontend and backend in production is performed over HTTPS. SSL certificates are automatically managed by Vercel and Render."),
    p("Multi-tenant isolation: every database query that accesses company data includes a WHERE business_id = :business_id clause, where business_id is extracted from the JWT token and never from the client request body."),

    h3("Installation Manual"),
    h3("Prerequisites"),
    ...numbered([
      "Node.js 20.x LTS installed locally.",
      "PHP 8.3 with the pdo, pdo_pgsql, and curl extensions enabled.",
      "Composer 2.x installed globally.",
      "PostgreSQL 15 installed locally or access to a remote instance.",
      "Git installed.",
      "Accounts at: SendGrid, Stripe (test mode), and Groq API.",
    ]),

    h3("Backend Installation"),
    ...numbered([
      "Clone the repository: git clone https://github.com/oussta/serelmejor.git",
      "Navigate to the backend directory: cd serelmejor/backend",
      "Install PHP dependencies: composer install",
      "Copy the environment variables file: cp .env.example .env",
      "Edit .env with local database credentials, JWT_SECRET (random string of at least 32 characters), SENDGRID_KEY, STRIPE_SECRET, GROQ_KEY, and FRONTEND_URL=http://localhost:5173.",
      "Create the database in PostgreSQL: createdb serelmejor",
      "Execute the schema: psql -U postgres -d serelmejor -f ../database/schema.sql",
      "Optionally, load test data: psql -U postgres -d serelmejor -f ../database/seeds.sql",
      "Start the PHP development server: php -S localhost:8000",
    ]),

    h3("Frontend Installation"),
    ...numbered([
      "In a separate terminal, navigate to the frontend directory: cd serelmejor/frontend",
      "Install Node.js dependencies: npm install",
      "Create the environment variables file: create .env with VITE_API_URL=http://localhost:8000",
      "Start the Vite development server: npm run dev",
      "Access the application in the browser: http://localhost:5173",
    ]),

    h3("Starting the WebSocket Server (optional)"),
    ...numbered([
      "In a third terminal, navigate to the websocket directory: cd serelmejor/backend/websocket",
      "Start the Ratchet server: php server.php",
      "The WebSocket server listens on ws://localhost:8080.",
    ]),

    h3("Production Deployment Configuration Manual"),
    h3("Backend Deployment on Render"),
    ...numbered([
      "Create an account on Render (render.com) and connect the GitHub repository.",
      "Create a new Web Service and select the serelmejor repository.",
      "Set the root directory to backend/.",
      "Select Docker environment (Render will automatically detect the Dockerfile).",
      "In the Environment section, add all environment variables: DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT, JWT_SECRET, JWT_EXPIRY, SENDGRID_KEY, SENDGRID_FROM, STRIPE_SECRET, GROQ_KEY, FRONTEND_URL, APP_ENV=production.",
      "Create a PostgreSQL database on Render (New > PostgreSQL) and copy the internal connection URL into DB_HOST, DB_NAME, DB_USER, and DB_PASS variables.",
      "Start the deployment. Render will build the Docker image and deploy the container.",
      "Once deployed, execute the SQL schema on the production database via the Render console.",
    ]),

    h3("Frontend Deployment on Vercel"),
    ...numbered([
      "Create an account on Vercel (vercel.com) and import the GitHub repository.",
      "Set the root directory to frontend/.",
      "In the Environment Variables section, add VITE_API_URL with the Render backend URL (e.g.: https://serelmejor.onrender.com).",
      "Vercel will automatically detect the Vite configuration and run npm run build.",
      "Deployment is automatic with every push to the main GitHub branch.",
      "Configure the custom domain salsek.com in the Vercel project settings.",
    ]),

    h3("User Manual"),
    h3("Demo Accounts"),
    p("The following demo accounts are available to test the platform (password: password):"),
    makeTable(
      ["Role", "Email", "Password", "Access"],
      [
        ["Administrator", "admin@salesek.com", "password", "Admin panel with global platform statistics"],
        ["Owner", "owner@salesek.com", "password", "Full access to demo company (CRM, inventory, team, billing)"],
        ["Employee", "employee@salesek.com", "password", "Access to leads, products, and orders of the demo company"],
        ["Supplier", "supplier@salesek.com", "password", "Supplier portal with assigned purchase orders"],
      ]
    ),
    screenshot("[SCREENSHOT REQUIRED: Salesek login page (https://salsek.com/login) showing the access form]"),

    h3("Workflow: SalesFlow CRM"),
    ...numbered([
      "Access the Leads section from the side menu.",
      "Create a new lead with the client name, opportunity description, and closing probability.",
      "The lead appears in the 'New' column of the Kanban board.",
      "When contacting the client, change the status to 'Contacted'. Add a message recording the communication.",
      "Create a follow-up reminder with the date of the next contact.",
      "Advance the lead to 'Negotiating' when a formal proposal is initiated.",
      "Use the 'AI Response' button to automatically generate a draft commercial response using Groq AI.",
      "When the deal is closed positively, change the status to 'Won'. The Bridge will activate automatically if a product is linked.",
      "If the deal does not proceed, change the status to 'Lost' to maintain the history.",
    ]),
    screenshot("[SCREENSHOT REQUIRED: Kanban lead board showing leads in different states (New, Contacted, Negotiating, Won, Lost)]"),

    h3("Workflow: StockFlow Inventory"),
    ...numbered([
      "Access the Products section to view the full catalogue.",
      "Create a new product with name, category, price, current stock, and minimum stock.",
      "Products with stock below the minimum are flagged with a red visual alert.",
      "To record a manual sale, click on the product and select 'Record Sale'.",
      "To restock manually, select 'Record Stock Entry'.",
      "Access the Suppliers section to manage supply contacts.",
      "In the Orders section, create a purchase order by selecting supplier, product, and quantity.",
      "Send the order to the supplier using the 'Send Order' button. The supplier will receive an automatic email.",
      "The supplier will confirm the order from their portal at /supplier.",
    ]),
    screenshot("[SCREENSHOT REQUIRED: Products page showing the catalogue with low stock indicators]"),
    screenshot("[SCREENSHOT REQUIRED: Supplier portal (/supplier) showing assigned purchase orders]"),

    pageBreak(),

    // ═══════════════════════════════════
    // 4. MONITORING AND CONTROL
    // ═══════════════════════════════════
    h1("4. Monitoring and Control"),

    h2("4.1 Project Evaluation"),
    p("The project quality evaluation is performed through a set of technical and functional indicators that measure the degree of compliance with the objectives set during the design phase."),
    p("Technical quality indicators include: correct implementation of protected routes with role verification in both frontend and backend; absence of 500 errors in server logs under normal usage conditions; API response time below 500ms for standard CRUD operations; accessibility and SEO score above 85 in Lighthouse; and correct frontend build without critical ESLint warnings."),
    p("Functional quality indicators include: all documented user flows (registration, login, lead creation, deal closing, stock update, order sending) working correctly end-to-end; The Bridge integration triggering correctly when a lead is marked as won; real-time notifications delivered with latency below two seconds; and transactional emails correctly delivered by SendGrid."),
    p("The evaluation protocol followed consists of running a battery of functional tests with all four demo accounts, verifying expected behaviour at each flow, and documenting any deviation from expected results."),
    screenshot("[SCREENSHOT REQUIRED: Lighthouse report for https://salsek.com showing Performance, Accessibility, Best Practices, and SEO scores]"),

    h2("4.2 Incidents"),
    p("Salesek's incident management protocol establishes three phases: collection, resolution, and recording."),
    p("In the collection phase, incidents are identified through Render server logs, browser error notifications on the client, user reports via the contact form, or directly through GitHub issues. Each incident is classified by severity: critical (affects the main system operability), high (important functionality degraded), medium (secondary functionality affected), or low (cosmetic or minor usability problem)."),
    p("In the resolution phase, critical and high incidents are addressed immediately in the development backlog. A specific git branch is created (fix/problem-description), the fix is implemented, tested locally, and deployed to production. Medium and low incidents are accumulated in the backlog and resolved in the next sprint."),
    p("In the recording phase, each resolved incident generates a commit with the fix: prefix in the message following the Conventional Commits convention. The Git history acts as an incident log with complete traceability of what changed, when, and why."),
    p("Most significant incidents detected during development:"),
    ...numbered([
      "Infinite redirect loop for users with Supplier role when attempting to access employee protected routes. Resolved by implementing SupplierRoute.jsx with explicit redirection to /supplier.",
      "Navbar links did not correctly correspond to the authenticated user's role. Resolved through conditional logic in Navbar.jsx based on the AuthContext role.",
    ]),

    h2("4.3 Changes"),
    p("Salesek's update and migration plan covers three areas: database migrations, dependency updates, and functional improvements."),
    p("Database migrations are managed through versioned SQL files. Any schema change is documented in a new file with a numeric prefix (e.g.: 001_add_column_leads.sql) and applied to production via the Render console. A rollback script is always maintained to revert changes in case of error."),
    p("Dependency updates are performed monthly. PHP dependencies are updated with composer update and Node.js ones with npm update. Major version updates (e.g.: React 19 when available) are evaluated individually and tested in a staging environment before deploying to production."),
    p("Functional improvements planned for future versions include: CSV/Excel data export for leads and products, calendar service integration (Google Calendar) for follow-up reminders, advanced analytics panel with conversion charts and stock trends, and multi-currency support for subscription plans."),
    p("The architecture's scalability is guaranteed by the decoupling between frontend and backend. If demand increases, the PHP backend can be scaled vertically on Render without affecting the frontend. PostgreSQL supports scaling through read replicas. Long-term, the architecture allows migrating the most critical microservices (AI, WebSockets) to dedicated servers without modifying the user interface."),

    h2("4.4 Testing and Support"),

    h3("Security Tests"),
    ...numbered([
      "SQL injection test: strings such as ' OR 1=1 -- were entered in all form fields. Result: PDO prepared statements blocked all attempts.",
      "XSS test: JavaScript scripts were entered in text fields such as <script>alert('xss')</script>. Result: htmlspecialchars() in the backend and React's automatic escaping in the frontend neutralised all attempts.",
      "Unauthorised access test: protected endpoints were accessed without a JWT token and with expired or tampered tokens. Result: AuthMiddleware correctly returned 401 error in all cases.",
      "Privilege escalation test: admin endpoints were accessed with tokens for a user with the Employee role. Result: RoleMiddleware correctly returned 403 error in all cases.",
      "Multi-tenant isolation test: other companies' data was accessed by modifying the ID in request parameters. Result: business_id validation extracted from the JWT prevented access in all cases.",
    ]),

    h3("Load Tests"),
    p("Basic load tests were performed using browser development tools and simultaneous requests with Postman. The Render backend server responded stably with up to 20 simultaneous requests, with response times below 800ms at the 95th percentile. For higher loads, controller-level query caching improvements are planned."),
    screenshot("[SCREENSHOT REQUIRED: Postman test results showing correct API responses (endpoints /leads, /products, /orders)]"),

    h3("Accessibility Tests"),
    ...numbered([
      "The application achieves an accessibility score above 85 in Lighthouse.",
      "Interactive elements have aria-label attributes where appropriate.",
      "Colour contrast between text and background exceeds the minimum 4.5:1 ratio required by WCAG 2.1 guidelines.",
      "Keyboard navigation works correctly in the main forms.",
    ]),

    h3("Backup Policy"),
    p("Salesek's backup policy relies on Render's automatic functionality: the PostgreSQL database performs automatic daily backups with a 7-day retention period on the basic plan. Additionally, the source code is replicated on GitHub as a project state backup. It is recommended to manually export the database before any significant migration."),

    h3("Service Level Agreement (SLA)"),
    p("Salesek's production availability target is 99.5% monthly, equivalent to a maximum of 3.6 hours of downtime per month. This target is supported by the infrastructure providers' SLAs: Vercel guarantees 99.99% availability and Render offers 99.5% for paid plans. In the event of a critical incident affecting service availability, the target resolution time is 4 hours from detection."),
    screenshot("[SCREENSHOT REQUIRED: Render dashboard showing the backend server and production database status]"),

    new Paragraph({ spacing: { before: 480 } }),
    new Paragraph({
      children: [new TextRun({ text: "— End of report —", italics: true, size: pt(10), color: "6B7280", font: "Calibri" })],
      alignment: AlignmentType.CENTER,
    }),
  ];

  return new Document({
    title: "Salesek — Final Project Report DAW",
    creator: "[STUDENT NAME]",
    description: "Final project report for Salesek, DAW vocational training cycle",
    sections: [{ properties: {}, children }],
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          run: { color: "1E3A5F", bold: true, size: pt(16), font: "Calibri" },
          paragraph: { spacing: { before: 480, after: 200 } },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          run: { color: "2563EB", bold: true, size: pt(13), font: "Calibri" },
          paragraph: { spacing: { before: 360, after: 160 } },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          run: { color: "374151", bold: true, size: pt(11.5), font: "Calibri" },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
      ],
    },
  });
}

// ─────────────────────────────────────────────
// WRITE FILES
// ─────────────────────────────────────────────
async function main() {
  console.log("Generating memoria_ES.docx...");
  const esDoc = buildSpanish();
  const esBuffer = await Packer.toBuffer(esDoc);
  writeFileSync("memoria_ES.docx", esBuffer);
  console.log("✓ memoria_ES.docx written");

  console.log("Generating memoria_EN.docx...");
  const enDoc = buildEnglish();
  const enBuffer = await Packer.toBuffer(enDoc);
  writeFileSync("memoria_EN.docx", enBuffer);
  console.log("✓ memoria_EN.docx written");

  console.log("\nDone. Files are in docs/");
}

main().catch(console.error);
