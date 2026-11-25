export interface ProductoPOS {
  id: string;
  codigoBarras: string;
  nombre: string;
  categoria: "ALIMENTO" | "FARMACIA" | "ACCESORIO" | "HIGIENE";
  unidad: string;
  esGranel: boolean;
  precioUnitario: number; // Por kilo o por unidad
  stockDisponible: number;
  tipoIcono: "ALIMENTO" | "FARMACIA" | "ACCESORIO" | "HIGIENE";
}

export interface TutorMock {
  id: string;
  nombre: string;
  telefono: string;
  carnet: string;
  saldoDeudor: number;
  mascotas: string[];
}

export const PRODUCTOS_MOCK_POS: ProductoPOS[] = [
  {
    id: "p1",
    codigoBarras: "7771001",
    nombre: "Pro Plan Puppy Razas Medianas",
    categoria: "ALIMENTO",
    unidad: "kg",
    esGranel: true,
    precioUnitario: 32.00, // Bs. 32 / kg
    stockDisponible: 18.5,
    tipoIcono: "ALIMENTO",
  },
  {
    id: "p2",
    codigoBarras: "7771002",
    nombre: "Royal Canin Mini Adult",
    categoria: "ALIMENTO",
    unidad: "kg",
    esGranel: true,
    precioUnitario: 38.00, // Bs. 38 / kg
    stockDisponible: 12.0,
    tipoIcono: "ALIMENTO",
  },
  {
    id: "p3",
    codigoBarras: "7771003",
    nombre: "Bravecto 10-20 kg (1 Masticable)",
    categoria: "FARMACIA",
    unidad: "caja",
    esGranel: false,
    precioUnitario: 210.00,
    stockDisponible: 8,
    tipoIcono: "FARMACIA",
  },
  {
    id: "p4",
    codigoBarras: "7771004",
    nombre: "Drontal Plus Sabores (Pastilla)",
    categoria: "FARMACIA",
    unidad: "tableta",
    esGranel: true,
    precioUnitario: 18.00, // Por tableta
    stockDisponible: 45,
    tipoIcono: "FARMACIA",
  },
  {
    id: "p5",
    codigoBarras: "7771005",
    nombre: "Collar Antitirones Talla M (Rojo)",
    categoria: "ACCESORIO",
    unidad: "unidad",
    esGranel: false,
    precioUnitario: 65.00,
    stockDisponible: 5,
    tipoIcono: "ACCESORIO",
  },
  {
    id: "p6",
    codigoBarras: "7771006",
    nombre: "Shampoo Hipoalergénico 250ml",
    categoria: "HIGIENE",
    unidad: "frasco",
    esGranel: false,
    precioUnitario: 48.00,
    stockDisponible: 14,
    tipoIcono: "HIGIENE",
  },
  {
    id: "p7",
    codigoBarras: "7771007",
    nombre: "Juguete Pelota Kong Mediana",
    categoria: "ACCESORIO",
    unidad: "unidad",
    esGranel: false,
    precioUnitario: 55.00,
    stockDisponible: 7,
    tipoIcono: "ACCESORIO",
  },
  {
    id: "p8",
    codigoBarras: "7771008",
    nombre: "Amoxicilina + Clavulánico 250mg",
    categoria: "FARMACIA",
    unidad: "tableta",
    esGranel: true,
    precioUnitario: 6.00,
    stockDisponible: 30,
    tipoIcono: "FARMACIA",
  },
];

export const TUTORES_MOCK: TutorMock[] = [
  {
    id: "t1",
    nombre: "Carlos Justiniano",
    telefono: "77012345",
    carnet: "6234901 SC",
    saldoDeudor: 0.00,
    mascotas: ["Toby (Poodle)"],
  },
  {
    id: "t2",
    nombre: "Valeria Ríos",
    telefono: "78198765",
    carnet: "5489012 CB",
    saldoDeudor: 120.00,
    mascotas: ["Michi (Siamés)"],
  },
  {
    id: "t3",
    nombre: "Juan José Mendoza",
    telefono: "76345678",
    carnet: "4920199 LP",
    saldoDeudor: 350.00,
    mascotas: ["Rocky (Pastor Alemán)"],
  },
  {
    id: "t4",
    nombre: "María René Suárez",
    telefono: "75044332",
    carnet: "7194012 SC",
    saldoDeudor: 0.00,
    mascotas: ["Luna (Golden Retriever)"],
  },
];
