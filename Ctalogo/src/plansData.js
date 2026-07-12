export const plans = [
  {
    id: 1,
    name: 'Plan 1 — Landing Page',
    shortName: 'Landing Page',
    description: 'Una Landing Page es una página web de una sola sección diseñada para captar clientes o promocionar un producto, servicio o evento. Su objetivo principal es convertir visitantes en clientes potenciales.',
    idealFor: [
      'Emprendedores',
      'Negocios nuevos',
      'Productos',
      'Eventos',
      'Campañas publicitarias',
      'Restaurantes',
      'Consultorios'
    ],
    includes: [
      'Diseño personalizado',
      'Información de la empresa',
      'Galería de imágenes',
      'Formulario de contacto',
      'Botón de WhatsApp',
      'Google Maps',
      'Redes sociales'
    ],
    pricing: {
      devMin: 150,
      devMax: 400,
      devRaw: '150 – 400 USD',
      hostingRec: 'Hostinger Single',
      hostingPrice: 1.79,
      hostingRaw: '1,79 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15, // average
      timeRaw: '3 a 7 días'
    },
    category: 'basic',
    icon: 'Compass'
  },
  {
    id: 2,
    name: 'Plan 2 — Sitio Web Corporativo',
    shortName: 'Sitio Web Corporativo',
    description: 'Página web institucional para presentar una empresa o negocio en Internet. Incluye varias secciones con información detallada sobre la organización.',
    idealFor: [
      'Empresas',
      'Constructoras',
      'Clínicas',
      'Hoteles',
      'Instituciones educativas',
      'Estudios jurídicos'
    ],
    includes: [
      'Inicio',
      'Nosotros',
      'Servicios',
      'Galería',
      'Contacto',
      'Formularios',
      'Google Maps',
      'WhatsApp',
      'Panel básico de administración (opcional)'
    ],
    pricing: {
      devMin: 350,
      devMax: 900,
      devRaw: '350 – 900 USD',
      hostingRec: 'Hostinger Premium',
      hostingPrice: 2.99,
      hostingRaw: '2,99 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '1 a 3 semanas'
    },
    category: 'medium',
    icon: 'Building'
  },
  {
    id: 3,
    name: 'Plan 3 — Portafolio Profesional',
    shortName: 'Portafolio Profesional',
    description: 'Sitio web diseñado para mostrar proyectos, experiencia profesional y trabajos realizados.',
    idealFor: [
      'Arquitectos',
      'Diseñadores',
      'Fotógrafos',
      'Ingenieros',
      'Programadores',
      'Freelancers'
    ],
    includes: [
      'Presentación personal',
      'Proyectos',
      'Currículum',
      'Contacto',
      'Redes sociales'
    ],
    pricing: {
      devMin: 200,
      devMax: 500,
      devRaw: '200 – 500 USD',
      hostingRec: 'Hostinger Single',
      hostingPrice: 1.79,
      hostingRaw: '1,79 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '3 a 7 días'
    },
    category: 'basic',
    icon: 'Briefcase'
  },
  {
    id: 4,
    name: 'Plan 4 — Blog',
    shortName: 'Blog',
    description: 'Página web enfocada en publicar noticias, artículos o contenido de manera periódica.',
    idealFor: [
      'Revistas',
      'Noticias',
      'Empresas',
      'Educación'
    ],
    includes: [
      'Publicaciones',
      'Categorías',
      'Buscador',
      'Comentarios (opcional)'
    ],
    pricing: {
      devMin: 400,
      devMax: 900,
      devRaw: '400 – 900 USD',
      hostingRec: 'Hostinger Premium',
      hostingPrice: 2.99,
      hostingRaw: '2,99 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '1 a 2 semanas'
    },
    category: 'medium',
    icon: 'BookOpen'
  },
  {
    id: 5,
    name: 'Plan 5 — Catálogo de Productos',
    shortName: 'Catálogo de Productos',
    description: 'Permite mostrar productos o servicios de manera organizada, sin realizar ventas en línea.',
    idealFor: [
      'Tiendas',
      'Farmacias',
      'Ferreterías',
      'Distribuidores'
    ],
    includes: [
      'Categorías',
      'Buscador',
      'Filtros',
      'Galería',
      'Contacto'
    ],
    pricing: {
      devMin: 500,
      devMax: 1200,
      devRaw: '500 – 1.200 USD',
      hostingRec: 'Hostinger Premium',
      hostingPrice: 2.99,
      hostingRaw: '2,99 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '2 a 3 semanas'
    },
    category: 'medium',
    icon: 'ShoppingBag'
  },
  {
    id: 6,
    name: 'Plan 6 — Tienda Virtual (Catálogo + Carrito a WhatsApp)',
    shortName: 'Tienda Virtual',
    description: 'Sitio web con catálogo de productos y carrito de compras, donde el pedido finaliza enviando un mensaje detallado directamente al WhatsApp del vendedor para concretar la compra.',
    idealFor: [
      'Comercios locales',
      'Tiendas de ropa y calzado',
      'Emprendedores de venta directa',
      'Distribuidoras minoristas'
    ],
    includes: [
      'Catálogo completo de productos',
      'Carrito de compras interactivo',
      'Finalización de pedido vía WhatsApp',
      'Gestión de inventario y stock',
      'Gestión de pedidos en panel',
      'Panel administrativo completo'
    ],
    pricing: {
      devMin: 900,
      devMax: 2500,
      devRaw: '900 – 2.500 USD',
      hostingRec: 'Hostinger Premium',
      hostingPrice: 2.99,
      hostingRaw: '2,99 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '3 a 8 semanas'
    },
    category: 'advanced',
    icon: 'ShoppingCart'
  },
  {
    id: 7,
    name: 'Plan 7 — Sistema Web Personalizado',
    shortName: 'Sistema Web Personalizado',
    description: 'Aplicación web desarrollada completamente a medida según las necesidades del cliente. A diferencia de una página web informativa, permite gestionar información, automatizar procesos y controlar la operación diaria de un negocio.',
    idealFor: [
      'Sistema Hotelero',
      'Sistema Escolar',
      'Sistema para Farmacias',
      'Sistema Médico',
      'Sistema de Inventario',
      'Sistema Contable',
      'Sistema de Facturación',
      'Sistema de Recursos Humanos'
    ],
    includes: [
      'Inicio de sesión',
      'Roles y permisos avanzados',
      'Panel administrativo central',
      'Reportes en tiempo real',
      'Base de datos dedicada',
      'Exportación PDF y Excel',
      'Notificaciones automáticas',
      'API integrada',
      'Módulos personalizados'
    ],
    pricing: {
      devMin: 1500,
      devMax: null,
      devRaw: '1.500 USD en adelante',
      hostingRec: 'Hostinger Business',
      hostingPrice: 4.39,
      hostingRaw: '4,39 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '1 a 6 meses'
    },
    saas: {
      setupFee: 300,
      monthlyPrice: 50,
      setupRaw: '300 USD',
      monthlyRaw: '50 USD/mes'
    },
    category: 'advanced',
    icon: 'Cpu'
  },
  {
    id: 8,
    name: 'Plan 8 — CRM',
    shortName: 'CRM',
    description: 'Sistema para administrar clientes, ventas, cotizaciones, oportunidades de negocio y seguimiento comercial.',
    idealFor: [
      'Empresas de ventas',
      'Inmobiliarias',
      'Distribuidores',
      'Agencias comerciales'
    ],
    includes: [
      'Gestión de clientes (leads)',
      'Cotizaciones dinámicas',
      'Registro de ventas',
      'Seguimiento y embudo de conversión',
      'Reportes de rendimiento',
      'Dashboard estadístico'
    ],
    pricing: {
      devMin: 2000,
      devMax: 6000,
      devRaw: '2.000 – 6.000 USD',
      hostingRec: 'Hostinger Business',
      hostingPrice: 4.39,
      hostingRaw: '4,39 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '2 a 5 meses'
    },
    saas: {
      setupFee: 400,
      monthlyPrice: 60,
      setupRaw: '400 USD',
      monthlyRaw: '60 USD/mes'
    },
    category: 'advanced',
    icon: 'Users'
  },
  {
    id: 9,
    name: 'Plan 9 — ERP',
    shortName: 'ERP',
    description: 'Sistema integral que centraliza y automatiza los procesos principales de una empresa, como inventario, compras, ventas, recursos humanos, contabilidad y producción.',
    idealFor: [
      'Empresas medianas/grandes',
      'Negocios con múltiples sucursales',
      'Empresas de producción'
    ],
    includes: [
      'Inventario y almacenes',
      'Gestión de compras',
      'Gestión de ventas y facturación',
      'Recursos humanos (RRHH)',
      'Reportes consolidados',
      'Dashboard integral',
      'Múltiples sucursales',
      'Roles y permisos avanzados'
    ],
    pricing: {
      devMin: 4000,
      devMax: 15000,
      devRaw: '4.000 – 15.000 USD',
      hostingRec: 'VPS (según requerimiento)',
      hostingPrice: 5.00,
      hostingRaw: 'Desde 5 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '4 a 10 meses'
    },
    saas: {
      setupFee: 800,
      monthlyPrice: 120,
      setupRaw: '800 USD',
      monthlyRaw: '120 USD/mes'
    },
    category: 'advanced',
    icon: 'Layers'
  }
];

export const generalFeatures = [
  'Diseño adaptable (Responsive) para PC, Tablet y Celular.',
  'Certificado SSL (HTTPS) incluido.',
  'Optimización SEO básica para Google.',
  'Capacitación completa para el uso del sistema.',
  'Código fuente disponible o administrado según el modelo de contratación.',
  'Dominio y hosting a tu nombre o gestionados por nosotros (según modelo).',
  'Acceso al panel de administración para gestión independiente del contenido.'
];

export const additionalCosts = [
  { name: 'Dominio .com (Aprox.)', priceRaw: '~10–18 USD/año', type: 'annual', avgPrice: 15 },
  { name: 'Dominio .com.bo (Aprox.)', priceRaw: '~45–60 USD/año', type: 'annual', avgPrice: 50 },
  { name: 'Renovación anual del hosting (Aprox.)', priceRaw: 'Según el plan o contrato', type: 'variable' },
  { name: 'Mantenimiento y soporte (Aprox.)', priceRaw: 'Cotización según requerimientos', type: 'custom' },
  { name: 'Nuevas funcionalidades (Aprox.)', priceRaw: 'Cotización personalizada', type: 'custom' }
];

export const contractingPolicies = [
  'El dominio se registra a nombre del cliente para garantizar su propiedad legal.',
  'El hosting y el dominio son administrados por el cliente o incluidos en nuestro plan gestionado.',
  'El cliente conserva las credenciales y accesos correspondientes a sus servicios.',
  'El código fuente se entrega o se licencia en modalidad SaaS según el plan de contratación.',
  'Cualquier mejora, mantenimiento o cambios de contenido posteriores se cotizan por separado.'
];

export const contractingPoliciesSaaS = [
  'El dominio se registra a nombre del cliente (asegurando su propiedad), pero es administrado por nosotros.',
  'El hosting y el dominio son provistos bajo nuestro plan de alojamiento gestionado, liberando al cliente de configuraciones y renovaciones complejas.',
  'El servicio de alojamiento gestionado incluye certificado SSL (HTTPS), copias de seguridad semanales y monitoreo continuo ante caídas.',
  'El sistema se entrega bajo modalidad de alquiler (SaaS). El código fuente y la base de datos central permanecen bajo propiedad del desarrollador.',
  'Cualquier cambio de contenido, mejora o nueva funcionalidad se cotiza por separado o mediante un Plan de Soporte Premium.'
];

export const managedHostingRates = {
  monthly: { price: 10.00, label: 'Suscripción Mensual', termMonths: 1 },
  annual: { price: 100.00, label: 'Suscripción Anual (Ahorras $20)', termMonths: 12 }
};

export const domainAdjustments = {
  '.com': { price: 0.00, label: '.com (Incluido)' },
  '.lat': { price: 0.00, label: '.lat (Incluido)' },
  '.org': { price: 0.00, label: '.org (Incluido)' },
  '.to': { price: 25.00, label: '.to (Ajuste)' },
  '.ai': { price: 75.00, label: '.ai (Ajuste)' },
  '.com.bo': { price: 35.00, label: '.com.bo (Ajuste)' }
};

export const hostingRates = {
  'Hostinger Single': {
    '48': { price: 1.79, renewal: 8.09, total: 85.92 },
    '24': { price: 2.19, renewal: 8.59, total: 52.56 },
    '12': { price: 2.99, renewal: 9.99, total: 35.88 },
    '1': { price: 9.99, renewal: 9.99, total: 9.99 }
  },
  'Hostinger Premium': {
    '48': { price: 2.99, renewal: 11.49, total: 143.52 },
    '24': { price: 3.49, renewal: 11.99, total: 83.76 },
    '12': { price: 4.49, renewal: 13.99, total: 53.88 },
    '1': { price: 13.99, renewal: 13.99, total: 13.99 }
  },
  'Hostinger Business': {
    '48': { price: 4.39, renewal: 19.49, total: 210.72 },
    '24': { price: 4.99, renewal: 20.99, total: 119.76 },
    '12': { price: 5.99, renewal: 21.99, total: 71.88 },
    '1': { price: 21.99, renewal: 21.99, total: 21.99 }
  },
  'VPS (según requerimiento)': {
    '48': { price: 5.99, renewal: 7.99, total: 287.52 },
    '24': { price: 6.99, renewal: 8.99, total: 167.76 },
    '12': { price: 7.99, renewal: 9.99, total: 95.88 },
    '1': { price: 11.99, renewal: 11.99, total: 11.99 }
  }
};

export const domainRates = {
  '.com': { reg: 10.98, renewal: 14.98, label: '.com (Namecheap)' },
  '.lat': { reg: 1.80, renewal: 40.98, label: '.lat (Namecheap)' },
  '.org': { reg: 8.48, renewal: 14.48, label: '.org (Namecheap)' },
  '.to': { reg: 39.98, renewal: 39.98, label: '.to (Namecheap)' },
  '.ai': { reg: 89.98, renewal: 89.98, label: '.ai (Namecheap)' },
  '.com.bo': { reg: 45.00, renewal: 45.00, label: '.com.bo (Bolivia)' }
};
