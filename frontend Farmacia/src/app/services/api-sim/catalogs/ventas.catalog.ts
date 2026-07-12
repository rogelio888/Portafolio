import { ApiSimTemplate } from '../templates';

export const VENTA_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/ventas',
  entity: 'Venta',
  operationLabel: 'Registrar venta (FEFO)',
  controllerCode: `// SaleController.php
public function store(StoreSaleRequest $request)
{
    return DB::transaction(function () use ($request) {
        $sale = Sale::create($request->safe()->except('items'));
        foreach ($request->items as $cartItem) {
            $lots = ProductLot::where('product_id', $cartItem['productoId'])
                ->where('stock', '>', 0)
                ->orderBy('fecha_vencimiento') // FEFO
                ->get();
            $this->discountFefo($sale, $lots, $cartItem['cantidad']);
        }
        return response()->json($sale->load('items'), 201);
    });
}`,
  sqlQuery: (ctx) =>
    `INSERT INTO sales (id, cliente_name, tipo_pago, subtotal, descuento, total, estado) VALUES ('${ctx.id}', '${ctx.clienteName}', '${ctx.tipoPago}', ${ctx.subtotal}, ${ctx.descuento}, ${ctx.total}, 'Completada');
-- UPDATE product_lots SET stock = stock - cantidad ... (algoritmo FEFO, ${ctx.items?.length ?? 0} ítems)
-- INSERT INTO kardex_movements (...) por cada lote afectado`,
  responseBody: (ctx) => ctx,
};

export const VENTA_ANULAR: ApiSimTemplate<{ id: string; items: number }> = {
  method: 'PATCH',
  route: '/api/ventas/{id}/anular',
  entity: 'Venta',
  operationLabel: 'Anular venta',
  controllerCode: `// SaleController.php
public function anular(Sale $sale)
{
    return DB::transaction(function () use ($sale) {
        $sale->update(['estado' => 'Anulada']);
        foreach ($sale->items as $item) {
            $item->lot->increment('stock', $item->cantidad);
            KardexMovement::create([...'tipo' => 'Entrada', 'detalle' => "Anulación Venta {$sale->id}"]);
        }
        return response()->json($sale);
    });
}`,
  sqlQuery: (ctx) =>
    `UPDATE sales SET estado = 'Anulada' WHERE id = '${ctx.id}';
-- UPDATE product_lots SET stock = stock + cantidad ... (${ctx.items} ítems devueltos)`,
  responseBody: (ctx) => ({ id: ctx.id, estado: 'Anulada' }),
};
