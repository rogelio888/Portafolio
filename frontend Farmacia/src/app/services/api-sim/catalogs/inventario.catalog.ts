import { ApiSimTemplate } from '../templates';

export const PROVEEDOR_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/proveedores',
  entity: 'Proveedor',
  operationLabel: 'Registrar proveedor',
  controllerCode: `// SupplierController.php
public function store(StoreSupplierRequest $request)
{
    $supplier = Supplier::create($request->validated());
    return response()->json($supplier, 201);
}`,
  sqlQuery: (ctx) =>
    `INSERT INTO suppliers (nombre, nit, telefono, direccion, contacto) VALUES ('${ctx.nombre}', '${ctx.nit}', '${ctx.telefono}', '${ctx.direccion}', '${ctx.contacto}');`,
  responseBody: (ctx) => ctx,
};

export const PROVEEDOR_UPDATE: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/proveedores/{id}',
  entity: 'Proveedor',
  operationLabel: 'Actualizar proveedor',
  controllerCode: `// SupplierController.php
public function update(UpdateSupplierRequest $request, Supplier $supplier)
{
    $supplier->update($request->validated());
    return response()->json($supplier);
}`,
  sqlQuery: (ctx) =>
    `UPDATE suppliers SET nombre='${ctx.nombre}', nit='${ctx.nit}', telefono='${ctx.telefono}' WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const PROVEEDOR_DELETE: ApiSimTemplate<{ id: number }> = {
  method: 'DELETE',
  route: '/api/proveedores/{id}',
  entity: 'Proveedor',
  operationLabel: 'Eliminar proveedor',
  controllerCode: `// SupplierController.php
public function destroy(Supplier $supplier)
{
    $supplier->delete();
    return response()->json(null, 204);
}`,
  sqlQuery: (ctx) => `DELETE FROM suppliers WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const PRODUCTO_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/productos',
  entity: 'Producto',
  operationLabel: 'Crear producto',
  controllerCode: `// ProductController.php
public function store(StoreProductRequest $request)
{
    $product = Product::create($request->validated());
    return response()->json($product, 201);
}`,
  sqlQuery: (ctx) =>
    `INSERT INTO products (id, nombre, categoria, precio_venta, stock_minimo, receta_obligatoria) VALUES ('${ctx.id}', '${ctx.nombre}', '${ctx.categoria}', ${ctx.precioVenta}, ${ctx.stockMinimo}, ${ctx.recetaObligatoria});`,
  responseBody: (ctx) => ctx,
};

export const PRODUCTO_UPDATE: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/productos/{id}',
  entity: 'Producto',
  operationLabel: 'Actualizar producto',
  controllerCode: `// ProductController.php
public function update(UpdateProductRequest $request, Product $product)
{
    $product->update($request->validated());
    return response()->json($product);
}`,
  sqlQuery: (ctx) =>
    `UPDATE products SET nombre='${ctx.nombre}', precio_venta=${ctx.precioVenta}, stock_minimo=${ctx.stockMinimo} WHERE id='${ctx.id}';`,
  responseBody: (ctx) => ctx,
};

export const PRODUCTO_DELETE: ApiSimTemplate<{ id: string }> = {
  method: 'DELETE',
  route: '/api/productos/{id}',
  entity: 'Producto',
  operationLabel: 'Eliminar producto',
  controllerCode: `// ProductController.php
public function destroy(Product $product)
{
    $product->delete();
    return response()->json(null, 204);
}`,
  sqlQuery: (ctx) => `DELETE FROM products WHERE id = '${ctx.id}';`,
  responseBody: () => ({ success: true }),
};

export const PRODUCTO_IMPORT: ApiSimTemplate<{ count: number }> = {
  method: 'POST',
  route: '/api/productos/import',
  entity: 'Producto',
  operationLabel: 'Importar catálogo (Excel)',
  controllerCode: `// ProductController.php
public function import(ImportProductsRequest $request)
{
    $rows = Excel::toArray(new ProductsImport, $request->file('file'));
    Product::insertOrIgnore($rows[0]);
    return response()->json(['imported' => count($rows[0])]);
}`,
  sqlQuery: (ctx) => `INSERT IGNORE INTO products (...) VALUES (...); -- ${ctx.count} filas`,
  responseBody: (ctx) => ({ imported: ctx.count }),
};

export const COMPRA_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/compras',
  entity: 'Compra',
  operationLabel: 'Registrar ingreso de mercadería',
  controllerCode: `// PurchaseController.php
public function store(StorePurchaseRequest $request)
{
    return DB::transaction(function () use ($request) {
        $purchase = Purchase::create($request->validated());
        foreach ($request->items as $item) {
            ProductLot::updateOrCreate(
                ['product_id' => $item['productoId'], 'id' => $item['loteId']],
                ['stock' => DB::raw('stock + ' . $item['cantidad']), 'costo_compra' => $item['costoUnitario']]
            );
            KardexMovement::create([...]);
        }
        return response()->json($purchase, 201);
    });
}`,
  sqlQuery: (ctx) =>
    `INSERT INTO purchases (id, proveedor_id, nro_factura, total) VALUES ('${ctx.id}', ${ctx.proveedorId}, '${ctx.nroFactura}', ${ctx.total});
-- + UPDATE product_lots por cada ítem (${ctx.items?.length ?? 0})`,
  responseBody: (ctx) => ctx,
};

export const STOCK_ADJUST: ApiSimTemplate<any> = {
  method: 'PATCH',
  route: '/api/productos/{id}/ajuste-stock',
  entity: 'Producto',
  operationLabel: 'Ajuste manual de stock',
  controllerCode: `// ProductController.php
public function adjustStock(AdjustStockRequest $request, Product $product)
{
    $lot = $product->lots()->findOrFail($request->lote_id);
    $lot->update(['stock' => $request->cantidad_nueva]);
    KardexMovement::create([
        'product_id' => $product->id, 'lote_id' => $lot->id,
        'tipo' => $request->cantidad_nueva >= $lot->getOriginal('stock') ? 'Entrada' : 'Salida',
        'detalle' => $request->motivo,
    ]);
    return response()->json($lot);
}`,
  sqlQuery: (ctx) =>
    `UPDATE product_lots SET stock = ${ctx.cantidadNueva} WHERE id = '${ctx.loteId}' AND product_id = '${ctx.productoId}';
INSERT INTO kardex_movements (producto_id, lote_id, cantidad, detalle) VALUES ('${ctx.productoId}', '${ctx.loteId}', ${ctx.cantidadNueva}, '${ctx.motivo}');`,
  responseBody: (ctx) => ctx,
};
