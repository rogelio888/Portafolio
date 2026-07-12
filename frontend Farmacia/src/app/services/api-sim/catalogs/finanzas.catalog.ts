import { ApiSimTemplate } from '../templates';

export const GASTO_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/gastos',
  entity: 'Gasto',
  operationLabel: 'Registrar gasto operativo',
  controllerCode: `// ExpenseController.php
public function store(StoreExpenseRequest $request)
{
    $expense = Expense::create($request->validated());
    return response()->json($expense, 201);
}`,
  sqlQuery: (ctx) =>
    `INSERT INTO expenses (id, categoria, descripcion, fecha, monto) VALUES ('${ctx.id}', '${ctx.categoria}', '${ctx.descripcion}', '${ctx.fecha}', ${ctx.monto});`,
  responseBody: (ctx) => ctx,
};

export const GASTO_DELETE: ApiSimTemplate<{ id: string }> = {
  method: 'DELETE',
  route: '/api/gastos/{id}',
  entity: 'Gasto',
  operationLabel: 'Eliminar gasto',
  controllerCode: `// ExpenseController.php
public function destroy(Expense $expense)
{
    $expense->delete();
    return response()->json(null, 204);
}`,
  sqlQuery: (ctx) => `DELETE FROM expenses WHERE id = '${ctx.id}';`,
  responseBody: () => ({ success: true }),
};
