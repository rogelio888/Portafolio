export interface Plan {
  id: number;
  name: string;
  shortName: string;
  description: string;
  idealFor: string[];
  includes: string[];
  pricing: {
    devMin: number;
    devMax: number | null;
    devRaw: string;
    hostingRec: string;
    hostingPrice: number;
    hostingRaw: string;
    domainRaw: string;
    domainPrice: number;
    timeRaw: string;
  };
  saas?: {
    setupFee: number;
    monthlyPrice: number;
    setupRaw: string;
    monthlyRaw: string;
  };
  category: 'basic' | 'medium' | 'advanced';
  icon: string;
  reason: string;
  technologies?: {
    frontend: string;
    backend: string;
  };
}

export const plans: Plan[] = [
  {
    id: 1,
    name: 'Plan 1 — Landing Page',
    shortName: 'Landing Page',
    description: 'Una Landing Page es una página web de una sola sección diseñada para captar clientes o promocionar un producto, servicio o evento. Su objetivo principal es convertir visitantes en clientes potenciales.',
    idealFor: ['Emprendedores', 'Negocios nuevos', 'Productos', 'Eventos', 'Campañas publicitarias'],
    includes: ['Diseño personalizado', 'Información de la empresa', 'Galería de imágenes', 'Formulario de contacto', 'Botón de WhatsApp', 'Redes sociales'],
    pricing: {
      devMin: 300,
      devMax: 800,
      devRaw: 'De $300 a $800',
      hostingRec: 'Stellar',
      hostingPrice: 5.15,
      hostingRaw: '5,15 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '1 a 2 semanas'
    },
    category: 'basic',
    icon: 'Layout',
    reason: 'Al ser una sola página informativa y sin bases de datos, los recursos básicos y los 20 GB SSD son perfectos y económicos.'
  },
  {
    id: 2,
    name: 'Plan 2 — Sitio Web Corporativo',
    shortName: 'Sitio Web Corporativo',
    description: 'Sitios institucionales estándar con múltiples secciones diseñados para dar presencia profesional y credibilidad a tu empresa en internet.',
    idealFor: ['Pymes', 'Empresas de servicios', 'Consultoras', 'Agencias'],
    includes: ['Múltiples páginas internas', 'Diseño corporativo', 'Formulario avanzado', 'Integración con Google Maps', 'Enlaces a redes sociales'],
    pricing: {
      devMin: 800,
      devMax: 2000,
      devRaw: 'De $800 a $2.000',
      hostingRec: 'Stellar',
      hostingPrice: 5.15,
      hostingRaw: '5,15 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '2 a 4 semanas'
    },
    category: 'medium',
    icon: 'Building2',
    reason: 'Sitios institucionales estándar con información estática. No consumen muchos recursos ni requieren bases de datos pesadas.'
  },
  {
    id: 3,
    name: 'Plan 3 — Portafolio Profesional',
    shortName: 'Portafolio Profesional',
    description: 'Un espacio personal y creativo diseñado para mostrar tu trabajo, proyectos, habilidades y currículum vitae de una manera visualmente atractiva.',
    idealFor: ['Diseñadores', 'Fotógrafos', 'Arquitectos', 'Freelancers', 'Artistas'],
    includes: ['Galería de proyectos', 'Filtros por categoría', 'Sección "Sobre mí"', 'Descarga de CV', 'Formulario de contacto'],
    pricing: {
      devMin: 500,
      devMax: 1200,
      devRaw: 'De $500 a $1.200',
      hostingRec: 'Stellar',
      hostingPrice: 5.15,
      hostingRaw: '5,15 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '2 a 3 semanas'
    },
    category: 'basic',
    icon: 'Briefcase',
    reason: 'El límite base de almacenamiento y tráfico cubre sobradamente las galerías de fotos o currículums de profesionales independientes.'
  },
  {
    id: 4,
    name: 'Plan 4 — Blog',
    shortName: 'Blog',
    description: 'Plataforma dinámica centrada en la publicación constante de artículos, noticias o contenido multimedia, ideal para crear una comunidad y monetizar.',
    idealFor: ['Creadores de contenido', 'Periodistas', 'Aficionados', 'Revistas digitales'],
    includes: ['Gestor de contenidos (CMS)', 'Categorías y etiquetas', 'Sistema de comentarios', 'Botones para compartir', 'Buscador interno'],
    pricing: {
      devMin: 600,
      devMax: 1500,
      devRaw: 'De $600 a $1.500',
      hostingRec: 'Stellar Plus',
      hostingPrice: 6.90,
      hostingRaw: '6,90 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '2 a 3 semanas'
    },
    category: 'medium',
    icon: 'BookOpen',
    reason: 'Los artículos, imágenes y comentarios se acumulan con el tiempo. El espacio SSD ilimitado de este plan garantiza que el sitio nunca se quede sin memoria.'
  },
  {
    id: 5,
    name: 'Plan 5 — Catálogo de Productos',
    shortName: 'Catálogo de Productos',
    description: 'Un sitio web para exhibir todos tus productos con descripciones detalladas y fotos, similar a una tienda pero sin pasarela de pagos en línea.',
    idealFor: ['Mayoristas', 'Distribuidores', 'Fabricantes', 'Tiendas físicas'],
    includes: ['Fichas de producto detalladas', 'Categorías de productos', 'Buscador con filtros', 'Botón de cotizar', 'Galería optimizada'],
    pricing: {
      devMin: 1000,
      devMax: 3000,
      devRaw: 'De $1.000 a $3.000',
      hostingRec: 'Stellar Plus',
      hostingPrice: 6.90,
      hostingRaw: '6,90 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '3 a 5 semanas'
    },
    category: 'medium',
    icon: 'Package',
    reason: 'Un catálogo requiere cargar cientos o miles de fotos de alta calidad. El espacio ilimitado (Unmetered SSD) es vital para no limitar a tu cliente.'
  },
  {
    id: 6,
    name: 'Plan 6 — Tienda Virtual',
    shortName: 'Tienda Virtual',
    description: 'Una plataforma de comercio electrónico (E-commerce) que te permite vender productos por internet gestionando pedidos a través de WhatsApp o pasarelas de pago.',
    idealFor: ['Retail', 'Marcas de ropa', 'Tiendas de tecnología', 'Negocios locales'],
    includes: ['Carrito de compras', 'Catálogo de productos', 'Checkout avanzado', 'Gestión de inventario básico', 'Panel de administración'],
    pricing: {
      devMin: 2000,
      devMax: 5000,
      devRaw: 'De $2.000 a $5.000',
      hostingRec: 'Stellar Plus',
      hostingPrice: 6.90,
      hostingRaw: '6,90 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '4 a 8 semanas'
    },
    category: 'advanced',
    icon: 'ShoppingCart',
    reason: 'Maneja inventario y pedidos. Los Auto-backups (copias de seguridad automáticas) incluidos en este plan son obligatorios para no perder la configuración de productos ante cualquier error.'
  },
  {
    id: 7,
    name: 'Plan 7 — Sistema Web Personalizado',
    shortName: 'Sistema Web',
    description: 'Aplicación web a medida diseñada para resolver necesidades específicas de tu negocio, con lógica de programación compleja e interacción de múltiples usuarios.',
    idealFor: ['Colegios', 'Clínicas', 'Startups', 'Inmobiliarias'],
    includes: ['Roles de usuario', 'Bases de datos relacionales', 'Panel administrativo', 'Generación de reportes', 'Lógica de negocio a medida'],
    pricing: {
      devMin: 4000,
      devMax: 15000,
      devRaw: 'De $4.000 a $15.000',
      hostingRec: 'Stellar Business',
      hostingPrice: 10.40,
      hostingRaw: '10,40 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '2 a 4 meses'
    },
    saas: {
      setupFee: 400,
      monthlyPrice: 60,
      setupRaw: '400 USD',
      monthlyRaw: '60 USD/mes'
    },
    category: 'advanced',
    icon: 'Settings',
    reason: 'Sistemas médicos, colegios o farmacias requieren estabilidad 24/7 y PostgreSQL. Este plan da el doble de capacidad de procesamiento (600,000 inodes) para evitar que el sistema colapse.'
  },
  {
    id: 8,
    name: 'Plan 8 — CRM',
    shortName: 'CRM',
    description: 'Sistema para gestionar las relaciones con tus clientes, hacer seguimiento a ventas, prospectos y automatizar tus procesos de marketing.',
    idealFor: ['Equipos de ventas', 'Agencias de marketing', 'Call centers', 'B2B'],
    includes: ['Gestión de leads', 'Embudo de ventas', 'Historial de interacciones', 'Calendario y recordatorios', 'Reportes de rendimiento'],
    pricing: {
      devMin: 5000,
      devMax: 20000,
      devRaw: 'De $5.000 a $20.000',
      hostingRec: 'Stellar Business',
      hostingPrice: 10.40,
      hostingRaw: '10,40 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '2 a 4 meses'
    },
    saas: {
      setupFee: 600,
      monthlyPrice: 80,
      setupRaw: '600 USD',
      monthlyRaw: '80 USD/mes'
    },
    category: 'advanced',
    icon: 'Users',
    reason: 'Gestiona embudos de venta, cotizaciones y datos personales de clientes. Requiere máxima privacidad, por lo que la suite Imunify360 Security que incluye este plan es innegociable contra hackeos.'
  },
  {
    id: 9,
    name: 'Plan 9 — ERP',
    shortName: 'ERP',
    description: 'Software robusto que integra y automatiza las principales operaciones de una empresa: contabilidad, recursos humanos, inventario y más.',
    idealFor: ['Medianas y grandes empresas', 'Corporaciones', 'Franquicias', 'Industrias'],
    includes: ['Módulos financieros', 'Gestión de RRHH', 'Control de inventario', 'Facturación y contabilidad', 'Dashboards en tiempo real'],
    pricing: {
      devMin: 15000,
      devMax: 40000,
      devRaw: 'De $15.000 a $40.000',
      hostingRec: 'Stellar Business',
      hostingPrice: 10.40,
      hostingRaw: '10,40 USD/mes',
      domainRaw: '10 – 18 USD/año',
      domainPrice: 15,
      timeRaw: '3 a 6 meses'
    },
    saas: {
      setupFee: 1000,
      monthlyPrice: 150,
      setupRaw: '1000 USD',
      monthlyRaw: '150 USD/mes'
    },
    category: 'advanced',
    icon: 'BarChart',
    reason: 'Al integrar recursos humanos, contabilidad e inventario de múltiples sucursales, es el sistema más pesado de todos. El Business es el único plan compartido que lo soportará.'
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

export interface AdditionalCost {
  name: string;
  priceRaw: string;
  type: string;
  avgPrice?: number;
}

export const additionalCosts: AdditionalCost[] = [
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
  'Cualquier cambio de contenido, mejora o nueva funcionalidad se cotizan por separado o mediante un Plan de Soporte Premium.'
];

export const managedHostingRates = {
  monthly: { price: 10.00, label: 'Suscripción Mensual', termMonths: 1 },
  annual: { price: 100.00, label: 'Suscripción Anual (Ahorras $20)', termMonths: 12 }
};

export const domainAdjustments: Record<string, { price: number; label: string }> = {
  '.com': { price: 0.00, label: '.com (Incluido)' },
  '.lat': { price: 0.00, label: '.lat (Incluido)' },
  '.org': { price: 0.00, label: '.org (Incluido)' },
  '.to': { price: 25.00, label: '.to (Ajuste)' },
  '.ai': { price: 75.00, label: '.ai (Ajuste)' },
  '.com.bo': { price: 35.00, label: '.com.bo (Ajuste)' }
};

export const hostingRates: Record<string, Record<string, { price: number; renewal: number; total: number }>> = {
  'Stellar': {
    'monthly': { price: 5.15, renewal: 5.15, total: 5.15 },
    'annual': { price: 2.00, renewal: 61.80, total: 24.00 },
    'biannual': { price: 1.65, renewal: 123.60, total: 39.60 }
  },
  'Stellar Plus': {
    'monthly': { price: 6.90, renewal: 6.90, total: 6.90 },
    'annual': { price: 2.61, renewal: 82.80, total: 31.32 },
    'biannual': { price: 2.00, renewal: 165.60, total: 48.00 }
  },
  'Stellar Business': {
    'monthly': { price: 10.40, renewal: 10.40, total: 10.40 },
    'annual': { price: 4.36, renewal: 124.80, total: 52.32 },
    'biannual': { price: 3.92, renewal: 249.60, total: 94.08 }
  }
};

export const domainRates: Record<string, { reg: number; renewal: number; label: string }> = {
  '.com': { reg: 10.98, renewal: 14.98, label: '.com (Namecheap)' },
  '.lat': { reg: 1.80, renewal: 40.98, label: '.lat (Namecheap)' },
  '.org': { reg: 8.48, renewal: 14.48, label: '.org (Namecheap)' },
  '.to': { reg: 39.98, renewal: 39.98, label: '.to (Namecheap)' },
  '.ai': { reg: 89.98, renewal: 89.98, label: '.ai (Namecheap)' },
  '.com.bo': { reg: 45.00, renewal: 45.00, label: '.com.bo (Bolivia)' }
};

