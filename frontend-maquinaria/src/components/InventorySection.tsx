import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  FolderCog,
  MapPin,
  MessageCircle,
  Minus,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore, type NewMachineInput } from '../state/StoreContext';
import type { Category, MachineItem, PurchaseCurrency } from '../types/store';
import {
  formatBs,
  formatDateShort,
  formatUsd,
  getActiveBatch,
  getBatchUnitCostBs,
  getBatchUnitSaleBs,
  getEffectiveBatchExchangeRate,
  getItemDisplayCostBs,
  getItemDisplayPriceBs,
  getMarginPercent,
  getStockLevel,
  getTotalStock,
} from '../utils/formatters';
import { CategoryManagerDrawer } from './CategoryManagerDrawer';
import { Drawer } from './Drawer';
import { PaginationBar } from './PaginationBar';

function generateNextSku(category: string, name: string, existing: MachineItem[]): string {
  const source = (category || name || 'GEN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  const prefix = (source.slice(0, 3) || 'MAQ').padEnd(3, 'X');
  const taken = new Set(existing.map((it) => it.sku.toUpperCase()));
  let num = 101;
  while (taken.has(`MQ-${prefix}-${num}`)) {
    num += 1;
  }
  return `MQ-${prefix}-${num}`;
}

type StockFilter = 'all' | 'ok' | 'low' | 'out';

interface InventorySectionProps {
  openNewRequest: boolean;
  onConsumeOpenNewRequest: () => void;
  onQuickSell: (item: MachineItem) => void;
  onRequestRestock: (item: MachineItem) => void;
}

export function InventorySection({
  openNewRequest,
  onConsumeOpenNewRequest,
  onQuickSell,
  onRequestRestock,
}: InventorySectionProps) {
  const {
    role,
    exchangeRate,
    inventory,
    suppliers,
    productCategories,
    hasPermission,
    addMachine,
    importMachinesBulk,
    updateMachineMeta,
    updateActiveBatchPricing,
    adjustStock,
    addProductCategory,
    renameProductCategory,
    deleteProductCategory,
  } = useStore();

  const canManageInventory = hasPermission('manage_inventory');
  const canViewCosts = hasPermission('view_costs');

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [page, setPage] = useState(1);
  const INVENTORY_PAGE_SIZE = 10;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editable fields inside detail drawer
  const [editCostOrig, setEditCostOrig] = useState('');
  const [editSaleOrig, setEditSaleOrig] = useState('');
  const [editMinStock, setEditMinStock] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCategory, setEditCategory] = useState<Category>(productCategories[0] ?? 'Construcción');

  // New machine form state
  const [formCategory, setFormCategory] = useState<Category>(
    productCategories[0] ?? 'Soldadura y Corte'
  );
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState(() =>
    generateNextSku(productCategories[0] ?? 'Soldadura y Corte', '', inventory)
  );
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formLocation, setFormLocation] = useState('Pasillo A · Rack 1');
  const [formSupplierId, setFormSupplierId] = useState(suppliers[0]?.id ?? '');
  const [formStock, setFormStock] = useState('4');
  const [formMinStock, setFormMinStock] = useState('2');
  const [formCurrency, setFormCurrency] = useState<PurchaseCurrency>('USD');
  const [formCostOrig, setFormCostOrig] = useState('');
  const [formPurchaseTc, setFormPurchaseTc] = useState(String(exchangeRate));
  const [formShippingAmount, setFormShippingAmount] = useState('');
  const [formShippingCurrency, setFormShippingCurrency] = useState<PurchaseCurrency>('BOB');
  const [formShippingTc, setFormShippingTc] = useState(String(exchangeRate));
  const [formMarginPct, setFormMarginPct] = useState('30');
  const [formSaleBs, setFormSaleBs] = useState('');
  const [saleManuallyEdited, setSaleManuallyEdited] = useState(false);
  const [formWarranty, setFormWarranty] = useState('12');
  const [formSerials, setFormSerials] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (openNewRequest) {
      if (canManageInventory) {
        const cat = productCategories[0] ?? 'Construcción';
        setFormCategory(cat);
        setFormSku(generateNextSku(cat, '', inventory));
        setSkuManuallyEdited(false);
        setFormPurchaseTc(String(exchangeRate));
        setFormShippingTc(String(exchangeRate));
        setIsNewOpen(true);
      }
      onConsumeOpenNewRequest();
    }
  }, [
    openNewRequest,
    canManageInventory,
    exchangeRate,
    productCategories,
    inventory,
    onConsumeOpenNewRequest,
  ]);

  useEffect(() => {
    if (!skuManuallyEdited) {
      setFormSku(generateNextSku(formCategory, formName, inventory));
    }
  }, [formCategory, formName, inventory, skuManuallyEdited]);

  const categoryUsage = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of inventory) {
      map.set(it.category, (map.get(it.category) ?? 0) + 1);
    }
    return map;
  }, [inventory]);

  const supplierById = useMemo(
    () => new Map(suppliers.map((s) => [s.id, s])),
    [suppliers]
  );

  const selectedItem = useMemo(
    () => inventory.find((it) => it.id === selectedId) ?? null,
    [inventory, selectedId]
  );

  const selectedActiveBatch = useMemo(
    () => (selectedItem ? getActiveBatch(selectedItem) : null),
    [selectedItem]
  );

  useEffect(() => {
    if (!selectedItem || !selectedActiveBatch) return;
    setEditCostOrig(String(selectedActiveBatch.unitCostOriginal));
    setEditSaleOrig(String(selectedActiveBatch.unitSaleOriginal));
    setEditMinStock(String(selectedItem.minStock));
    setEditLocation(selectedItem.location);
    setEditCategory(selectedItem.category);
  }, [selectedItem, selectedActiveBatch]);

  const counts = useMemo(() => {
    let ok = 0;
    let low = 0;
    let out = 0;
    for (const item of inventory) {
      const level = getStockLevel(item);
      if (level === 'ok') ok += 1;
      else if (level === 'low') low += 1;
      else out += 1;
    }
    return { all: inventory.length, ok, low, out };
  }, [inventory]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inventory.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (stockFilter !== 'all' && getStockLevel(item) !== stockFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q)
      );
    });
  }, [inventory, query, categoryFilter, stockFilter]);

  const totalInventoryPages = Math.max(1, Math.ceil(filteredItems.length / INVENTORY_PAGE_SIZE));
  const safeInventoryPage = Math.min(page, totalInventoryPages);
  const paginatedItems = useMemo(() => {
    const start = (safeInventoryPage - 1) * INVENTORY_PAGE_SIZE;
    return filteredItems.slice(start, start + INVENTORY_PAGE_SIZE);
  }, [filteredItems, safeInventoryPage]);

  const handleCopyWhatsAppCard = async (item: MachineItem) => {
    const priceBs = getItemDisplayPriceBs(item, exchangeRate);
    const stock = getTotalStock(item);
    const warrantyLine =
      item.warrantyMonths > 0
        ? `Garantía: ${item.warrantyMonths} meses`
        : 'Consumible / repuesto directo';
    const text = [
      `*${item.name}*`,
      `Marca/Modelo: ${item.brand} ${item.model} (${item.sku})`,
      `Especificaciones: ${item.specs}`,
      `${warrantyLine} · Stock: ${stock > 0 ? `${stock} disponible(s)` : 'A pedido'}`,
      `*Precio al contado: ${formatBs(priceBs)}*`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard may be restricted in headless contexts; toast still confirms preview
    }
    setCopiedId(item.id);
    setTimeout(() => setCopiedId((prev) => (prev === item.id ? null : prev)), 2000);
    toast.success(`Ficha WhatsApp copiada (${item.sku})`, {
      description: `${item.name} · ${formatBs(priceBs)}`,
    });
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedActiveBatch || !canManageInventory) return;
    const cost = Number(editCostOrig);
    const sale = Number(editSaleOrig);
    const min = Number(editMinStock);

    if (canViewCosts && (!Number.isFinite(sale) || sale <= 0 || !Number.isFinite(cost) || cost < 0)) {
      toast.error('Ingresa costo y precio válidos.');
      return;
    }

    updateMachineMeta(selectedItem.id, {
      category: editCategory,
      minStock: Math.max(0, Math.round(min || 0)),
      location: editLocation.trim() || selectedItem.location,
    });
    if (canViewCosts) {
      updateActiveBatchPricing(selectedItem.id, selectedActiveBatch.id, {
        unitCostOriginal: cost,
        unitSaleOriginal: sale,
      });
    }
    toast.success(`Ficha ${selectedItem.sku} actualizada`);
  };

  const handleCreateMachine = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const activeCat = productCategories.includes(formCategory)
      ? formCategory
      : (productCategories[0] ?? 'Construcción');
    const name = formName.trim();
    const sku =
      formSku.trim().toUpperCase() || generateNextSku(activeCat, name, inventory);
    const cost = Number(formCostOrig);
    const saleBs = Number(formSaleBs);
    const tc = formCurrency === 'USD' ? Number(formPurchaseTc) : 1;
    const shipTc = formShippingCurrency === 'USD' ? Number(formShippingTc) : 1;
    const stock = Math.max(0, Number.parseInt(formStock || '0', 10));
    const minStock = Math.max(0, Number.parseInt(formMinStock || '1', 10));

    if (!name) {
      setFormError('Completa el nombre del equipo.');
      return;
    }
    if (inventory.some((it) => it.sku.toUpperCase() === sku)) {
      setFormError(`Ya existe un equipo con el código ${sku}.`);
      return;
    }
    if (!Number.isFinite(cost) || cost < 0 || !Number.isFinite(saleBs) || saleBs <= 0) {
      setFormError('Indica un costo y precio de venta válidos.');
      return;
    }
    if (formCurrency === 'USD' && (!Number.isFinite(tc) || tc <= 0)) {
      setFormError('Ingresa un tipo de cambio válido para la compra del producto.');
      return;
    }
    if (formShippingCurrency === 'USD' && (!Number.isFinite(shipTc) || shipTc <= 0)) {
      setFormError('Ingresa un tipo de cambio válido para el flete en USD.');
      return;
    }

    const rawShip = Math.max(0, Number(formShippingAmount) || 0);
    const shippingCostBs =
      rawShip > 0
        ? Math.round(formShippingCurrency === 'USD' ? rawShip * shipTc : rawShip)
        : 0;
    const saleOriginal =
      formCurrency === 'USD'
        ? Math.round((saleBs / tc) * 10000) / 10000
        : Math.round(saleBs);

    const serials = formSerials
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const created = addMachine({
      sku,
      name,
      brand: formBrand.trim() || 'Genérica',
      model: formModel.trim() || 'Estándar',
      category: activeCat,
      location: formLocation.trim() || 'Almacén Central',
      unit: activeCat === 'Repuestos y Consumibles' ? 'kit' : 'unidad',
      stock,
      minStock,
      currency: formCurrency,
      costOriginal: cost,
      shippingCostBs: shippingCostBs > 0 ? shippingCostBs : undefined,
      shippingCostOriginal: rawShip > 0 ? rawShip : undefined,
      shippingCurrency: rawShip > 0 ? formShippingCurrency : undefined,
      shippingExchangeRate: rawShip > 0 && formShippingCurrency === 'USD' ? shipTc : undefined,
      targetMarginPct: Number.isFinite(Number(formMarginPct)) ? Number(formMarginPct) : undefined,
      saleOriginal,
      purchaseExchangeRate: tc,
      warrantyMonths: Math.max(0, Number.parseInt(formWarranty || '0', 10)),
      supplierId: formSupplierId || suppliers[0]?.id || '',
      specs: formSpecs.trim() || 'Equipo listo para entrega en sucursal.',
      serialNumbers: serials,
    });

    toast.success(`${created.name} agregado`, {
      description: `SKU ${created.sku} · Precio venta ${formatBs(Math.round(saleBs))} registrado.`,
    });

    setFormSku('');
    setFormName('');
    setFormBrand('');
    setFormModel('');
    setFormCostOrig('');
    setFormShippingAmount('');
    setFormShippingCurrency('BOB');
    setFormShippingTc(String(exchangeRate));
    setFormMarginPct('30');
    setFormSaleBs('');
    setSaleManuallyEdited(false);
    setFormSerials('');
    setFormSpecs('');
    setIsNewOpen(false);
  };

  const recomputeSuggestedSale = (
    costStr: string,
    tcProdStr: string,
    currency: PurchaseCurrency,
    shipStr: string,
    shipCurrency: PurchaseCurrency,
    tcShipStr: string,
    stockStr: string,
    marginStr: string,
    force = false
  ) => {
    if (saleManuallyEdited && !force) return;
    const baseCost = Number(costStr);
    const margin = Number(marginStr);
    if (!Number.isFinite(baseCost) || baseCost <= 0 || !Number.isFinite(margin) || margin < 0) {
      return;
    }
    const prodTc = currency === 'USD' ? Math.max(0.01, Number(tcProdStr) || exchangeRate) : 1;
    const shipTc = shipCurrency === 'USD' ? Math.max(0.01, Number(tcShipStr) || exchangeRate) : 1;
    const qtyVal = Math.max(1, Number.parseInt(stockStr || '1', 10) || 1);
    const shipAmt = Math.max(0, Number(shipStr) || 0);
    const unitCostBs = baseCost * prodTc + (shipAmt * shipTc) / qtyVal;
    const suggestedBs = Math.round(unitCostBs * (1 + margin / 100));
    setFormSaleBs(String(suggestedBs));
  };

  const handleDownloadCsvTemplate = () => {
    const header =
      'SKU,Nombre,Marca,Modelo,Categoria,Ubicacion,Moneda(USD/BOB),Costo,PrecioVenta,TC_Compra,Stock,MinStock,GarantiaMeses\n';
    const sample =
      'MQ-ROT-800,Rotomartillo Demoledor 1500W,Bosch,GSH 11 E,Construcción,Pasillo A · Rack 2,USD,280,380,10.5,3,2,12\n' +
      'RP-DIS-14,Pack 10 Discos Corte Metal 14",Norton,Classic,Repuestos y Consumibles,Estantería C · C-02,BOB,240,360,1,12,5,0\n';
    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_inventario_maquinaria.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Plantilla CSV descargada');
  };

  const handleCsvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .map((r) => r.trim())
      .filter(Boolean);
    if (rows.length <= 1) {
      toast.error('El archivo CSV no contiene filas de equipos.');
      return;
    }

    const parsed: NewMachineInput[] = [];
    for (let i = 1; i < rows.length; i += 1) {
      const cols = rows[i].split(',').map((c) => c.trim());
      if (cols.length < 11) continue;
      const currency: PurchaseCurrency = cols[6].toUpperCase() === 'USD' ? 'USD' : 'BOB';
      const cat = productCategories.includes(cols[4] as Category)
        ? (cols[4] as Category)
        : (productCategories[0] ?? 'Construcción');
      parsed.push({
        sku: cols[0],
        name: cols[1],
        brand: cols[2] || 'Genérica',
        model: cols[3] || 'Estándar',
        category: cat,
        location: cols[5] || 'Almacén Central',
        unit: cat === 'Repuestos y Consumibles' ? 'kit' : 'unidad',
        currency,
        costOriginal: Number(cols[7]) || 0,
        saleOriginal: Number(cols[8]) || 1,
        purchaseExchangeRate: currency === 'USD' ? Number(cols[9]) || exchangeRate : 1,
        stock: Math.max(0, Number.parseInt(cols[10] || '0', 10)),
        minStock: Math.max(0, Number.parseInt(cols[11] || '2', 10)),
        warrantyMonths: Math.max(0, Number.parseInt(cols[12] || '12', 10)),
        supplierId: suppliers[0]?.id ?? '',
        specs: 'Importado mediante plantilla CSV.',
      });
    }

    const { added, skipped } = importMachinesBulk(parsed);
    toast.success(`Importación completada: ${added} agregado(s)`, {
      description: skipped > 0 ? `${skipped} omitido(s) por SKU duplicado.` : undefined,
    });
    e.target.value = '';
    setIsImportOpen(false);
  };

  const handleSampleImport = () => {
    const { added, skipped } = importMachinesBulk([
      {
        sku: 'MQ-ROT-800',
        name: 'Rotomartillo Demoledor 1500 W SDS-Max',
        brand: 'Bosch',
        model: 'GSH 11 E',
        category: 'Construcción',
        location: 'Pasillo A · Rack 2',
        unit: 'unidad',
        currency: 'USD',
        costOriginal: 280,
        saleOriginal: 380,
        purchaseExchangeRate: exchangeRate,
        stock: 3,
        minStock: 2,
        warrantyMonths: 12,
        supplierId: suppliers[2]?.id ?? suppliers[0]?.id ?? '',
        specs: 'Impacto 16.8 J · Maletín y cinceles incluidos',
      },
      {
        sku: 'RP-DIS-014',
        name: 'Pack 10 Discos de Corte Metal 14"',
        brand: 'Norton',
        model: 'Classic 355',
        category: 'Repuestos y Consumibles',
        location: 'Estantería C · C-02',
        unit: 'kit',
        currency: 'BOB',
        costOriginal: 240,
        saleOriginal: 360,
        purchaseExchangeRate: 1,
        stock: 12,
        minStock: 5,
        warrantyMonths: 0,
        supplierId: suppliers[1]?.id ?? suppliers[0]?.id ?? '',
        specs: 'Abrasivo reforzado · Eje 25.4 mm',
      },
    ]);
    toast.success(`Carga masiva completada (${added} equipos)`, {
      description: skipped > 0 ? `${skipped} ya existía(n) en el inventario.` : 'Lotes creados en Kardex.',
    });
    setIsImportOpen(false);
  };

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#D6D6CD] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#14171A] sm:text-3xl">
            Inventario y Lotes
          </h1>
          <p className="mt-1 text-sm text-[#5B636B]">
            Control por lotes USD/Bs con protección cambiaria, seriales, ficha WhatsApp e importación.
          </p>
        </div>

        {canManageInventory ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCategoriesOpen(true)}
              className="btn-press inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D6D6CD] bg-white px-3.5 text-sm font-semibold text-[#14171A] hover:border-[#14171A]"
            >
              <FolderCog className="h-4 w-4 text-[#5B636B]" />
              Categorías
            </button>
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="btn-press inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D6D6CD] bg-white px-3.5 text-sm font-semibold text-[#14171A] hover:border-[#14171A]"
            >
              <FileSpreadsheet className="h-4 w-4 text-[#5B636B]" />
              Importar Excel
            </button>
            <button
              type="button"
              onClick={() => {
                const cat = productCategories[0] ?? 'Construcción';
                setFormCategory(cat);
                setFormSku(generateNextSku(cat, '', inventory));
                setSkuManuallyEdited(false);
                setFormPurchaseTc(String(exchangeRate));
                setFormShippingTc(String(exchangeRate));
                setIsNewOpen(true);
              }}
              className="btn-press inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#14171A] px-4 text-sm font-semibold text-white hover:bg-[#272C32]"
            >
              <Plus className="h-4 w-4 text-[#F59E0B]" />
              Agregar máquina
            </button>
          </div>
        ) : null}
      </div>

      {/* Filters Bar */}
      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-[#D6D6CD] bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B636B]" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, código, marca o modelo..."
              aria-label="Buscar en inventario"
              className="h-10 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] pl-9 pr-3 text-sm text-[#14171A] placeholder:text-[#5B636B] focus:border-[#14171A] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#5B636B]" aria-hidden="true" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as 'all' | Category);
                setPage(1);
              }}
              aria-label="Filtrar por categoría"
              className="h-10 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 text-sm font-medium text-[#14171A] focus:border-[#14171A] focus:bg-white focus:outline-none md:w-56"
            >
              <option value="all">Todas las categorías</option>
              {productCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado de stock">
          {(
            [
              { id: 'all', label: 'Todos', count: counts.all },
              { id: 'ok', label: 'Disponible', count: counts.ok },
              { id: 'low', label: 'Stock bajo', count: counts.low },
              { id: 'out', label: 'Agotado', count: counts.out },
            ] as const
          ).map((tab) => {
            const active = stockFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStockFilter(tab.id);
                  setPage(1);
                }}
                className={`btn-press inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold ${
                  active
                    ? 'border-[#14171A] bg-[#14171A] text-white'
                    : 'border-[#D6D6CD] bg-[#F8F8F5] text-[#434B53] hover:border-[#14171A] hover:text-[#14171A]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`tabular-nums rounded px-1.5 py-0.5 text-[11px] ${
                    active ? 'bg-white/15 text-white' : 'bg-[#EAEAE3] text-[#434B53]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="mt-6 rounded-xl border border-[#D6D6CD] bg-white px-6 py-12 text-center">
          <p className="font-display text-lg font-bold text-[#14171A]">
            Sin coincidencias en el catálogo
          </p>
          <p className="mt-1 text-sm text-[#5B636B]">
            Prueba limpiando la búsqueda o registra una nueva máquina para esta sucursal.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategoryFilter('all');
              setStockFilter('all');
            }}
            className="btn-press mt-4 inline-flex h-10 items-center rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-4 text-sm font-semibold text-[#14171A] hover:border-[#14171A]"
          >
            Mostrar todo el inventario
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="mt-5 hidden overflow-hidden rounded-xl border border-[#D6D6CD] bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#D6D6CD] bg-[#F8F8F5] text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                    <th className="px-4 py-3">SKU / Equipo</th>
                    <th className="px-4 py-3">Categoría y Ubicación</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    {role === 'owner' ? <th className="px-4 py-3 text-right">Lote / Costo</th> : null}
                    <th className="px-4 py-3 text-right">Precio Venta</th>
                    {role === 'owner' ? <th className="px-4 py-3 text-right">Margen</th> : null}
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAE3]">
                  {paginatedItems.map((item) => {
                    const stock = getTotalStock(item);
                    const level = getStockLevel(item);
                    const priceBs = getItemDisplayPriceBs(item, exchangeRate);
                    const costBs = getItemDisplayCostBs(item);
                    const margin = getMarginPercent(costBs, priceBs);
                    const activeBatch = getActiveBatch(item);
                    const activeBatchesCount = item.batches.filter((b) => b.remainingQty > 0).length;

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors duration-150 hover:bg-[#F8F8F5]"
                      >
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className="text-left focus-visible:outline-[#C95B06]"
                          >
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="tabular-nums font-mono text-xs font-semibold text-[#5B636B]">
                                {item.sku} · {item.brand}
                              </span>
                              {activeBatchesCount > 1 ? (
                                <span className="rounded bg-[#FEF2E4] px-1.5 py-0.5 text-[10px] font-bold text-[#8A3A00]">
                                  {activeBatchesCount} lotes
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-0.5 font-semibold text-[#14171A] hover:underline">
                              {item.name}
                            </div>
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-xs font-semibold text-[#434B53]">{item.category}</div>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-[#5B636B]">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{item.location}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span
                            className={`tabular-nums inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ${
                              level === 'out'
                                ? 'bg-[#FEE2E2] text-[#991B1B]'
                                : level === 'low'
                                  ? 'bg-[#FEF2E4] text-[#8A3A00]'
                                  : 'bg-[#DCFCE7] text-[#166534]'
                            }`}
                          >
                            {stock} / {item.minStock} min
                          </span>
                        </td>
                        {role === 'owner' ? (
                          <td className="tabular-nums px-4 py-3.5 text-right">
                            <div className="text-xs font-semibold text-[#14171A]">
                              {formatBs(costBs)}
                            </div>
                            <div className="text-[11px] text-[#5B636B]">
                              {activeBatch?.currency === 'USD'
                                ? `USD ${activeBatch.unitCostOriginal} · TC ${activeBatch.purchaseExchangeRate.toFixed(1)}`
                                : 'Compra en Bs'}
                            </div>
                          </td>
                        ) : null}
                        <td className="tabular-nums whitespace-nowrap px-4 py-3.5 text-right font-bold text-[#14171A]">
                          {formatBs(priceBs)}
                        </td>
                        {role === 'owner' ? (
                          <td className="tabular-nums px-4 py-3.5 text-right text-xs font-semibold text-[#434B53]">
                            {margin}%
                          </td>
                        ) : null}
                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyWhatsAppCard(item)}
                              title="Copiar ficha para WhatsApp"
                              aria-label={`Copiar ficha WhatsApp de ${item.name}`}
                              className="btn-press inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D6D6CD] bg-white text-[#434B53] hover:border-[#14171A] hover:text-[#14171A]"
                            >
                              {copiedId === item.id ? (
                                <Check className="h-3.5 w-3.5 text-[#166534]" />
                              ) : (
                                <MessageCircle className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedId(item.id)}
                              className="btn-press inline-flex h-8 items-center rounded-md border border-[#D6D6CD] bg-white px-2.5 text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
                            >
                              Ficha
                            </button>
                            <button
                              type="button"
                              disabled={stock <= 0}
                              onClick={() => onQuickSell(item)}
                              className="btn-press inline-flex h-8 items-center gap-1 rounded-md bg-[#14171A] px-2.5 text-xs font-semibold text-white hover:bg-[#272C32] disabled:cursor-not-allowed disabled:bg-[#EAEAE3] disabled:text-[#5B636B]"
                            >
                              Vender
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <ul className="mt-4 space-y-3 md:hidden">
            {paginatedItems.map((item) => {
              const stock = getTotalStock(item);
              const level = getStockLevel(item);
              const priceBs = getItemDisplayPriceBs(item, exchangeRate);
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-[#D6D6CD] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="tabular-nums font-mono text-xs font-semibold text-[#5B636B]">
                      {item.sku} · {item.brand}
                    </span>
                    <span
                      className={`tabular-nums rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        level === 'out'
                          ? 'bg-[#FEE2E2] text-[#991B1B]'
                          : level === 'low'
                            ? 'bg-[#FEF2E4] text-[#8A3A00]'
                            : 'bg-[#DCFCE7] text-[#166534]'
                      }`}
                    >
                      Stock: {stock}
                    </span>
                  </div>

                  <div className="mt-1.5 text-base font-bold leading-snug text-[#14171A]">
                    {item.name}
                  </div>
                  <div className="mt-1 text-xs text-[#5B636B]">
                    {item.category} · {item.location}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#EAEAE3] pt-3">
                    <div>
                      <div className="text-[11px] text-[#5B636B]">Precio venta</div>
                      <div className="tabular-nums font-display text-lg font-bold text-[#14171A]">
                        {formatBs(priceBs)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyWhatsAppCard(item)}
                        aria-label={`Copiar ficha WhatsApp de ${item.name}`}
                        className="btn-press inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] text-[#14171A]"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className="btn-press inline-flex h-10 items-center rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 text-xs font-semibold text-[#14171A]"
                      >
                        Ficha
                      </button>
                      <button
                        type="button"
                        disabled={stock <= 0}
                        onClick={() => onQuickSell(item)}
                        className="btn-press inline-flex h-10 items-center rounded-lg bg-[#14171A] px-3.5 text-xs font-semibold text-white disabled:bg-[#EAEAE3] disabled:text-[#5B636B]"
                      >
                        Vender
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4">
            <PaginationBar
              currentPage={safeInventoryPage}
              totalItems={filteredItems.length}
              pageSize={INVENTORY_PAGE_SIZE}
              itemLabel="equipos en catálogo"
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {/* Detail & Batch Inspection Drawer */}
      <Drawer
        open={selectedItem !== null}
        onClose={() => setSelectedId(null)}
        title={selectedItem?.name ?? ''}
        subtitle={
          selectedItem
            ? `${selectedItem.sku} · ${selectedItem.brand} ${selectedItem.model}`
            : undefined
        }
      >
        {selectedItem ? (
          <div className="space-y-5">
            {/* Stock + Quick Adjust */}
            <div className="rounded-xl border border-[#D6D6CD] bg-[#F8F8F5] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase text-[#5B636B]">
                    Existencias totales en sucursal
                  </div>
                  <div className="tabular-nums mt-1 font-display text-2xl font-bold text-[#14171A]">
                    {getTotalStock(selectedItem)} {selectedItem.unit}(s)
                  </div>
                </div>
                {canManageInventory ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={getTotalStock(selectedItem) <= 0}
                      onClick={() => {
                        adjustStock(selectedItem.id, -1, 'Ajuste manual rápido (-1)');
                        toast.info(`Stock ajustado: ${selectedItem.sku} (-1)`);
                      }}
                      aria-label="Restar una unidad"
                      className="btn-press inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D6D6CD] bg-white text-[#14171A] hover:border-[#14171A] disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        adjustStock(selectedItem.id, 1, 'Ajuste manual rápido (+1)');
                        toast.success(`Stock ajustado: ${selectedItem.sku} (+1)`);
                      }}
                      aria-label="Sumar una unidad"
                      className="btn-press inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D6D6CD] bg-white text-[#14171A] hover:border-[#14171A]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-[#5B636B]">{selectedItem.specs}</p>

              <button
                type="button"
                onClick={() => handleCopyWhatsAppCard(selectedItem)}
                className="btn-press mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[#D6D6CD] bg-white text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
              >
                <Copy className="h-3.5 w-3.5 text-[#C95B06]" />
                Copiar ficha técnica para WhatsApp ({formatBs(getItemDisplayPriceBs(selectedItem, exchangeRate))})
              </button>
            </div>

            {/* Batches (USD/Bs Rule Breakdown) */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#5B636B]">
                  Lotes y protección de tipo de cambio
                </h3>
                <span className="tabular-nums text-[11px] font-semibold text-[#5B636B]">
                  TC actual: Bs {exchangeRate.toFixed(2)}
                </span>
              </div>

              <ul className="mt-2 space-y-2.5">
                {selectedItem.batches.map((batch) => {
                  const effectiveTc = getEffectiveBatchExchangeRate(batch, exchangeRate);
                  const saleBs = getBatchUnitSaleBs(batch, exchangeRate);
                  const costBs = getBatchUnitCostBs(batch);
                  const isProtected =
                    batch.currency === 'USD' && batch.purchaseExchangeRate > exchangeRate;
                  const isRaised =
                    batch.currency === 'USD' && exchangeRate > batch.purchaseExchangeRate;

                  return (
                    <li
                      key={batch.id}
                      className={`rounded-lg border p-3.5 ${
                        batch.remainingQty > 0
                          ? 'border-[#D6D6CD] bg-white'
                          : 'border-[#EAEAE3] bg-[#F8F8F5] opacity-65'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#14171A]">
                            Lote {batch.code}
                          </span>
                          <span className="rounded bg-[#EAEAE3] px-1.5 py-0.5 text-[10px] font-bold text-[#434B53]">
                            {batch.currency}
                          </span>
                          {isProtected ? (
                            <span className="rounded bg-[#FEE2E2] px-1.5 py-0.5 text-[10px] font-semibold text-[#991B1B]">
                              TC protegido ({batch.purchaseExchangeRate.toFixed(2)})
                            </span>
                          ) : isRaised ? (
                            <span className="rounded bg-[#DCFCE7] px-1.5 py-0.5 text-[10px] font-semibold text-[#166534]">
                              Actualizado a TC {effectiveTc.toFixed(2)}
                            </span>
                          ) : null}
                        </div>
                        <span className="tabular-nums text-xs font-bold text-[#14171A]">
                          {batch.remainingQty} / {batch.initialQty} u.
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-[#5B636B]">
                          Ingreso: {formatDateShort(batch.receivedAt)}
                          {batch.orderNumber ? ` (${batch.orderNumber})` : ''}
                        </span>
                        <span className="tabular-nums font-bold text-[#14171A]">
                          Venta: {formatBs(saleBs)}
                          {batch.currency === 'USD'
                            ? ` (${formatUsd(batch.unitSaleOriginal)} × ${effectiveTc.toFixed(2)})`
                            : ''}
                        </span>
                      </div>

                      {role === 'owner' ? (
                        <div className="tabular-nums mt-1 text-[11px] text-[#5B636B]">
                          Costo lote: {formatBs(costBs)}
                          {batch.currency === 'USD'
                            ? ` (${formatUsd(batch.unitCostOriginal)} a TC ${batch.purchaseExchangeRate.toFixed(2)})`
                            : ''}
                        </div>
                      ) : null}

                      {batch.serialNumbers.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1 border-t border-[#EAEAE3] pt-2">
                          {batch.serialNumbers.map((sn) => (
                            <span
                              key={sn}
                              className="rounded border border-[#D6D6CD] bg-[#F8F8F5] px-1.5 py-0.5 font-mono text-[10px] text-[#434B53]"
                            >
                              SN: {sn}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Metadata */}
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-[#D6D6CD] p-3">
                <dt className="text-xs text-[#5B636B]">Proveedor habitual</dt>
                <dd className="mt-0.5 font-semibold text-[#14171A]">
                  {supplierById.get(selectedItem.supplierId)?.name ?? 'Sin asignar'}
                </dd>
              </div>
              <div className="rounded-lg border border-[#D6D6CD] p-3">
                <dt className="text-xs text-[#5B636B]">Garantía y rotación</dt>
                <dd className="tabular-nums mt-0.5 font-semibold text-[#14171A]">
                  {selectedItem.warrantyMonths} meses · Última venta {formatDateShort(selectedItem.lastSoldAt)}
                </dd>
              </div>
            </dl>

            {/* Edit Form */}
            {canManageInventory && selectedActiveBatch ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 border-t border-[#D6D6CD] pt-4">
                <h3 className="font-display text-base font-bold text-[#14171A]">
                  Editar ficha y lote activo ({selectedActiveBatch.code} · {selectedActiveBatch.currency})
                </h3>

                <label className="block text-xs font-semibold text-[#434B53]">
                  Categoría del producto
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Category)}
                    className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] focus:border-[#14171A] focus:outline-none"
                  >
                    {productCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                {canViewCosts ? (
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-[#434B53]">
                      Costo ({selectedActiveBatch.currency})
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={editCostOrig}
                        onChange={(e) => setEditCostOrig(e.target.value)}
                        className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] focus:border-[#14171A] focus:outline-none"
                      />
                    </label>

                    <label className="block text-xs font-semibold text-[#434B53]">
                      Precio base ({selectedActiveBatch.currency})
                      <input
                        type="number"
                        min={1}
                        step="0.01"
                        value={editSaleOrig}
                        onChange={(e) => setEditSaleOrig(e.target.value)}
                        className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm font-semibold text-[#14171A] focus:border-[#14171A] focus:outline-none"
                      />
                    </label>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-[#434B53]">
                    Stock mínimo
                    <input
                      type="number"
                      min={0}
                      value={editMinStock}
                      onChange={(e) => setEditMinStock(e.target.value)}
                      className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] focus:border-[#14171A] focus:outline-none"
                    />
                  </label>

                  <label className="block text-xs font-semibold text-[#434B53]">
                    Ubicación
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] focus:border-[#14171A] focus:outline-none"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-press inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#14171A] bg-white text-sm font-semibold text-[#14171A] hover:bg-[#F8F8F5]"
                >
                  Guardar cambios
                </button>
              </form>
            ) : null}

            {/* Quick Action Links */}
            <div className="grid grid-cols-2 gap-2.5 border-t border-[#D6D6CD] pt-4">
              <button
                type="button"
                disabled={getTotalStock(selectedItem) <= 0}
                onClick={() => {
                  const target = selectedItem;
                  setSelectedId(null);
                  onQuickSell(target);
                }}
                className="btn-press inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#14171A] px-3 text-xs font-semibold text-white hover:bg-[#272C32] disabled:bg-[#EAEAE3] disabled:text-[#5B636B]"
              >
                <ShoppingCart className="h-3.5 w-3.5 text-[#F59E0B]" />
                Vender en Mostrador
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedItem;
                  setSelectedId(null);
                  onRequestRestock(target);
                }}
                className="btn-press inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#D6D6CD] bg-[#FEF2E4] px-3 text-xs font-semibold text-[#8A3A00] hover:border-[#C95B06]"
              >
                <PackagePlus className="h-3.5 w-3.5" />
                Pedir a proveedor
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* New Machine Drawer */}
      <Drawer
        open={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="Registrar nueva máquina o repuesto"
        subtitle="Crea el producto y su primer lote en USD o Bs."
      >
        <form onSubmit={handleCreateMachine} className="space-y-4">
          {formError ? (
            <div
              role="alert"
              className="rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-3.5 py-2.5 text-xs font-semibold text-[#991B1B]"
            >
              {formError}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="new-machine-sku" className="text-xs font-semibold text-[#434B53]">
                  Código interno (auto)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSkuManuallyEdited(false);
                    setFormSku(generateNextSku(formCategory, formName, inventory));
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A3A00] hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerar
                </button>
              </div>
              <input
                id="new-machine-sku"
                type="text"
                value={formSku}
                onChange={(e) => {
                  setSkuManuallyEdited(true);
                  setFormSku(e.target.value);
                }}
                placeholder="Se genera automático"
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] px-3 font-mono text-sm uppercase text-[#14171A] focus:border-[#14171A] focus:bg-white focus:outline-none"
              />
            </div>
            <label className="block text-xs font-semibold text-[#434B53]">
              Categoría
              <select
                value={productCategories.includes(formCategory) ? formCategory : (productCategories[0] ?? '')}
                onChange={(e) => setFormCategory(e.target.value as Category)}
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] focus:border-[#14171A] focus:outline-none"
              >
                {productCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-xs font-semibold text-[#434B53]">
            Nombre del equipo *
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ej. Taladro de Banco Industrial 16 mm"
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] focus:border-[#14171A] focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#434B53]">
              Marca
              <input
                type="text"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                placeholder="Ej. Makita"
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] focus:border-[#14171A] focus:outline-none"
              />
            </label>
            <label className="block text-xs font-semibold text-[#434B53]">
              Modelo
              <input
                type="text"
                value={formModel}
                onChange={(e) => setFormModel(e.target.value)}
                placeholder="Ej. TB-1600"
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A] focus:border-[#14171A] focus:outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block text-xs font-semibold text-[#434B53]">
              Stock inicial
              <input
                type="number"
                min={0}
                value={formStock}
                onChange={(e) => {
                  setFormStock(e.target.value);
                  recomputeSuggestedSale(
                    formCostOrig,
                    formPurchaseTc,
                    formCurrency,
                    formShippingAmount,
                    formShippingCurrency,
                    formShippingTc,
                    e.target.value,
                    formMarginPct
                  );
                }}
                className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#434B53]">
              Stock mínimo
              <input
                type="number"
                min={0}
                value={formMinStock}
                onChange={(e) => setFormMinStock(e.target.value)}
                className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#434B53]">
              Garantía (meses)
              <input
                type="number"
                min={0}
                value={formWarranty}
                onChange={(e) => setFormWarranty(e.target.value)}
                className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
              />
            </label>
          </div>

          {/* Simplified Bs-Output Cost & Margin Calculator */}
          <div className="rounded-lg border border-[#D6D6CD] bg-[#F8F8F5] p-3 space-y-3">
            {/* 1. Product Purchase Cost */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#14171A]">
                  1. Compra del equipo
                </span>
                <div className="grid grid-cols-2 gap-1 rounded-md bg-[#EAEAE3] p-0.5">
                  {(['USD', 'BOB'] as const).map((cur) => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => {
                        setFormCurrency(cur);
                        recomputeSuggestedSale(
                          formCostOrig,
                          formPurchaseTc,
                          cur,
                          formShippingAmount,
                          formShippingCurrency,
                          formShippingTc,
                          formStock,
                          formMarginPct
                        );
                      }}
                      className={`rounded px-2.5 py-1 text-xs font-semibold ${
                        formCurrency === cur
                          ? 'bg-[#14171A] text-white'
                          : 'text-[#434B53]'
                      }`}
                    >
                      {cur === 'USD' ? 'USD' : 'Bs'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`grid gap-2.5 ${formCurrency === 'USD' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <label className="block text-xs font-semibold text-[#434B53]">
                  Costo catálogo c/u ({formCurrency === 'USD' ? 'USD' : 'Bs'}) *
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={formCostOrig}
                    onChange={(e) => {
                      setFormCostOrig(e.target.value);
                      recomputeSuggestedSale(
                        e.target.value,
                        formPurchaseTc,
                        formCurrency,
                        formShippingAmount,
                        formShippingCurrency,
                        formShippingTc,
                        formStock,
                        formMarginPct
                      );
                    }}
                    placeholder={formCurrency === 'USD' ? '80' : '200'}
                    className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
                  />
                </label>

                {formCurrency === 'USD' ? (
                  <label className="block text-xs font-semibold text-[#434B53]">
                    TC producto (Bs/USD)
                    <input
                      type="number"
                      step="0.01"
                      min={1}
                      value={formPurchaseTc}
                      onChange={(e) => {
                        setFormPurchaseTc(e.target.value);
                        recomputeSuggestedSale(
                          formCostOrig,
                          e.target.value,
                          formCurrency,
                          formShippingAmount,
                          formShippingCurrency,
                          formShippingTc,
                          formStock,
                          formMarginPct
                        );
                      }}
                      className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm font-semibold text-[#14171A]"
                    />
                  </label>
                ) : null}
              </div>
            </div>

            {/* 2. Freight / Shipping Cost with its own Currency & TC */}
            <div className="space-y-2 border-t border-[#EAEAE3] pt-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#14171A]">
                  2. Envío / flete total del lote (opc.)
                </span>
                <div className="grid grid-cols-2 gap-1 rounded-md bg-[#EAEAE3] p-0.5">
                  {(['BOB', 'USD'] as const).map((cur) => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => {
                        setFormShippingCurrency(cur);
                        recomputeSuggestedSale(
                          formCostOrig,
                          formPurchaseTc,
                          formCurrency,
                          formShippingAmount,
                          cur,
                          formShippingTc,
                          formStock,
                          formMarginPct
                        );
                      }}
                      className={`rounded px-2.5 py-1 text-xs font-semibold ${
                        formShippingCurrency === cur
                          ? 'bg-[#14171A] text-white'
                          : 'text-[#434B53]'
                      }`}
                    >
                      {cur === 'BOB' ? 'Bs' : 'USD'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`grid gap-2.5 ${formShippingCurrency === 'USD' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <label className="block text-xs font-semibold text-[#434B53]">
                  Costo flete ({formShippingCurrency === 'USD' ? 'USD' : 'Bs'})
                  <input
                    id="new-machine-shipping"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formShippingAmount}
                    onChange={(e) => {
                      setFormShippingAmount(e.target.value);
                      recomputeSuggestedSale(
                        formCostOrig,
                        formPurchaseTc,
                        formCurrency,
                        e.target.value,
                        formShippingCurrency,
                        formShippingTc,
                        formStock,
                        formMarginPct
                      );
                    }}
                    placeholder={formShippingCurrency === 'USD' ? 'Ej. 20' : 'Ej. 150'}
                    className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
                  />
                </label>

                {formShippingCurrency === 'USD' ? (
                  <label className="block text-xs font-semibold text-[#434B53]">
                    TC del flete (Bs/USD)
                    <input
                      type="number"
                      step="0.01"
                      min={1}
                      value={formShippingTc}
                      onChange={(e) => {
                        setFormShippingTc(e.target.value);
                        recomputeSuggestedSale(
                          formCostOrig,
                          formPurchaseTc,
                          formCurrency,
                          formShippingAmount,
                          formShippingCurrency,
                          e.target.value,
                          formStock,
                          formMarginPct
                        );
                      }}
                      className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm font-semibold text-[#14171A]"
                    />
                  </label>
                ) : null}
              </div>
            </div>

            {/* 3. Margin & Final Sale Price ALWAYS in Bolivianos (Bs) */}
            {(() => {
              const baseCost = Number(formCostOrig) || 0;
              const prodTc = formCurrency === 'USD' ? Math.max(0.01, Number(formPurchaseTc) || exchangeRate) : 1;
              const shipTc = formShippingCurrency === 'USD' ? Math.max(0.01, Number(formShippingTc) || exchangeRate) : 1;
              const qtyVal = Math.max(1, Number.parseInt(formStock || '1', 10) || 1);
              const shipAmt = Math.max(0, Number(formShippingAmount) || 0);

              const baseCostBs = Math.round(baseCost * prodTc);
              const shipTotalBs = Math.round(shipAmt * shipTc);
              const shipPerUnitBs = Math.round(shipTotalBs / qtyVal);
              const landedBs = Math.round(baseCost * prodTc + shipTotalBs / qtyVal);
              const saleNumBs = Math.round(Number(formSaleBs) || 0);
              const profitBs = saleNumBs - landedBs;

              return (
                <div className="space-y-2.5 border-t border-[#EAEAE3] pt-2.5">
                  {baseCost > 0 ? (
                    <div className="space-y-1 rounded-md border border-[#F3C898] bg-[#FEF2E4] px-3 py-2 text-xs text-[#434B53]">
                      <div className="flex flex-wrap justify-between gap-2 text-[11px] text-[#5B636B]">
                        <span className="tabular-nums">
                          Equipo: <strong className="text-[#14171A]">{formatBs(baseCostBs)}/u</strong>
                          {shipTotalBs > 0
                            ? ` + Flete (÷ ${qtyVal} u.): ${formatBs(shipPerUnitBs)}/u`
                            : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span>Costo real puesto en tienda:</span>
                        <strong className="tabular-nums font-display text-base text-[#14171A]">
                          {formatBs(landedBs)} / u
                        </strong>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#434B53]">
                      % Ganancia sobre costo (Bs):
                    </span>
                    <div className="flex items-center gap-1">
                      {(['20', '25', '30', '35'] as const).map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            setFormMarginPct(pct);
                            setSaleManuallyEdited(false);
                            recomputeSuggestedSale(
                              formCostOrig,
                              formPurchaseTc,
                              formCurrency,
                              formShippingAmount,
                              formShippingCurrency,
                              formShippingTc,
                              formStock,
                              pct,
                              true
                            );
                          }}
                          className={`rounded border px-2 py-1 text-[11px] font-bold ${
                            formMarginPct === pct && !saleManuallyEdited
                              ? 'border-[#14171A] bg-[#14171A] text-white'
                              : 'border-[#D6D6CD] bg-white text-[#434B53]'
                          }`}
                        >
                          +{pct}%
                        </button>
                      ))}
                      <input
                        type="number"
                        min={0}
                        max={300}
                        value={formMarginPct}
                        onChange={(e) => {
                          setFormMarginPct(e.target.value);
                          setSaleManuallyEdited(false);
                          recomputeSuggestedSale(
                            formCostOrig,
                            formPurchaseTc,
                            formCurrency,
                            formShippingAmount,
                            formShippingCurrency,
                            formShippingTc,
                            formStock,
                            e.target.value,
                            true
                          );
                        }}
                        aria-label="Porcentaje de ganancia personalizado"
                        className="tabular-nums h-7 w-14 rounded border border-[#D6D6CD] bg-white px-1.5 text-center text-xs font-bold text-[#14171A]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="new-machine-sale" className="text-xs font-semibold text-[#14171A]">
                        Precio de venta final (Bs) *
                      </label>
                      {baseCost > 0 && saleNumBs > 0 ? (
                        <span
                          className={`tabular-nums text-xs font-bold ${
                            profitBs >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
                          }`}
                        >
                          Ganancia: {profitBs >= 0 ? `+ ${formatBs(profitBs)}` : formatBs(profitBs)}/u
                        </span>
                      ) : null}
                    </div>
                    <input
                      id="new-machine-sale"
                      type="number"
                      min={1}
                      step="1"
                      required
                      value={formSaleBs}
                      onChange={(e) => {
                        setSaleManuallyEdited(true);
                        setFormSaleBs(e.target.value);
                      }}
                      placeholder="Ej. 1112"
                      className="tabular-nums mt-1 h-10 w-full rounded-lg border border-[#14171A]/30 bg-white px-3 text-base font-bold text-[#14171A]"
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#434B53]">
              Ubicación en bodega
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#434B53]">
              Proveedor
              <select
                value={formSupplierId}
                onChange={(e) => setFormSupplierId(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 text-sm text-[#14171A]"
              >
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-xs font-semibold text-[#434B53]">
            Números de serie (separados por coma, opcional)
            <input
              type="text"
              value={formSerials}
              onChange={(e) => setFormSerials(e.target.value)}
              placeholder="Ej. MAK-1600-01, MAK-1600-02"
              className="mt-1 h-10 w-full rounded-lg border border-[#D6D6CD] bg-white px-3 font-mono text-xs text-[#14171A]"
            />
          </label>

          <label className="block text-xs font-semibold text-[#434B53]">
            Especificaciones técnicas
            <textarea
              rows={2}
              value={formSpecs}
              onChange={(e) => setFormSpecs(e.target.value)}
              placeholder="Voltaje, potencia, capacidad..."
              className="mt-1 w-full rounded-lg border border-[#D6D6CD] bg-white p-3 text-sm text-[#14171A]"
            />
          </label>

          <button
            type="submit"
            className="btn-press inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#14171A] text-sm font-semibold text-white hover:bg-[#272C32]"
          >
            Guardar en Inventario
          </button>
        </form>
      </Drawer>

      {/* Bulk CSV Import Drawer */}
      <Drawer
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Importar inventario desde Excel / CSV"
        subtitle="Carga masiva inicial sin digitar artículo por artículo."
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-[#D6D6CD] bg-[#F8F8F5] p-4">
            <h3 className="font-display text-base font-bold text-[#14171A]">
              1. Descarga la plantilla estándar
            </h3>
            <p className="mt-1 text-xs text-[#5B636B]">
              Compatible con Excel y Google Sheets. Incluye columnas para compras en USD o Bs,
              tipo de cambio inicial, stock mínimo y garantía.
            </p>
            <button
              type="button"
              onClick={handleDownloadCsvTemplate}
              className="btn-press mt-3 inline-flex h-10 items-center gap-2 rounded-lg border border-[#D6D6CD] bg-white px-3.5 text-xs font-semibold text-[#14171A] hover:border-[#14171A]"
            >
              <Download className="h-4 w-4 text-[#C95B06]" />
              Descargar plantilla (.csv)
            </button>
          </div>

          <div className="rounded-xl border border-[#D6D6CD] bg-white p-4">
            <h3 className="font-display text-base font-bold text-[#14171A]">
              2. Sube tu archivo CSV
            </h3>
            <p className="mt-1 text-xs text-[#5B636B]">
              Los SKU duplicados se omiten automáticamente; los nuevos crean su lote inicial en el Kardex.
            </p>
            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#B9B9AE] bg-[#F8F8F5] px-4 py-5 text-xs font-semibold text-[#14171A] hover:border-[#14171A]">
              <span>Seleccionar archivo .csv</span>
              <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="sr-only" />
            </label>
          </div>

          <div className="border-t border-[#D6D6CD] pt-4">
            <button
              type="button"
              onClick={handleSampleImport}
              className="btn-press inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#14171A] text-sm font-semibold text-white hover:bg-[#272C32]"
            >
              <FileSpreadsheet className="h-4 w-4 text-[#F59E0B]" />
              Probar carga masiva de ejemplo (+2 equipos)
            </button>
          </div>
        </div>
      </Drawer>

      <CategoryManagerDrawer
        open={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        title="Categorías de productos"
        subtitle="Crea, renombra o elimina rubros del catálogo sin perder historial."
        categories={productCategories}
        usageCounts={categoryUsage}
        itemNoun="equipo(s)"
        onAdd={addProductCategory}
        onRename={(oldName, newName) => {
          const res = renameProductCategory(oldName, newName);
          if (res.ok && categoryFilter === oldName) {
            setCategoryFilter(newName.trim());
          }
          return res;
        }}
        onDelete={(name) => {
          const res = deleteProductCategory(name);
          if (res.ok && categoryFilter === name) {
            setCategoryFilter('all');
          }
          return res;
        }}
      />
    </div>
  );
}
