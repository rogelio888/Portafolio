import { useCallback, useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { AppShell } from './components/AppShell';
import { CustomersSection } from './components/CustomersSection';
import { ExpensesSection } from './components/ExpensesSection';
import { InventorySection } from './components/InventorySection';
import { LoginScreen } from './components/LoginScreen';
import { OverviewSection } from './components/OverviewSection';
import { ReportsSection } from './components/ReportsSection';
import { SalesSection } from './components/SalesSection';
import { SuppliersSection } from './components/SuppliersSection';
import { UsersRolesSection } from './components/UsersRolesSection';
import { StoreProvider, useStore } from './state/StoreContext';
import type { AppSection, MachineItem } from './types/store';
import { getStockLevel } from './utils/formatters';

function StoreWorkspace() {
  const {
    currentUser,
    role,
    exchangeRate,
    inventory,
    orders,
    quotes,
    hasPermission,
    setRole,
    setExchangeRate,
    resetDemoData,
  } = useStore();

  const [activeSection, setActiveSection] = useState<AppSection>('resumen');
  const [openNewMachineRequest, setOpenNewMachineRequest] = useState(false);
  const [preselectedSaleItem, setPreselectedSaleItem] = useState<MachineItem | null>(null);
  const [restockPrefill, setRestockPrefill] = useState<{
    itemId: string;
    supplierId: string;
  } | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    if (
      (activeSection === 'gastos' && !hasPermission('manage_expenses')) ||
      (activeSection === 'reportes' && !hasPermission('view_reports')) ||
      (activeSection === 'usuarios' && !hasPermission('manage_users')) ||
      (activeSection === 'ventas' && !hasPermission('process_sales')) ||
      (activeSection === 'clientes' && !hasPermission('manage_customers')) ||
      (activeSection === 'proveedores' && !hasPermission('manage_suppliers'))
    ) {
      setActiveSection('resumen');
    }
  }, [currentUser, activeSection, hasPermission]);

  const lowStockCount = useMemo(
    () => inventory.filter((it) => getStockLevel(it) !== 'ok').length,
    [inventory]
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status !== 'Recibida').length,
    [orders]
  );

  const openQuotesCount = useMemo(
    () => quotes.filter((q) => q.status === 'Abierta').length,
    [quotes]
  );

  const handleOpenNewMachine = useCallback(() => {
    setActiveSection('inventario');
    setOpenNewMachineRequest(true);
  }, []);

  const handleConsumeNewMachineRequest = useCallback(() => {
    setOpenNewMachineRequest(false);
  }, []);

  const handleQuickSell = useCallback((item: MachineItem) => {
    setPreselectedSaleItem(item);
    setActiveSection('ventas');
  }, []);

  const handleRequestRestock = useCallback((item: MachineItem) => {
    setRestockPrefill({ itemId: item.id, supplierId: item.supplierId });
    setActiveSection('proveedores');
  }, []);

  const handleClearPreselectedSale = useCallback(() => {
    setPreselectedSaleItem(null);
  }, []);

  const handleClearRestockPrefill = useCallback(() => {
    setRestockPrefill(null);
  }, []);

  const handleResetDemo = useCallback(() => {
    resetDemoData();
    toast.success('Datos restablecidos', {
      description: 'Inventario, lotes USD/Bs, ventas, gastos y órdenes volvieron al estado inicial.',
    });
  }, [resetDemoData]);

  return (
    <>
      {!currentUser ? (
        <LoginScreen />
      ) : (
        <AppShell
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          role={role}
          onChangeRole={setRole}
          exchangeRate={exchangeRate}
          onChangeExchangeRate={setExchangeRate}
          lowStockCount={lowStockCount}
          pendingOrdersCount={pendingOrdersCount}
          openQuotesCount={openQuotesCount}
          onResetDemo={handleResetDemo}
        >
          {activeSection === 'resumen' ? (
            <OverviewSection
              onNavigate={setActiveSection}
              onOpenNewMachine={handleOpenNewMachine}
              onRequestRestock={handleRequestRestock}
            />
          ) : null}

          {activeSection === 'inventario' ? (
            <InventorySection
              openNewRequest={openNewMachineRequest}
              onConsumeOpenNewRequest={handleConsumeNewMachineRequest}
              onQuickSell={handleQuickSell}
              onRequestRestock={handleRequestRestock}
            />
          ) : null}

          {activeSection === 'ventas' && hasPermission('process_sales') ? (
            <SalesSection
              preselectedItem={preselectedSaleItem}
              onClearPreselected={handleClearPreselectedSale}
            />
          ) : null}

          {activeSection === 'clientes' && hasPermission('manage_customers') ? (
            <CustomersSection />
          ) : null}

          {activeSection === 'proveedores' && hasPermission('manage_suppliers') ? (
            <SuppliersSection
              restockPrefill={restockPrefill}
              onClearRestockPrefill={handleClearRestockPrefill}
            />
          ) : null}

          {activeSection === 'gastos' && hasPermission('manage_expenses') ? (
            <ExpensesSection />
          ) : null}

          {activeSection === 'reportes' && hasPermission('view_reports') ? (
            <ReportsSection />
          ) : null}

          {activeSection === 'usuarios' && hasPermission('manage_users') ? (
            <UsersRolesSection />
          ) : null}
        </AppShell>
      )}

      <Toaster
        position="top-right"
        closeButton
        toastOptions={{
          closeButtonAriaLabel: 'Cerrar notificación',
          style: {
            border: '1px solid #D6D6CD',
            background: '#FFFFFF',
            color: '#14171A',
            fontFamily: '"Public Sans", system-ui, sans-serif',
            paddingRight: '38px',
          },
        }}
      />
    </>
  );
}

export function App() {
  return (
    <StoreProvider>
      <StoreWorkspace />
    </StoreProvider>
  );
}

export default App;
