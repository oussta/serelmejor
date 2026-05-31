// generate_docs.js — generates memoria_ES.docx and memoria_EN.docx
'use strict';
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, ImageRun, PageBreak, WidthType,
  ShadingType, BorderStyle, Header, Footer, PageNumberElement,
  NumberFormat
} = require('docx');
const fs   = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname);
const SS   = path.join(BASE, 'docs', 'screenshots');

// ─── helpers ────────────────────────────────────────────────────────────────

function findImg(name) {
  // Strip extension for fuzzy matching
  const bare = name.replace(/\.[^.]+$/, '').toLowerCase();
  const files = fs.readdirSync(SS);
  // Exact match first
  for (const f of files) {
    if (f.toLowerCase() === name.toLowerCase()) return path.join(SS, f);
  }
  // Basename match
  for (const f of files) {
    if (path.basename(f, path.extname(f)).toLowerCase() === bare) return path.join(SS, f);
  }
  return null;
}

function imgRun(filename, maxWidth = 550) {
  const p = findImg(filename);
  if (!p) return null;
  const data = fs.readFileSync(p);
  const ext  = path.extname(p).replace('.', '').toLowerCase();
  const type = ext === 'png' ? 'png' : ext === 'jpg' || ext === 'jpeg' ? 'jpg' : 'png';
  return new ImageRun({
    data,
    transformation: { width: maxWidth, height: Math.round(maxWidth * 0.6) },
    type,
  });
}

// Heading paragraph
function h(text, level) {
  const lvl = [
    HeadingLevel.HEADING_1,
    HeadingLevel.HEADING_2,
    HeadingLevel.HEADING_3,
  ][level - 1] || HeadingLevel.HEADING_1;
  return new Paragraph({ text, heading: lvl, spacing: { before: 300, after: 150 } });
}

// Normal paragraph
function p(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: 'Calibri', ...options.run })],
    spacing: { before: 100, after: 100 },
    alignment: AlignmentType.JUSTIFIED,
    ...options.para,
  });
}

// Bold label paragraph
function bold(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, font: 'Calibri' })],
    spacing: { before: 200, after: 100 },
  });
}

// Image + caption paragraphs (returns array)
function img(filename, caption) {
  const run = imgRun(filename);
  if (run) {
    return [
      new Paragraph({ children: [run], alignment: AlignmentType.CENTER, spacing: { before: 150, after: 60 } }),
      new Paragraph({
        children: [new TextRun({ text: `Figura: ${caption}`, italics: true, size: 18, font: 'Calibri', color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
      }),
    ];
  }
  return [
    new Paragraph({
      children: [new TextRun({ text: `[CAPTURA: ${filename} - ${caption}]`, bold: true, color: 'B8860B', size: 20 })],
      spacing: { before: 100, after: 100 },
    }),
  ];
}

// Page break
function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}

// Usable page width in DXA for A4 with our margins (left 1800 + right 1440)
const PAGE_W = 9026;

// Table builder — colWidths is an array of DXA values that must sum to PAGE_W.
// If omitted, columns are distributed evenly.
function tbl(headers, rows, colWidths) {
  const BRAND = '2563EB';
  // Compute even distribution if not provided
  const base  = Math.floor(PAGE_W / headers.length);
  const rem   = PAGE_W - base * headers.length;
  const widths = colWidths || headers.map((_, i) => i === 0 ? base + rem : base);

  const makeCell = (text, isHeader, rowIdx, colIdx) => {
    const w = widths[colIdx] || base;
    const shade = isHeader
      ? { type: ShadingType.SOLID, color: BRAND, fill: BRAND }
      : rowIdx % 2 === 1
        ? { type: ShadingType.SOLID, color: 'F0F4FF', fill: 'F0F4FF' }
        : { type: ShadingType.SOLID, color: 'FFFFFF', fill: 'FFFFFF' };
    return new TableCell({
      children: [new Paragraph({
        children: [new TextRun({
          text,
          bold: isHeader,
          color: isHeader ? 'FFFFFF' : '000000',
          size: isHeader ? 20 : 19,
        })],
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
      })],
      shading: shade,
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      width: { size: w, type: WidthType.DXA },
    });
  };

  const headerRow = new TableRow({
    children: headers.map((h, ci) => makeCell(h, true, 0, ci)),
    tableHeader: true,
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    children: headers.map((_, ci) => makeCell(row[ci] || '', false, ri, ci)),
  }));

  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...dataRows],
  });
}

// ─── SPANISH CONTENT ────────────────────────────────────────────────────────

function buildES() {
  const children = [];

  // Cover page
  children.push(new Paragraph({ text: '', spacing: { before: 2000 } }));
  const logoRun = imgRun('landing.PNG', 300);
  if (logoRun) {
    children.push(new Paragraph({ children: [logoRun], alignment: AlignmentType.CENTER }));
  }
  children.push(new Paragraph({
    children: [new TextRun({ text: 'SALESEK', bold: true, size: 64, font: 'Calibri', color: '2563EB' })],
    alignment: AlignmentType.CENTER, spacing: { before: 400, after: 100 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Plataforma SaaS de CRM e Inventario para PYMEs', size: 36, font: 'Calibri' })],
    alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Memoria Final de Proyecto Integrado — Ciclo Formativo DAW', italics: true, size: 28, font: 'Calibri' })],
    alignment: AlignmentType.CENTER, spacing: { before: 100, after: 600 },
  }));
  [
    ['Alumno', 'YASSER AZZOUZ'],
    ['Tutor', 'SANTIAGO ARIEL FERNANDEZ'],
    ['Centro', 'DIGI-TECH DAW'],
    ['Ã±o académico', '2025/2026'],
  ].forEach(([label, value]) => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: 24 }),
        new TextRun({ text: value, size: 24 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
    }));
  });
  children.push(pb());

  // Section 1
  children.push(h('1. IDENTIFICACIÓN DE NECESIDADES', 1));

  children.push(h('1.1 Contextualización', 2));
  children.push(p('El sector del software empresarial para pequeñas y medianas empresas (PYMEs) en España atraviesa un momento de transformación acelerada. Según los datos del Directorio Central de Empresas (DIRCE), el 99,8 % de las empresas españolas son PYMEs, es decir, cuentan con menos de 250 trabajadores. Sin embargo, la mayoría de ellas operan con herramientas completamente desconectadas entre sí: hojas de cálculo Excel para gestionar el inventario, aplicaciones de mensajería como WhatsApp para hacer seguimiento de clientes, y correo electrónico ordinario para comunicarse con proveedores. Esta fragmentación tecnológica genera ineficiencias graves y pérdidas económicas que podrían evitarse con una solución integrada y accesible.'));
  children.push(p('El tipo de empresa para el que está diseñado Salesek es precisamente este perfil: negocios pequeños de entre 1 y 10 empleados que no tienen departamento de tecnología ni presupuesto para contratar soluciones como Salesforce o HubSpot. Los perfiles típicos de cliente incluyen comercios minoristas, distribuidores pequeños, agencias de servicios, autónomos con cartera de clientes activa, talleres y estudios creativos. Todos ellos comparten la misma realidad: pierden oportunidades de venta por no tener un sistema organizado de seguimiento, y pierden dinero en inventario porque no tienen visibilidad en tiempo real de su stock.'));
  children.push(p('La necesidad identificada tiene dos dimensiones concretas y cuantificables. En primer lugar, la pérdida de clientes potenciales: estudios de ventas internacionales demuestran que el 80 % de las ventas requieren al menos cinco contactos de seguimiento, pero el 44 % de los comerciales abandonan tras el primer intento. Sin un sistema que automatice los recordatorios y centralice el historial de comunicación, los clientes potenciales simplemente se olvidan. En segundo lugar, la mala gestión del inventario genera dos problemas opuestos pero igualmente dañinos: las roturas de stock que hacen perder ventas directas, y el exceso de stock que inmoviliza capital y genera costes de almacenamiento. Las PYMEs españolas sin sistema de inventario digital pierden de media entre 2.000 y 8.000 euros anuales por estas causas.'));
  children.push(...img('landing.PNG', 'Página principal de Salesek en salsek.com'));
  children.push(...img('features.PNG', 'Módulos y funcionalidades principales de la plataforma'));

  children.push(h('1.2 Justificación', 2));
  children.push(p('Salesek da respuesta directa a las dos necesidades identificadas mediante dos módulos especializados que trabajan de forma integrada. SalesFlow es el módulo CRM (Customer Relationship Management) que resuelve el problema de la pérdida de clientes. Permite visualizar todos los prospectos en un pipeline Kanban con etapas configurables, registrar el historial completo de comunicaciones, programar seguimientos automáticos con recordatorios, y utilizar un asistente de inteligencia artificial basado en el modelo LLaMA de Groq para redactar respuestas profesionales en segundos. La probabilidad de cierre de cada lead se actualiza dinámicamente en función del progreso en el pipeline.'));
  children.push(p('StockFlow es el módulo de gestión de inventario que resuelve el problema de la mala gestión de existencias. Permite registrar todos los productos con stock actual, stock mínimo configurable, precio y categoría. El sistema genera alertas automáticas cuando el stock cae por debajo del mínimo, y puede sugerir cantidades de pedido óptimas mediante inteligencia artificial. Cada movimiento de stock queda registrado con fecha, tipo y nota explicativa, proporcionando un historial completo de todas las entradas y salidas.'));
  children.push(p('La característica diferenciadora de Salesek es The Bridge: la automatización que conecta CRM e inventario. Cuando un vendedor marca un lead como ganado en SalesFlow, The Bridge actúa automáticamente: descuenta la cantidad del producto asociado al lead del inventario en StockFlow, y si el stock resultante cae por debajo del mínimo configurado, genera automáticamente un pedido de compra al proveedor y le envía un correo electrónico con los detalles del pedido mediante SendGrid. Todo esto sucede sin ninguna acción manual del usuario.'));

  children.push(tbl(
    ['Característica', 'Salesek', 'Excel', 'HubSpot', 'Salesforce', 'Zoho CRM'],
    [
      ['Precio mensual', 'Desde 29€', 'Incluido Office', 'Desde 45€/usuario', 'Desde 25€/usuario', 'Desde 14€/usuario'],
      ['CRM visual', 'Sí', 'Manual', 'Sí', 'Sí', 'Sí'],
      ['Inventario integrado', 'Sí', 'Manual', 'No', 'Con módulo extra', 'Limitado'],
      ['IA asistente', 'Sí (Groq LLaMA)', 'No', 'Con IA add-on', 'Con IA add-on', 'Limitado'],
      ['Pedidos automáticos', 'Sí (The Bridge)', 'No', 'No', 'No', 'No'],
      ['Portal de proveedor', 'Sí', 'No', 'No', 'No', 'No'],
      ['Facilidad de uso', 'Alta', 'Media', 'Media', 'Baja', 'Media'],
      ['Soporte en español', 'Completo', 'Sí', 'Parcial', 'Sí', 'Parcial'],
    ],
    [2200, 1366, 1365, 1365, 1365, 1365]
  ));
  children.push(new Paragraph({ text: '', spacing: { before: 100 } }));

  children.push(p('Las características específicas diferenciadoras de Salesek son: (1) The Bridge — sincronización automática entre CRM e inventario inexistente en otras soluciones para PYMEs; (2) Asistente de IA con Groq LLaMA para respuestas profesionales y sugerencias de pedido; (3) Notificaciones en tiempo real vía WebSockets; (4) Portal exclusivo para proveedores; (5) Autenticación JWT segura y escalable; (6) Soporte multilingüe ES/EN/FR con react-i18next; (7) Modo oscuro completo; (8) Diseño totalmente responsivo.'));
  children.push(...img('prices.PNG', 'Planes de precios de Salesek: SalesFlow, StockFlow y Suite'));
  children.push(...img('howItWork.PNG', 'Diagrama de funcionamiento de la plataforma Salesek'));

  children.push(h('1.3 Otros aspectos', 2));
  children.push(p('Desde el punto de vista legal y fiscal, Salesek opera como una plataforma SaaS sujeta a diversas obligaciones normativas en España. En materia de protección de datos, la plataforma cumple íntegramente con el Reglamento General de Protección de Datos (RGPD/GDPR) de la Unión Europea. Las medidas técnicas implementadas incluyen: cifrado de contraseñas mediante bcrypt (PASSWORD_BCRYPT en PHP), autenticación mediante tokens JWT con caducidad de 24 horas, uso exclusivo de HTTPS en todas las comunicaciones, sentencias preparadas PDO para toda interacción con la base de datos, y sanitización de entradas con htmlspecialchars() para prevenir XSS. Se publica política de privacidad, aviso legal y política de cookies cumpliendo con la LSSI-CE.'));
  children.push(p('Las suscripciones SaaS vendidas a empresas en España están sujetas al IVA al tipo general del 21 %. Para ventas a empresas de otros países de la UE se aplica el régimen de inversión del sujeto pasivo.'));
  children.push(p('En cuanto a ayudas y subvenciones disponibles, el programa Kit Digital del Gobierno de España ofrece ayudas de hasta 12.000 euros para PYMEs de 3 a 9 empleados destinadas a la digitalización. Existen también subvenciones regionales en Cataluña (ACC1O) y en la Comunidad de Madrid (Fondo Tecnológico) para startups tecnológicas en fase de validación.'));
  children.push(p('El guín de trabajo seguido fue: (1) investigación de mercado e identificación de necesidades, (2) análisis de la gramática de la platea (plate grammar) definiendo casos de uso y requisitos funcionales, (3) diseño de UI/UX en Stitch/Figma definiendo el sistema de diseño con variables CSS, (4) diseño del modelo de datos y diagrama E-R, (5) desarrollo del backend PHP 8 con pruebas en Postman, (6) desarrollo del frontend React 18, (7) integración y pruebas end-to-end, (8) despliegue en Render y Vercel, (9) documentación.'));
  children.push(...img('contact.PNG', 'Formulario de contacto de Salesek'));
  children.push(pb());

  // Section 2
  children.push(h('2. DISEÑO DEL PROYECTO', 1));

  children.push(h('2.1 Contenido', 2));
  children.push(p('El alcance completo de Salesek abarca: landing page pública con SEO completo (sitemap.xml, robots.txt, Schema.org, Open Graph), sistema de autenticación con verificación de email, módulo SalesFlow CRM con pipeline visual Kanban, módulo StockFlow de inventario con alertas, The Bridge automatización, sistema de email con SendGrid, notificaciones en tiempo real via WebSockets, panel de administración global, portal de proveedores, y soporte multilingüe ES/EN/FR.'));
  children.push(p('La viabilidad técnica fue analizada en profundidad. React 18 fue elegido para el frontend por su ecosistema maduro y soporte para UI dinámicas sin recarga de página. Vite como bundler fue preferido sobre Create React App por su velocidad de compilación en desarrollo. PHP 8 fue elegido para el backend por permitir construir una API REST robusta sin la sobrecarga de un framework completo. PostgreSQL 15 fue elegido sobre MySQL por su robustez en tipos de datos complejos y soporte completo de claves foráneas con CASCADE. PDO previene inyección SQL automáticamente mediante sentencias preparadas. SendGrid garantiza alta tasa de entrega de emails transaccionales. Groq con LLaMA ofrece la capacidad de IA más alta disponible en tier gratuito. Los WebSockets permiten notificaciones en tiempo real sin polling.'));

  children.push(tbl(
    ['Fase', 'Nombre', 'Descripción', 'Horas'],
    [
      ['0', 'Setup y entorno', 'GitHub, Render, Vercel, variables de entorno', '10h'],
      ['1', 'Auth y suscripciones', 'Registro, login, JWT, bcrypt, verificación email', '25h'],
      ['2', 'SalesFlow CRM', 'Pipeline leads, mensajes, seguimientos, estadísticas', '35h'],
      ['3', 'IA en SalesFlow', 'Integración Groq API para generación de respuestas', '15h'],
      ['4', 'StockFlow Inventario', 'Productos, movimientos de stock, alertas', '30h'],
      ['5', 'IA en StockFlow', 'Groq API para sugerencias de cantidad de pedido', '10h'],
      ['6', 'The Bridge', 'Automatización CRM-Inventario al cerrar deal', '20h'],
      ['7', 'Email con SendGrid', 'Verificación, bienvenida, reset, pedido, cancelación', '15h'],
      ['8', 'WebSockets', 'Servidor WebSocket, notificaciones en tiempo real', '20h'],
      ['9', 'Panel Admin', 'Vista global de negocios y usuarios para admin', '15h'],
      ['10', 'Portal Proveedor', 'Acceso restringido para consultar pedidos', '10h'],
      ['11', 'Landing page y SEO', 'Landing, sitemap, robots.txt, Schema.org, Open Graph', '20h'],
      ['12', 'Dashboard y equipo', 'Dashboard con KPIs, gestión de miembros del equipo', '20h'],
      ['13', 'Optimización deploy', 'Config Render, Vercel, CORS, variables producción', '10h'],
      ['14', 'Documentación', 'Memoria, API reference, seeds SQL', '15h'],
    ],
    [600, 2200, 5226, 1000]
  ));
  children.push(new Paragraph({ text: '' }));
  children.push(...img('code_api_routes_auth.PNG', 'Estructura de la API REST: rutas de autenticación en api.php'));
  children.push(...img('code_api_routes_leads.PNG', 'Estructura de la API REST: rutas de gestión de leads en api.php'));

  children.push(h('2.2 Objetivos y recursos', 2));
  children.push(p('Los objetivos del proyecto, ordenados por prioridad, son: (1) construir una plataforma SaaS de CRM funcional para pequeñas empresas, (2) construir un sistema de gestión de inventario completo integrado en la misma plataforma, (3) implementar The Bridge como automatización diferenciadora, (4) implementar autenticación JWT segura y escalable, (5) integrar inteligencia artificial con Groq LLaMA, (6) desplegar en producción con alta disponibilidad, (7) alcanzar diseño responsivo para dispositivos móviles, (8) implementar estrategia SEO completa.'));
  children.push(p('Recursos hardware: ordenador de desarrollo ASUS, Render Web Service con CPU compartida y 512 MB de RAM, Render PostgreSQL con 1 GB de almacenamiento, CDN global de Vercel, servidor de dominio Namecheap. Recursos software: Visual Studio Code, Node.js 18, PHP 8, PostgreSQL 15, pgAdmin 4, Postman, GitHub, Git, npm y DevTools del navegador. Recursos personales: 1 desarrollador (el alumno) con seguimiento del tutor académico.'));

  children.push(h('2.3 Viabilidad económica', 2));
  children.push(p('El análisis económico contempla costes de desarrollo e infraestructura. El coste de desarrollo se estima en 300 horas a 15 euros por hora (tarifa de estudiante), totalizando 4.500 euros. Este coste incluye todas las fases del proyecto desde la investigación inicial hasta la documentación final.'));

  children.push(tbl(
    ['Concepto', 'Coste', 'Periodicidad', 'Coste anual'],
    [
      ['Desarrollo (300h x 15€/h)', '4.500 €', 'Único', '4.500 €'],
      ['Render Web Service (backend)', '7 €/mes', 'Mensual', '84 €'],
      ['Render PostgreSQL', '7 €/mes', 'Mensual', '84 €'],
      ['Dominio Namecheap (salsek.com)', '12 €/año', 'Anual', '12 €'],
      ['SendGrid (hasta 100 emails/día)', '0 €', 'Tier gratuito', '0 €'],
      ['Groq API (LLaMA)', '0 €', 'Tier gratuito', '0 €'],
      ['Vercel (frontend CDN)', '0 €', 'Tier gratuito', '0 €'],
      ['TOTAL AÑO 1', '', '', '4.680 €'],
      ['TOTAL INFRAESTRUCTURA MENSUAL', '14 €/mes', 'Mensual', '168 €/año'],
    ],
    [3800, 1542, 2142, 1542]
  ));
  children.push(new Paragraph({ text: '' }));
  children.push(p('Con solo 10 clientes en el plan básico (290 euros/mes de facturación), la plataforma supera ya el coste mensual de infraestructura (14 euros). El programa Kit Digital ofrece hasta 12.000 euros para cubrir el coste de desarrollo completo.'));

  children.push(h('2.4 Modelo de solución', 2));
  children.push(p('La arquitectura de Salesek sigue un modelo cliente-servidor moderno con separación total entre frontend y backend. La aplicación React SPA se despliega en Vercel y se sirve vía CDN global. Esta SPA se comunica exclusivamente mediante HTTPS con la API REST en PHP 8 en Render, que a su vez conecta con PostgreSQL 15 en Render. Los tokens JWT autentican cada petición protegida. SendGrid gestiona todos los emails transaccionales. Groq procesa las solicitudes de IA. Los WebSockets entregan notificaciones en tiempo real.'));

  children.push(tbl(
    ['Permiso / Módulo', 'Admin', 'Owner', 'Employee', 'Supplier'],
    [
      ['Panel de administración', 'Sí', 'No', 'No', 'No'],
      ['Gestión de empresas (todas)', 'Sí', 'No', 'No', 'No'],
      ['Gestión de suscripciones', 'Sí', 'Sí', 'No', 'No'],
      ['Gestión del equipo', 'Sí', 'Sí', 'No', 'No'],
      ['SalesFlow CRM (leads)', 'Sí', 'Sí', 'Sí', 'No'],
      ['StockFlow inventario', 'Sí', 'Sí', 'Sí', 'No'],
      ['Pedidos de compra', 'Sí', 'Sí', 'Sí', 'Solo lectura'],
      ['Portal de proveedor', 'No', 'No', 'No', 'Sí'],
      ['Configuración del negocio', 'Sí', 'Sí', 'No', 'No'],
      ['Estadísticas y dashboard', 'Sí', 'Sí', 'Limitado', 'No'],
    ],
    [3800, 1307, 1306, 1306, 1307]
  ));
  children.push(new Paragraph({ text: '' }));

  children.push(tbl(
    ['Característica', 'SalesFlow 29€/mes', 'StockFlow 29€/mes', 'Suite 49€/mes'],
    [
      ['CRM pipeline visual', 'Sí', 'No', 'Sí'],
      ['Gestión de leads', 'Sí', 'No', 'Sí'],
      ['Seguimientos automatizados', 'Sí', 'No', 'Sí'],
      ['IA para respuestas', 'Sí', 'No', 'Sí'],
      ['Inventario de productos', 'No', 'Sí', 'Sí'],
      ['Alertas de stock', 'No', 'Sí', 'Sí'],
      ['IA para pedidos', 'No', 'Sí', 'Sí'],
      ['The Bridge automation', 'No', 'No', 'Sí'],
      ['Portal de proveedor', 'No', 'Sí', 'Sí'],
      ['Usuarios del equipo', 'Ilimitados', 'Ilimitados', 'Ilimitados'],
    ],
    [2800, 2076, 2075, 2075]
  ));
  children.push(new Paragraph({ text: '' }));

  children.push(tbl(
    ['Categoría', 'Método', 'Endpoint', 'Descripción'],
    [
      ['Auth', 'POST', '/register', 'Registro de nuevo usuario y negocio'],
      ['Auth', 'POST', '/login', 'Login con email y password, devuelve JWT'],
      ['Auth', 'GET', '/me', 'Obtener perfil del usuario autenticado'],
      ['Auth', 'POST', '/verify-email', 'Verificar código de email'],
      ['Auth', 'POST', '/forgot-password', 'Solicitar código de reset'],
      ['Auth', 'POST', '/reset-password', 'Resetear contraseña con código'],
      ['Auth', 'POST', '/logout', 'Cerrar sesión'],
      ['Auth', 'POST', '/resend-code', 'Reenviar código de verificación'],
      ['Auth', 'POST', '/cancel-subscription', 'Cancelar suscripción activa'],
      ['Business', 'GET', '/business', 'Obtener datos del negocio actual'],
      ['Business', 'PUT', '/business', 'Actualizar datos del negocio'],
      ['Business', 'GET', '/business/stats', 'Obtener estadísticas del negocio'],
      ['Team', 'GET', '/team', 'Obtener todos los miembros del equipo'],
      ['Team', 'POST', '/team/invite', 'Invitar nuevo miembro al equipo'],
      ['Team', 'PUT', '/team/{id}/role', 'Cambiar rol de un miembro'],
      ['Team', 'DELETE', '/team/{id}', 'Eliminar miembro del equipo'],
      ['Leads', 'GET', '/leads', 'Obtener todos los leads del negocio'],
      ['Leads', 'POST', '/leads', 'Crear nuevo lead'],
      ['Leads', 'GET', '/leads/stats', 'Estadísticas del pipeline'],
      ['Leads', 'GET', '/leads/{id}', 'Obtener detalle de un lead'],
      ['Leads', 'PUT', '/leads/{id}', 'Actualizar datos de un lead'],
      ['Leads', 'DELETE', '/leads/{id}', 'Eliminar un lead'],
      ['Leads', 'PUT', '/leads/{id}/status', 'Cambiar estado (activa The Bridge si won)'],
      ['Leads', 'GET', '/leads/{id}/messages', 'Obtener mensajes de un lead'],
      ['Leads', 'POST', '/leads/{id}/messages', 'Añadir mensaje a un lead'],
      ['Leads', 'GET', '/leads/{id}/followups', 'Obtener seguimientos de un lead'],
      ['Leads', 'POST', '/leads/{id}/followups', 'Crear seguimiento para un lead'],
      ['IA', 'POST', '/ai/draft-response', 'Generar respuesta IA para lead'],
      ['IA', 'POST', '/ai/suggest-order', 'Sugerir cantidad óptima de pedido'],
      ['Productos', 'GET', '/products', 'Obtener todos los productos'],
      ['Productos', 'POST', '/products', 'Crear nuevo producto'],
      ['Productos', 'GET', '/products/low-stock', 'Obtener productos con stock bajo'],
      ['Productos', 'GET', '/products/{id}', 'Obtener detalle de un producto'],
      ['Productos', 'PUT', '/products/{id}', 'Actualizar producto'],
      ['Productos', 'DELETE', '/products/{id}', 'Eliminar producto'],
      ['Productos', 'POST', '/products/{id}/sale', 'Registrar venta (descuenta stock)'],
      ['Productos', 'POST', '/products/{id}/restock', 'Registrar reposición de stock'],
      ['Productos', 'GET', '/products/{id}/movements', 'Historial de movimientos de stock'],
      ['Proveedores', 'GET', '/suppliers', 'Obtener todos los proveedores'],
      ['Proveedores', 'POST', '/suppliers', 'Crear nuevo proveedor'],
      ['Proveedores', 'GET', '/suppliers/{id}', 'Obtener detalle de proveedor'],
      ['Proveedores', 'PUT', '/suppliers/{id}', 'Actualizar proveedor'],
      ['Proveedores', 'DELETE', '/suppliers/{id}', 'Eliminar proveedor'],
      ['Proveedores', 'GET', '/suppliers/{id}/orders', 'Pedidos de un proveedor'],
      ['Pedidos', 'GET', '/orders', 'Obtener todos los pedidos de compra'],
      ['Pedidos', 'POST', '/orders', 'Crear pedido de compra manual'],
      ['Pedidos', 'GET', '/orders/{id}', 'Obtener detalle de un pedido'],
      ['Pedidos', 'PUT', '/orders/{id}', 'Actualizar pedido'],
      ['Pedidos', 'DELETE', '/orders/{id}', 'Eliminar pedido'],
      ['Pedidos', 'POST', '/orders/{id}/send', 'Enviar pedido al proveedor por email'],
      ['Pedidos', 'PUT', '/orders/{id}/confirm', 'Confirmar recepción del pedido'],
      ['Pedidos', 'PUT', '/orders/{id}/deliver', 'Marcar pedido como entregado'],
      ['Notificaciones', 'GET', '/notifications', 'Obtener notificaciones del usuario'],
      ['Notificaciones', 'PUT', '/notifications/read-all', 'Marcar todas como leídas'],
      ['Notificaciones', 'PUT', '/notifications/{id}/read', 'Marcar una como leída'],
      ['Notificaciones', 'DELETE', '/notifications/{id}', 'Eliminar notificación'],
      ['Admin', 'GET', '/admin/stats', 'Estadísticas globales de la plataforma'],
      ['Admin', 'GET', '/admin/businesses', 'Listar todas las empresas'],
      ['Admin', 'GET', '/admin/users', 'Listar todos los usuarios'],
      ['Admin', 'GET', '/admin/businesses/{id}', 'Detalle de una empresa'],
      ['Admin', 'DELETE', '/admin/businesses/{id}', 'Eliminar una empresa'],
      ['Contacto', 'POST', '/contact', 'Enviar mensaje de contacto (landing)'],
    ],
    [1400, 900, 2500, 4226]
  ));
  children.push(new Paragraph({ text: '' }));

  children.push(p('El modelo Entidad-Relación de la base de datos está compuesto por 12 tablas interrelacionadas. La tabla businesses es la entidad central de la arquitectura multi-tenant. La tabla users almacena todos los usuarios con su rol y hash de contraseña bcrypt. La tabla subscriptions registra el plan activo de cada negocio. La tabla leads almacena los prospectos del pipeline CRM. La tabla lead_messages almacena el historial de comunicaciones. La tabla followups almacena los seguimientos programados. La tabla products almacena el inventario con stock actual y mínimo. La tabla stock_movements registra cada entrada o salida. La tabla suppliers almacena los proveedores. La tabla purchase_orders registra los pedidos con estados pending/sent/confirmed/delivered. La tabla notifications almacena las notificaciones en tiempo real. La tabla contact_messages almacena los mensajes del formulario público.'));
  children.push(...img('ER-DIAGRAM.png', 'Diagrama Entidad-Relación completo de la base de datos de Salesek (12 tablas)'));
  children.push(...img('db_tables.png', 'Vista de pgAdmin mostrando las 12 tablas de la base de datos'));
  children.push(pb());

  // Section 3
  children.push(h('3. EJECUCIÓN DEL PROYECTO', 1));

  children.push(h('3.1 Planificación temporal', 2));
  children.push(p('El proyecto fue planificado con dependencias técnicas claras. La Fase 1 (Autenticación) debe completarse antes que cualquier otra fase. Las Fases 2 y 4 pueden desarrollarse en paralelo. La Fase 6 (The Bridge) depende de ambas Fases 2 y 4. Las Fases 7 y 8 pueden ejecutarse en paralelo entre sí tras la Fase 6. Las Fases 9 y 10 son independientes entre sí.'));
  children.push(p('Los permisos y autorizaciones necesarios son: cuenta de Render, cuenta de Vercel, cuenta de SendGrid con remitente verificado, clave API de Groq, dominio salsek.com en Namecheap, y repositorio GitHub. El protocolo por fase es: crear tablas en base de datos, desarrollar endpoints PHP, probar con Postman, desarrollar componentes React, conectar frontend con backend, verificar end-to-end, y hacer commit en GitHub.'));

  children.push(tbl(
    ['Fase', 'Nombre', 'Horas plan.', 'Horas reales', 'Coste real'],
    [
      ['0', 'Setup', '10h', '8h', '120 €'],
      ['1', 'Auth', '25h', '30h', '450 €'],
      ['2', 'SalesFlow', '35h', '40h', '600 €'],
      ['3', 'IA SalesFlow', '15h', '12h', '180 €'],
      ['4', 'StockFlow', '30h', '28h', '420 €'],
      ['5', 'IA StockFlow', '10h', '8h', '120 €'],
      ['6', 'The Bridge', '20h', '25h', '375 €'],
      ['7', 'SendGrid', '15h', '14h', '210 €'],
      ['8', 'WebSockets', '20h', '22h', '330 €'],
      ['9', 'Admin', '15h', '12h', '180 €'],
      ['10', 'Proveedor', '10h', '10h', '150 €'],
      ['11', 'Landing/SEO', '20h', '18h', '270 €'],
      ['12', 'Dashboard', '20h', '24h', '360 €'],
      ['13', 'Deploy', '10h', '8h', '120 €'],
      ['14', 'Docs', '15h', '20h', '300 €'],
      ['TOTAL', '', '270h', '279h', '4.185 €'],
    ],
    [600, 2600, 1942, 1942, 1942]
  ));
  children.push(new Paragraph({ text: '' }));

  children.push(h('3.2 Riesgos', 2));
  children.push(tbl(
    ['Riesgo', 'Probabilidad', 'Impacto', 'Prevención', 'Solución'],
    [
      ['Caída del servidor Render', 'Baja', 'Alto', 'SLA 99.5%, tier pagado', 'Monitorización, reinicio automático'],
      ['Pérdida de datos PostgreSQL', 'Muy Baja', 'Crítico', 'Backups diarios Render', 'Restaurar desde backup'],
      ['Exposición de claves API', 'Media', 'Crítico', 'Variables de entorno, .gitignore', 'Revocar y regenerar claves'],
      ['Scope creep', 'Alta', 'Medio', 'Fases definidas, backlog para v2', 'Mover features a backlog'],
      ['Incompatibilidad navegadores', 'Media', 'Medio', 'CSS moderno con fallbacks', 'Añadir polyfills'],
      ['SendGrid entrega a spam', 'Media', 'Medio', 'Dominio verificado, SPF/DKIM', 'Revisar activity feed SendGrid'],
      ['Groq API rate limits', 'Media', 'Bajo', 'Manejo de errores 429', 'Retry con backoff'],
      ['Cold start Render', 'Alta', 'Bajo', 'Documentar en SLA', 'Upgrade a tier pagado'],
    ],
    [2200, 1300, 1200, 2163, 2163]
  ));
  children.push(new Paragraph({ text: '' }));

  children.push(h('3.3 Revisión de recursos', 2));
  children.push(p('La revisión del presupuesto muestra una desviación del 3 % (4.185 vs 4.050 euros planificados). Las fases de autenticación y The Bridge requirieron más tiempo por la gestión de transacciones y casos límite. Las integraciones de IA resultaron más rápidas gracias a la documentación clara de Groq. Los tiers gratuitos de SendGrid, Groq y Vercel supusieron un ahorro significativo respecto a las estimaciones iniciales.'));

  children.push(h('3.4 Documentación de ejecución', 2));

  children.push(bold('Ficheros de configuración'));
  children.push(p('El fichero .env del backend contiene las siguientes variables (nunca almacenadas en Git):'));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT, JWT_SECRET, JWT_EXPIRY, SENDGRID_KEY, SENDGRID_FROM, GROQ_KEY, APP_ENV, FRONTEND_URL', font: 'Courier New', size: 18 })],
    spacing: { before: 100, after: 100 },
  }));
  children.push(p('El fichero vite.config.js configura Vite con soporte React. La variable VITE_API_URL se define en Vercel apuntando a https://serelmejor.onrender.com en producción. La configuración de CORS en el backend PHP restringe las peticiones al origen https://salsek.com con headers Access-Control-Allow-Origin, Access-Control-Allow-Methods y Access-Control-Allow-Headers.'));

  children.push(bold('Características técnicas'));
  children.push(p('Frontend: React 18, Vite, react-router-dom v6, react-i18next, react-helmet-async, Plus Jakarta Sans font, Material Symbols icons. Backend: PHP 8 puro sin framework, PDO, implementación propia de JWT, bcrypt nativo, cURL para APIs externas. Base de datos: PostgreSQL 15, 12 tablas, claves foráneas con CASCADE. Despliegue: Vercel para frontend (deploy automático desde GitHub main), Render para backend y PostgreSQL.'));

  children.push(bold('Código fuente: Autenticación JWT y bcrypt'));
  children.push(...img('code_jwt_bcrypt.PNG', 'Código de autenticación: verificación bcrypt y generación de token JWT'));
  children.push(p('Cuando el usuario envía su email y contraseña al endpoint POST /login, el AuthController recupera el usuario de la base de datos mediante PDO. password_verify() compara la contraseña enviada con el hash bcrypt almacenado. Si es válida, JWTHelper::generate() crea un token JWT firmado con HMAC-SHA256 incluyendo user_id, role, business_id y email_verified. Este token se devuelve al frontend y se almacena en localStorage para incluirlo en el header Authorization de cada petición posterior.'));

  children.push(bold('Por qué JWT sobre cookies de sesión'));
  children.push(p('Durante la planificación se evaluaron JWT y cookies de sesión tradicionales. JWT fue elegido por cinco razones fundamentales. Primero, JWT es completamente stateless: el servidor no necesita almacenar información de sesión, permitiendo escalar horizontalmente sin sincronización entre servidores. Segundo, JWT funciona nativamente con aplicaciones móviles que no pueden gestionar cookies del navegador, preparando la plataforma para una futura app nativa sin cambios en la API. Tercero, JWT elimina la vulnerabilidad CSRF porque el token debe incluirse explícitamente en el header Authorization, imposible de enviar automáticamente desde un sitio malicioso. Cuarto, el payload del JWT contiene user_id, role y business_id eliminando consultas adicionales a la base de datos en cada petición. Quinto, la expiración de 24 horas está integrada en el propio token, dando control total sobre la duración de la sesión.'));

  children.push(...img('code_tokenValidation.PNG', 'Middleware de validación JWT en cada petición protegida'));
  children.push(p('AuthMiddleware::authenticate() extrae el token del header Authorization, verifica la firma HMAC-SHA256 con el JWT_SECRET, comprueba que el token no haya caducado, y devuelve el payload decodificado. Si el token es inválido o ha caducado, devuelve HTTP 401 Unauthorized inmediatamente.'));

  children.push(bold('Código fuente: The Bridge'));
  children.push(...img('code_bridge_automation.PNG', 'Código de The Bridge: automatización CRM-Inventario al cerrar un deal'));
  children.push(p('The Bridge es la característica diferenciadora de Salesek. Cuando PUT /leads/{id}/status recibe el estado won, BridgeService verifica si el lead tiene product_id y quantity. Si es así, descuenta el stock en una transacción PDO atómica. Si el nuevo stock cae bajo min_stock, crea automáticamente un purchase_order y envía un email al proveedor vía SendGrid con los detalles del pedido. Todo ocurre en una única transacción garantizando consistencia del sistema.'));

  children.push(bold('Código fuente: SendGrid'));
  children.push(...img('code_sendgrid_api.PNG', 'Implementación de la integración con SendGrid API v3'));
  children.push(p('Todos los emails transaccionales usan SendGrid API v3 vía cURL de PHP con autenticación Bearer. Emails enviados: código de verificación en el registro (válido 15 minutos), email de bienvenida tras verificación, código de reset de contraseña (válido 30 minutos), notificación de pedido automático al proveedor, y confirmación de cancelación de suscripción.'));

  children.push(bold('Base de datos implementada'));
  children.push(...img('ER-DIAGRAM.png', 'Diagrama Entidad-Relación completo de la base de datos'));

  children.push(bold('Política de seguridad'));
  children.push(p('La política de seguridad implementa múltiples capas: bcrypt para todas las contraseñas (PASSWORD_BCRYPT, coste 10), JWT con 24 horas de expiración y firma HMAC-SHA256, AuthMiddleware en todos los endpoints protegidos, RoleMiddleware en endpoints sensibles, PDO con parámetros enlazados para prevenir SQL injection en los 61 endpoints, htmlspecialchars() para prevenir XSS, HTTPS forzado por Vercel y Render, y variables de entorno para todas las credenciales.'));

  children.push(bold('Manual de usuario'));
  children.push(p('Paso 1: Acceder a salsek.com desde cualquier navegador moderno.'));
  children.push(...img('landing.PNG', 'Landing page de Salesek'));
  children.push(p('Paso 2: Hacer clic en Comenzar gratis, registrarse con nombre, email y contraseña, verificar el código de 6 dígitos recibido por email, seleccionar plan y activar suscripción.'));
  children.push(...img('register.PNG', 'Formulario de registro'));
  children.push(...img('register(emailValidationNumber).PNG', 'Verificación de email con código de 6 dígitos'));
  children.push(...img('Register(planChosing).PNG', 'Selección del plan de suscripción'));
  children.push(...img('register(pay).PNG', 'Pantalla de pago para activar la suscripción'));
  children.push(p('Paso 3: Iniciar sesión con email y contraseña.'));
  children.push(...img('loginAdmin.PNG', 'Pantalla de inicio de sesión'));
  children.push(p('Paso 4: El dashboard principal muestra KPIs en tiempo real: leads activos, valor del pipeline, productos con stock bajo, y notificaciones pendientes.'));
  children.push(...img('dashboard1.PNG', 'Dashboard principal con KPIs y resumen del negocio'));
  children.push(...img('Dashboard(movileView).PNG', 'Vista del dashboard en dispositivo móvil'));
  children.push(p('Paso 5: En SalesFlow CRM, gestionar el pipeline de leads con vista Kanban, historial de comunicaciones, seguimientos programados y asistente de IA.'));
  children.push(...img('crm.PNG', 'Pipeline CRM de SalesFlow'));
  children.push(...img('crm(IA).PNG', 'Asistente de IA para generar respuestas profesionales'));
  children.push(p('Paso 6: En StockFlow, gestionar el inventario con alertas de stock bajo, registro de ventas y reposiciones, e historial de movimientos.'));
  children.push(...img('stock.PNG', 'Vista de inventario en StockFlow'));
  children.push(p('Paso 7: En Pedidos, gestionar los pedidos de compra generados automáticamente por The Bridge o creados manualmente.'));
  children.push(...img('pedidos.PNG', 'Listado de pedidos de compra'));
  children.push(p('Paso 8: Los proveedores acceden al portal exclusivo para consultar sus pedidos asignados.'));
  children.push(...img('dashboard(sullier).PNG', 'Portal exclusivo para proveedores'));
  children.push(p('Paso 9: El Owner gestiona el equipo invitando miembros y asignándoles roles.'));
  children.push(...img('equipo.PNG', 'Panel de gestión del equipo'));
  children.push(p('Paso 10: El Admin accede al panel global en /admin para gestionar todas las empresas de la plataforma.'));
  children.push(...img('admin.PNG', 'Panel de administración global'));
  children.push(p('Cuentas de demo (contraseña: password): admin@salesek.com (Admin), owner@salesek.com (Owner), employee@salesek.com (Employee), supplier@salesek.com (Supplier).'));

  children.push(bold('Manual de instalación'));
  children.push(p('Requisitos: Node.js 18+, PHP 8.x con PDO y pdo_pgsql, PostgreSQL 15, Git.'));
  children.push(p('1. Clonar el repositorio: git clone https://github.com/oussta/serelmejor'));
  children.push(p('2. Frontend: cd frontend && npm install && cp .env.example .env.local (configurar VITE_API_URL) && npm run dev'));
  children.push(p('3. Backend: cd backend && cp .env.example .env (completar todas las variables) && php -S localhost:8000'));
  children.push(p('4. Base de datos: crear base de datos PostgreSQL, ejecutar database/schema.sql, opcionalmente database/seeds.sql'));
  children.push(p('5. Deploy frontend en Vercel: conectar repositorio GitHub, configurar VITE_API_URL'));
  children.push(p('6. Deploy backend en Render: crear Web Service, configurar variables de entorno, deploy desde GitHub'));
  children.push(p('7. Deploy base de datos en Render: crear PostgreSQL, copiar cadena de conexión al .env del backend'));

  children.push(bold('Manual de configuración y administración'));
  children.push(p('Para añadir miembros: acceder a la sección Equipo, hacer clic en Invitar miembro, introducir email y seleccionar rol. Para configurar proveedores y stock mínimo: en StockFlow, editar cada producto para configurar min_stock y asignar proveedor. El panel de administración en /admin es exclusivo para el rol admin y permite gestionar todas las empresas.'));
  children.push(pb());

  // Section 4
  children.push(h('4. SEGUIMIENTO Y CONTROL', 1));

  children.push(h('4.1 Valoración del proyecto', 2));
  children.push(p('Los medios de evaluación de la calidad son: pruebas de API con Postman cubren los 61 endpoints con verificación de códigos HTTP y estructura JSON; pruebas de UI con Chrome DevTools verifican tiempos de carga y ausencia de errores en consola; verificación de integridad de base de datos con pgAdmin 4; y auditoría de Lighthouse para rendimiento, accesibilidad y SEO.'));
  children.push(p('Los indicadores de calidad definidos: tiempo de respuesta API bajo 500ms en el 95 % de peticiones, puntuación Lighthouse superior a 85 en rendimiento y 90 en SEO, cero vulnerabilidades SQL injection gracias a PDO, HTTPS en todas las conexiones, validación JWT en el 100 % de endpoints protegidos, y cobertura Postman del 100 % de los 61 endpoints.'));
  children.push(p('El protocolo de evaluación final consiste en probar cada rol con sus cuentas de demo verificando las restricciones de acceso, y ejecutar el flujo completo de The Bridge: crear lead con producto, marcarlo como ganado, y verificar el descuento de stock y creación automática de pedido.'));

  children.push(h('4.2 Incidencias', 2));
  children.push(p('El protocolo de resolución sigue tres fases. Recopilación: revisar logs de Render, errores en consola del navegador, y historial de consultas en pgAdmin. Solución: para errores de servidor revisar error_log de PHP en Render; para errores de frontend usar DevTools; para errores de base de datos ejecutar consultas en pgAdmin. Registro: todas las incidencias se documentan como issues en GitHub con etiqueta, descripción, pasos para reproducir, y commit de resolución.'));
  children.push(tbl(
    ['Incidencia', 'Síntoma', 'Causa', 'Resolución'],
    [
      ['Error CORS', 'Error de red en petición a API', 'Header CORS faltante', 'Configurar Access-Control-Allow-Origin correcto'],
      ['JWT expirado', 'Error 401 en todas las peticiones', 'Token JWT caducado', 'Frontend detecta 401 y redirige a login'],
      ['SendGrid spam', 'Emails no llegan o van a spam', 'Dominio no verificado', 'Verificar dominio, revisar SPF/DKIM'],
      ['Cold start Render', 'Primer request tarda 30 segundos', 'Render hiberna en tier gratuito', 'Upgrade a tier pagado'],
      ['Stock negativo', 'Stock cae por debajo de 0', 'Falta validación de stock suficiente', 'Validar en ProductController antes de descontar'],
    ],
    [2257, 2256, 2256, 2257]
  ));
  children.push(new Paragraph({ text: '' }));

  children.push(h('4.3 Cambios', 2));
  children.push(p('Las migraciones de base de datos se gestionan mediante scripts SQL manuales en database/ documentados en commits Git. Las actualizaciones del frontend se despliegan automáticamente en Vercel al hacer push a main. Las actualizaciones del backend se redespl egaron automáticamente en Render. La arquitectura stateless con JWT permite escala horizontal instantánea sin compartir estado de sesión. Las mejoras futuras planificadas incluyen: integración Stripe completa, app móvil con Capacitor, analíticas avanzadas, arquitectura multi-tenant para white-label, e integraciones vía webhooks con Zapier y Slack.'));

  children.push(h('4.4 Pruebas y soporte', 2));
  children.push(p('Pruebas de red: HTTPS verificado en salsek.com vía candado del navegador, peticiones API probadas con Postman sobre HTTPS, CORS configurado para rechazar orígenes distintos a salsek.com en producción.'));
  children.push(p('Pruebas de carga: múltiples peticiones simultáneas con Postman runner. El tier gratuito de Render maneja hasta 50 usuarios concurrentes con tiempos bajo 800ms.'));
  children.push(p('Pruebas de seguridad: SQL injection probado en endpoint de login (PDO bloqueó correctamente), XSS probado en campos de texto (htmlspecialchars convirtió caracteres), JWT manipulado (firma HMAC detectó la alteración con 401), acceso por rol no autorizado (RoleMiddleware devolvió 403).'));
  children.push(p('Pruebas de acceso: employee no puede acceder a /team (403), supplier solo ve el portal de pedidos (403 en cualquier otro endpoint), admin accede a /admin/stats y /admin/businesses, owner tiene acceso completo excepto al admin global.'));
  children.push(p('Copias de seguridad: Render PostgreSQL realiza backups diarios con retención de 7 días. Código respaldado en GitHub con historial completo. Variables de entorno documentadas de forma segura fuera del repositorio.'));
  children.push(p('SLA: disponibilidad garantizada del 99,5 % mensual por Render. Soporte por email con respuesta en 24 horas para consultas generales y 48 horas para parches de seguridad críticos.'));
  children.push(...img('sendgrid_activity.png', 'Panel de actividad de SendGrid verificando la entrega de emails'));

  return new Document({
    creator: 'Yasser Azzouz',
    title: 'SALESEK — Memoria Final de Proyecto Integrado DAW',
    description: 'Memoria final del proyecto Salesek para el ciclo formativo DAW en Digi-Tech',
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'Salesek — Memoria Final DAW — Yasser Azzouz — ', size: 18 }),
              new PageNumberElement(),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children,
    }],
  });
}

// ─── ENGLISH CONTENT ────────────────────────────────────────────────────────

function buildEN() {
  const children = [];

  // Cover page
  children.push(new Paragraph({ text: '', spacing: { before: 2000 } }));
  const logoRun = imgRun('landing.PNG', 300);
  if (logoRun) {
    children.push(new Paragraph({ children: [logoRun], alignment: AlignmentType.CENTER }));
  }
  children.push(new Paragraph({
    children: [new TextRun({ text: 'SALESEK', bold: true, size: 64, font: 'Calibri', color: '2563EB' })],
    alignment: AlignmentType.CENTER, spacing: { before: 400, after: 100 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'SaaS CRM and Inventory Platform for SMEs', size: 36, font: 'Calibri' })],
    alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Final Project Report — DAW Vocational Training Cycle', italics: true, size: 28, font: 'Calibri' })],
    alignment: AlignmentType.CENTER, spacing: { before: 100, after: 600 },
  }));
  [
    ['Student', 'YASSER AZZOUZ'],
    ['Tutor', 'SANTIAGO ARIEL FERNANDEZ'],
    ['School', 'DIGI-TECH DAW'],
    ['Academic year', '2025/2026'],
  ].forEach(([label, value]) => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: 24 }),
        new TextRun({ text: value, size: 24 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
    }));
  });
  children.push(pb());

  children.push(h('1. NEEDS IDENTIFICATION', 1));
  children.push(h('1.1 Context', 2));
  children.push(p('The business software sector for small and medium-sized enterprises (SMEs) in Spain is undergoing rapid transformation. According to data from the Central Business Directory (DIRCE), 99.8% of Spanish companies are SMEs, meaning they have fewer than 250 employees. However, most of them operate with completely disconnected tools: Excel spreadsheets to manage inventory, messaging apps like WhatsApp to follow up with customers, and ordinary email to communicate with suppliers. This technological fragmentation generates serious inefficiencies and economic losses that could be avoided with an integrated and affordable solution.'));
  children.push(p('Salesek is designed for small businesses with 1 to 10 employees that have no technology department and no budget for solutions like Salesforce or HubSpot. Typical customer profiles include retail stores, small distributors, service agencies, freelancers with active client portfolios, workshops, and creative studios. They all share the same reality: they lose sales opportunities because they have no organized follow-up system, and they lose money on inventory because they have no real-time stock visibility.'));
  children.push(p('The identified need has two concrete and quantifiable dimensions. First, the loss of potential clients: sales studies show that 80% of sales require at least five follow-up contacts, but 44% of salespeople give up after the first attempt. Without a system that automates reminders and centralizes communication history, potential clients are simply forgotten. Second, poor inventory management generates two opposite but equally harmful problems: stockouts that cause direct sales losses, and excess stock that ties up capital and generates storage costs. Spanish SMEs without a digital inventory system lose an average of 2,000 to 8,000 euros annually.'));
  children.push(...img('landing.PNG', 'Salesek main page at salsek.com'));
  children.push(...img('features.PNG', 'Main modules and features of the platform'));

  children.push(h('1.2 Justification', 2));
  children.push(p('Salesek directly addresses both identified needs through two specialized modules working in an integrated way. SalesFlow is the CRM module that solves client loss. It provides a visual Kanban pipeline, complete communication history, automated follow-up reminders, and an AI assistant powered by Groq LLaMA for drafting professional responses in seconds. StockFlow is the inventory management module with real-time stock tracking, minimum stock alerts, and AI-powered order quantity suggestions. The Bridge is the unique differentiating automation that connects both modules: when a deal is marked as won in SalesFlow, it automatically updates stock in StockFlow and creates a purchase order to the supplier if stock falls below the minimum.'));
  children.push(tbl(
    ['Feature', 'Salesek', 'Excel', 'HubSpot', 'Salesforce', 'Zoho CRM'],
    [
      ['Monthly price', 'From €29', 'Included in Office', 'From €45/user', 'From €25/user', 'From €14/user'],
      ['Visual CRM', 'Yes', 'Manual', 'Yes', 'Yes', 'Yes'],
      ['Integrated inventory', 'Yes', 'Manual', 'No', 'Extra module', 'Limited'],
      ['AI assistant', 'Yes (Groq LLaMA)', 'No', 'With AI add-on', 'With AI add-on', 'Limited'],
      ['Automatic orders', 'Yes (The Bridge)', 'No', 'No', 'No', 'No'],
      ['Supplier portal', 'Yes', 'No', 'No', 'No', 'No'],
      ['Ease of use', 'High', 'Medium', 'Medium', 'Low', 'Medium'],
      ['Spanish support', 'Full', 'Yes', 'Partial', 'Yes', 'Partial'],
    ],
    [2200, 1366, 1365, 1365, 1365, 1365]
  ));
  children.push(new Paragraph({ text: '' }));
  children.push(...img('prices.PNG', 'Salesek pricing plans: SalesFlow, StockFlow, and Suite'));
  children.push(...img('howItWork.PNG', 'Salesek platform workflow diagram'));

  children.push(h('1.3 Other aspects', 2));
  children.push(p('From a legal and fiscal perspective, Salesek operates as a SaaS platform subject to various regulatory obligations in Spain. Regarding data protection, the platform fully complies with the General Data Protection Regulation (GDPR). Technical measures implemented include: bcrypt password hashing (PASSWORD_BCRYPT in PHP), JWT authentication with 24-hour expiry, exclusive use of HTTPS, PDO prepared statements for all database interactions, and htmlspecialchars() sanitization to prevent XSS. Privacy policy, legal notice, and cookies policy are published in compliance with LSSI-CE (Spanish E-commerce Law). SaaS subscriptions sold to Spanish companies are subject to 21% VAT.'));
  children.push(p('Regarding grants and subsidies, the Spanish government\'s Kit Digital program offers up to 12,000 euros for SMEs with 3 to 9 employees for digitalization initiatives, within which Salesek qualifies perfectly as an integrated client and inventory management tool. Regional grants are also available in Catalonia and Madrid for early-stage tech startups.'));
  children.push(p('The workflow followed was: (1) market research and need identification, (2) plate grammar analysis defining user stories and functional requirements, (3) UI/UX design in Stitch/Figma defining the design system with CSS variables, (4) database design and E-R diagram, (5) PHP 8 backend development with Postman testing, (6) React 18 frontend development, (7) integration and end-to-end testing, (8) deployment on Render and Vercel, (9) documentation.'));
  children.push(...img('contact.PNG', 'Salesek contact form'));
  children.push(pb());

  children.push(h('2. PROJECT DESIGN', 1));
  children.push(h('2.1 Content', 2));
  children.push(p('The full scope of Salesek includes: public landing page with complete SEO (sitemap.xml, robots.txt, Schema.org, Open Graph), authentication system with email verification, SalesFlow CRM module with visual Kanban pipeline, StockFlow inventory module with alerts, The Bridge automation, email system via SendGrid, real-time notifications via WebSockets, global admin panel, supplier portal, and multilingual support in ES/EN/FR.'));
  children.push(p('Each technology decision was thoroughly analyzed. React 18 was chosen for the frontend for its mature ecosystem and support for dynamic UIs without page reloads. PHP 8 was chosen for the backend to build a robust REST API without framework overhead. PostgreSQL 15 was chosen over MySQL for its robustness with complex data types and full CASCADE foreign key support. PDO prevents SQL injection automatically via prepared statements. SendGrid guarantees high transactional email delivery rates. Groq with LLaMA offers the highest AI capability available on the free tier. WebSockets enable real-time notifications without polling.'));
  children.push(...img('code_api_routes_auth.PNG', 'REST API structure: authentication routes in api.php'));
  children.push(...img('code_api_routes_leads.PNG', 'REST API structure: lead management routes in api.php'));

  children.push(h('2.2 Objectives and resources', 2));
  children.push(p('Project objectives: (1) build a functional SaaS CRM platform, (2) build a complete integrated inventory system, (3) implement The Bridge as differentiating automation, (4) implement secure scalable JWT authentication, (5) integrate Groq LLaMA AI, (6) deploy to production with high availability, (7) achieve fully responsive design, (8) implement complete SEO strategy. Hardware resources: ASUS development laptop, Render Web Service (shared CPU, 512MB RAM), Render PostgreSQL (1GB storage), Vercel global CDN, Namecheap domain server. Software resources: VSCode, Node.js 18, PHP 8, PostgreSQL 15, pgAdmin 4, Postman, GitHub, Git, npm, browser DevTools.'));

  children.push(h('2.3 Economic feasibility', 2));
  children.push(tbl(
    ['Item', 'Cost', 'Frequency', 'Annual cost'],
    [
      ['Development (300h x €15/h)', '€4,500', 'One-time', '€4,500'],
      ['Render Web Service (backend)', '€7/mo', 'Monthly', '€84'],
      ['Render PostgreSQL', '€7/mo', 'Monthly', '€84'],
      ['Namecheap domain (salsek.com)', '€12/yr', 'Annual', '€12'],
      ['SendGrid (up to 100 emails/day)', '€0', 'Free tier', '€0'],
      ['Groq API (LLaMA)', '€0', 'Free tier', '€0'],
      ['Vercel (frontend CDN)', '€0', 'Free tier', '€0'],
      ['TOTAL YEAR 1', '', '', '€4,680'],
      ['TOTAL MONTHLY INFRA', '€14/mo', 'Monthly', '€168/yr'],
    ],
    [3800, 1542, 2142, 1542]
  ));
  children.push(new Paragraph({ text: '' }));
  children.push(p('With only 10 customers on the basic plan (€290/month revenue), the platform already exceeds the monthly infrastructure cost (€14). The Kit Digital grant (up to €12,000) could fully cover development costs. Revenue from subscriptions: SalesFlow €29/month, StockFlow €29/month, Suite €49/month.'));

  children.push(h('2.4 Solution model', 2));
  children.push(p('Salesek follows a modern client-server architecture with complete separation between frontend and backend. The React SPA is deployed on Vercel and served via global CDN. It communicates exclusively via HTTPS with the PHP 8 REST API on Render, which connects to PostgreSQL 15 on Render. JWT tokens authenticate every protected request. SendGrid handles all transactional emails. Groq processes AI requests. WebSockets deliver real-time notifications.'));
  children.push(tbl(
    ['Permission / Module', 'Admin', 'Owner', 'Employee', 'Supplier'],
    [
      ['Admin panel', 'Yes', 'No', 'No', 'No'],
      ['All businesses management', 'Yes', 'No', 'No', 'No'],
      ['Subscription management', 'Yes', 'Yes', 'No', 'No'],
      ['Team management', 'Yes', 'Yes', 'No', 'No'],
      ['SalesFlow CRM (leads)', 'Yes', 'Yes', 'Yes', 'No'],
      ['StockFlow inventory', 'Yes', 'Yes', 'Yes', 'No'],
      ['Purchase orders', 'Yes', 'Yes', 'Yes', 'Read-only'],
      ['Supplier portal', 'No', 'No', 'No', 'Yes'],
      ['Business settings', 'Yes', 'Yes', 'No', 'No'],
      ['Stats and dashboard', 'Yes', 'Yes', 'Limited', 'No'],
    ],
    [3800, 1307, 1306, 1306, 1307]
  ));
  children.push(new Paragraph({ text: '' }));
  children.push(p('The Entity-Relationship model consists of 12 interrelated tables. businesses is the central multi-tenant entity. users stores all users with role and bcrypt hash. subscriptions records each business\'s active plan. leads stores CRM pipeline prospects. lead_messages stores communication history. followups stores scheduled follow-ups. products stores inventory with current and minimum stock. stock_movements records every stock entry and exit. suppliers stores business suppliers. purchase_orders records orders with states pending/sent/confirmed/delivered. notifications stores real-time notifications. contact_messages stores landing page contact form submissions.'));
  children.push(...img('ER-DIAGRAM.png', 'Complete Entity-Relationship diagram of the Salesek database (12 tables)'));
  children.push(pb());

  children.push(h('3. PROJECT EXECUTION', 1));
  children.push(h('3.1 Time planning', 2));
  children.push(p('The project was planned with clear technical dependencies. Phase 1 (Authentication) must be completed before all others. Phases 2 and 4 can be developed in parallel. Phase 6 (The Bridge) depends on both Phases 2 and 4. Phases 7 and 8 can run in parallel after Phase 6. Phases 9 and 10 are independent of each other. The per-phase protocol is: create DB tables, build PHP endpoints, test with Postman, build React components, connect frontend to backend, verify end-to-end, commit to GitHub.'));

  children.push(h('3.2 Risks', 2));
  children.push(tbl(
    ['Risk', 'Probability', 'Impact', 'Prevention', 'Solution'],
    [
      ['Render server downtime', 'Low', 'High', 'SLA 99.5%, paid tier', 'Monitoring, auto-restart'],
      ['PostgreSQL data loss', 'Very Low', 'Critical', 'Daily automated backups', 'Restore from backup'],
      ['API key exposure', 'Medium', 'Critical', 'Env variables, .gitignore', 'Revoke and regenerate keys'],
      ['Scope creep', 'High', 'Medium', 'Defined phases, v2 backlog', 'Move new features to backlog'],
      ['Browser incompatibility', 'Medium', 'Medium', 'Modern CSS with fallbacks', 'Add polyfills'],
      ['SendGrid delivery to spam', 'Medium', 'Medium', 'Verified domain, SPF/DKIM', 'Review SendGrid activity feed'],
      ['Groq API rate limits', 'Medium', 'Low', 'Handle 429 errors', 'Retry with backoff'],
      ['Render cold start', 'High', 'Low', 'Document in SLA', 'Upgrade to paid tier'],
    ],
    [2200, 1300, 1200, 2163, 2163]
  ));
  children.push(new Paragraph({ text: '' }));

  children.push(h('3.3 Resource review', 2));
  children.push(p('The budget review shows a 3% variance (actual €4,185 vs planned €4,050). Authentication and The Bridge phases took longer due to transaction management and edge cases. AI integrations were faster thanks to clear Groq documentation. Free tiers of SendGrid, Groq, and Vercel represented significant savings compared to initial estimates.'));

  children.push(h('3.4 Execution documentation', 2));
  children.push(bold('Configuration files'));
  children.push(p('The backend .env file contains the following variables (never stored in Git): DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT, JWT_SECRET, JWT_EXPIRY, SENDGRID_KEY, SENDGRID_FROM, GROQ_KEY, APP_ENV, FRONTEND_URL. The vite.config.js configures Vite with React support. VITE_API_URL is set in Vercel pointing to https://serelmejor.onrender.com. CORS configuration restricts requests to https://salsek.com in production.'));

  children.push(bold('Technical characteristics'));
  children.push(p('Frontend: React 18, Vite, react-router-dom v6, react-i18next, react-helmet-async, Plus Jakarta Sans font, Material Symbols icons. Backend: Pure PHP 8 without framework, PDO, custom JWT implementation, native bcrypt, cURL for external APIs. Database: PostgreSQL 15, 12 tables, foreign keys with CASCADE. Deployment: Vercel for frontend (auto-deploy from GitHub main), Render for backend and PostgreSQL.'));

  children.push(bold('Source code: JWT and bcrypt authentication'));
  children.push(...img('code_jwt_bcrypt.PNG', 'Authentication code: bcrypt verification and JWT token generation'));
  children.push(p('When a user sends email and password to POST /login, AuthController retrieves the user via PDO prepared statement. password_verify() compares the sent password against the bcrypt hash in the database. If valid, JWTHelper::generate() creates a JWT signed with HMAC-SHA256 containing user_id, role, business_id and email_verified. This token is returned to the frontend, stored in localStorage, and included in the Authorization header of every subsequent API request.'));

  children.push(bold('Why JWT over session cookies'));
  children.push(p('During planning, both JWT and traditional server-side session cookies were evaluated. JWT was chosen for five fundamental reasons. First, JWT is completely stateless: the server does not need to store session data, enabling horizontal scaling across multiple servers without session synchronization. Second, JWT works natively with mobile applications that cannot manage browser cookies, preparing the platform for a future native app without API changes. Third, JWT eliminates CSRF attacks because the token must be explicitly included in the Authorization header, impossible for a malicious site to send automatically. Fourth, the JWT payload contains user_id, role, and business_id, eliminating additional database queries on every request. Fifth, the 24-hour expiry is built into the token itself, giving full control over session duration.'));

  children.push(...img('code_tokenValidation.PNG', 'JWT validation middleware on every protected request'));
  children.push(p('AuthMiddleware::authenticate() extracts the Bearer token from the Authorization header, verifies the HMAC-SHA256 signature with JWT_SECRET, checks the token expiry, and returns the decoded payload. If the token is invalid or expired, it returns HTTP 401 Unauthorized immediately.'));

  children.push(bold('Source code: The Bridge'));
  children.push(...img('code_bridge_automation.PNG', 'The Bridge code: CRM-Inventory automation when closing a deal'));
  children.push(p('The Bridge is Salesek\'s differentiating feature. When PUT /leads/{id}/status receives the status "won", BridgeService checks if the lead has a product_id and quantity. If so, it deducts stock in an atomic PDO transaction. If the new stock falls below min_stock, it automatically creates a purchase_order and sends an email to the supplier via SendGrid with the order details. The entire process runs in a single database transaction ensuring system consistency.'));

  children.push(bold('Source code: SendGrid'));
  children.push(...img('code_sendgrid_api.PNG', 'SendGrid API v3 integration implementation'));
  children.push(p('All transactional emails use SendGrid API v3 via PHP cURL with Bearer authentication. Emails sent: 6-digit email verification code on registration (valid 15 minutes), welcome email after verification, 6-digit password reset code (valid 30 minutes), automatic purchase order notification to supplier, and subscription cancellation confirmation.'));

  children.push(bold('Security policy'));
  children.push(p('Security policy implements multiple layers: bcrypt for all passwords (PASSWORD_BCRYPT, cost factor 10), JWT with 24-hour expiry and HMAC-SHA256 signature, AuthMiddleware on all protected endpoints, RoleMiddleware on sensitive endpoints, PDO with bound parameters preventing SQL injection across all 61 endpoints, htmlspecialchars() preventing XSS, HTTPS enforced by Vercel and Render, and environment variables for all credentials.'));

  children.push(bold('User manual'));
  children.push(p('Step 1: Go to salsek.com. Step 2: Click "Get started free", register with name, email and password, verify the 6-digit code sent by email, select a plan and activate subscription. Step 3: Log in. Step 4: Dashboard shows real-time KPIs. Step 5: In SalesFlow CRM, manage your lead pipeline with Kanban view, communication history, and AI assistant. Step 6: In StockFlow, manage inventory with low-stock alerts, sales and restock recording, and movement history. Step 7: In Orders, manage purchase orders generated automatically by The Bridge or created manually. Step 8: Suppliers access the exclusive portal to check their assigned orders. Step 9: Owner manages team members. Step 10: Admin accesses the global panel at /admin.'));
  children.push(p('Demo accounts (password: password): admin@salesek.com (Admin), owner@salesek.com (Owner), employee@salesek.com (Employee), supplier@salesek.com (Supplier).'));
  children.push(...img('dashboard1.PNG', 'Main dashboard with KPIs'));
  children.push(...img('crm.PNG', 'SalesFlow CRM pipeline'));
  children.push(...img('stock.PNG', 'StockFlow inventory view'));

  children.push(bold('Installation manual'));
  children.push(p('Prerequisites: Node.js 18+, PHP 8.x with PDO and pdo_pgsql, PostgreSQL 15, Git. Steps: 1) Clone the repository: git clone https://github.com/oussta/serelmejor. 2) Frontend: cd frontend && npm install && cp .env.example .env.local (set VITE_API_URL) && npm run dev. 3) Backend: cd backend && cp .env.example .env (fill all variables) && php -S localhost:8000. 4) Database: create PostgreSQL database, run database/schema.sql, optionally run database/seeds.sql. 5) Deploy frontend to Vercel: connect GitHub repo, set VITE_API_URL. 6) Deploy backend to Render: create Web Service, set all environment variables. 7) Deploy database to Render: create PostgreSQL instance, copy connection string.'));
  children.push(pb());

  children.push(h('4. MONITORING AND CONTROL', 1));
  children.push(h('4.1 Project evaluation', 2));
  children.push(p('Quality evaluation means: Postman tests covering all 61 endpoints with HTTP code and JSON structure verification; UI testing with Chrome DevTools checking load times and console errors; database integrity verification with pgAdmin 4; and Lighthouse audit for performance, accessibility, and SEO. Quality indicators: API response time under 500ms for 95% of requests, Lighthouse score above 85 for performance and 90 for SEO, zero SQL injection vulnerabilities thanks to PDO, HTTPS on all connections, JWT validation on 100% of protected endpoints, and 100% Postman coverage of all 61 endpoints.'));

  children.push(h('4.2 Incidents', 2));
  children.push(tbl(
    ['Incident', 'Symptom', 'Cause', 'Resolution'],
    [
      ['CORS error', 'Network error on API request', 'Missing CORS header', 'Configure correct Access-Control-Allow-Origin'],
      ['JWT expired', '401 error on all requests', 'JWT token expired after 24h', 'Frontend detects 401 and redirects to login'],
      ['SendGrid spam', 'Emails not arriving or going to spam', 'Unverified domain', 'Verify domain, check SPF/DKIM'],
      ['Render cold start', 'First request takes 30 seconds', 'Render hibernates on free tier', 'Upgrade to paid tier'],
      ['Negative stock', 'Stock falls below 0', 'Missing sufficient stock validation', 'Validate in ProductController before deducting'],
    ],
    [2257, 2256, 2256, 2257]
  ));
  children.push(new Paragraph({ text: '' }));

  children.push(h('4.3 Changes', 2));
  children.push(p('Database migrations are managed via manual SQL scripts in the database/ folder, documented in Git commits. Frontend updates deploy automatically to Vercel on push to main. Backend updates redeploy automatically on Render. The stateless JWT architecture enables instant horizontal scaling. Future improvements planned: complete Stripe payment integration, mobile app with Capacitor, advanced analytics dashboard, multi-tenant white-label architecture, and webhook integrations with Zapier and Slack.'));

  children.push(h('4.4 Testing and support', 2));
  children.push(p('Network tests: HTTPS verified on salsek.com via browser padlock, API calls tested with Postman over HTTPS, CORS configured to reject origins other than salsek.com in production. Load tests: multiple simultaneous Postman runner requests. Free tier Render handles up to 50 concurrent users with response times under 800ms. Security tests: SQL injection tested on login endpoint (PDO blocked correctly), XSS tested on text fields (htmlspecialchars converted characters), JWT manipulation detected (HMAC signature verification returned 401), unauthorized role access blocked (RoleMiddleware returned 403). Access tests: employee cannot access /team (403), supplier only sees the orders portal, admin accesses /admin/stats and /admin/businesses, owner has full business access except global admin. Backups: Render PostgreSQL daily backups with 7-day retention. SLA: 99.5% monthly availability guaranteed by Render, email support within 24 hours for general queries and 48 hours for critical security patches.'));

  return new Document({
    creator: 'Yasser Azzouz',
    title: 'SALESEK — Final Project Report DAW',
    description: 'Final project report for Salesek, DAW vocational training cycle at Digi-Tech',
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'Salesek — Final Project Report DAW — Yasser Azzouz — Pg. ', size: 18 }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children,
    }],
  });
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Building memoria_ES.docx...');
  const docES = buildES();
  const bufES = await Packer.toBuffer(docES);
  fs.writeFileSync(path.join(BASE, 'docs', 'memoria_ES.docx'), bufES);
  console.log('  Saved docs/memoria_ES.docx (' + Math.round(bufES.length / 1024) + ' KB)');

  console.log('Building memoria_EN.docx...');
  const docEN = buildEN();
  const bufEN = await Packer.toBuffer(docEN);
  fs.writeFileSync(path.join(BASE, 'docs', 'memoria_EN.docx'), bufEN);
  console.log('  Saved docs/memoria_EN.docx (' + Math.round(bufEN.length / 1024) + ' KB)');

  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
