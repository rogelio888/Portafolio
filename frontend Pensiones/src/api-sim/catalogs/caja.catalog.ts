import type { ApiSimTemplate } from '../templates';

export const PAYMENT_CREATE: ApiSimTemplate = {
  method: 'POST',
  route: '/api/payments',
  entity: 'Pago',
  operationLabel: 'Registrar pago',
  controllerCode: `// PaymentController.php
public function store(StorePaymentRequest $request)
{
    $payment = Payment::create([
        'student_id' => $request->student_id,
        'payment_method' => $request->payment_method,
        'total_amount' => $request->total_amount,
        'status' => $request->payment_method === 'Efectivo' ? 'Pagado' : 'Pendiente',
        'transaction_id' => $request->payment_method === 'QR' ? Str::uuid() : null,
    ]);
    $payment->debts()->sync($request->debt_ids);
    if ($payment->status === 'Pagado') {
        Debt::whereIn('id', $request->debt_ids)->update(['payment_id' => $payment->id]);
    }
    AuditLog::record('Caja', 'Pago registrado', "Pago de Bs. {$payment->total_amount} para estudiante #{$payment->student_id}");
    return response()->json($payment, 201);
}`,
  sqlQuery: (ctx) => `INSERT INTO payments (student_id, payment_method, total_amount, status, transaction_id)
VALUES (${ctx.studentId}, '${ctx.method}', ${ctx.total}, '${ctx.status}', ${ctx.transactionId ? `'${ctx.transactionId}'` : 'NULL'});
INSERT INTO payment_debt (payment_id, debt_id) VALUES ${ctx.debtIdsSql};`,
  responseBody: (ctx) => ctx.response,
};

export const PAYMENT_STATUS: ApiSimTemplate = {
  method: 'GET',
  route: '/api/payments/{id}/status',
  entity: 'Pago',
  operationLabel: 'Consultar estado de pago (polling QR)',
  controllerCode: `// PaymentController.php
public function status(Payment $payment)
{
    return response()->json(['status' => $payment->status]);
}`,
  sqlQuery: (ctx) => `SELECT status FROM payments WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ status: ctx.status }),
};

export const PAYMENT_SHOW: ApiSimTemplate = {
  method: 'GET',
  route: '/api/payments/{id}',
  entity: 'Pago',
  operationLabel: 'Ver recibo de pago',
  controllerCode: `// PaymentController.php
public function show(Payment $payment)
{
    return response()->json([
        'recibo' => str_pad($payment->id, 6, '0', STR_PAD_LEFT),
        'fecha' => $payment->created_at->format('d/m/Y'),
        'metodo' => $payment->payment_method,
        'estudiante' => $payment->student,
        'cuotasPagadas' => $payment->debts,
        'total' => $payment->total_amount,
    ]);
}`,
  sqlQuery: (ctx) => `SELECT p.*, s.first_name, s.last_name FROM payments p JOIN students s ON s.id = p.student_id WHERE p.id = ${ctx.id};
SELECT d.* FROM debts d JOIN payment_debt pd ON pd.debt_id = d.id WHERE pd.payment_id = ${ctx.id};`,
  responseBody: (ctx) => ctx.receipt,
};

export const BANK_WEBHOOK: ApiSimTemplate = {
  method: 'POST',
  route: '/api/banco/webhook',
  entity: 'Pago',
  operationLabel: 'Webhook de confirmación bancaria (QR)',
  controllerCode: `// BankWebhookController.php
// Endpoint público que el banco simulado invoca cuando el tutor
// escanea y confirma el QR desde su app bancaria.
public function __invoke(Request $request)
{
    $payment = Payment::where('transaction_id', $request->transaction_id)->firstOrFail();
    $payment->update(['status' => $request->status]);
    if ($request->status === 'Pagado') {
        Debt::whereIn('id', $payment->debts->pluck('id'))->update(['payment_id' => $payment->id]);
        AuditLog::record('Caja', 'Pago confirmado por banco', "Transacción {$request->transaction_id} confirmada.");
    }
    return response()->json(['message' => 'Webhook procesado.']);
}`,
  sqlQuery: (ctx) => `UPDATE payments SET status = 'Pagado' WHERE transaction_id = '${ctx.transactionId}';
UPDATE debts SET payment_id = ${ctx.paymentId} WHERE id IN (${ctx.debtIds});`,
  responseBody: () => ({ message: 'Webhook procesado.' }),
};

export const MOROSOS_LIST: ApiSimTemplate = {
  method: 'GET',
  route: '/api/morosos',
  entity: 'Morosidad',
  operationLabel: 'Listar estudiantes en mora',
  controllerCode: `// MorososController.php
public function index()
{
    return Student::where('estado', '!=', 'Retirado')
        ->whereHas('debts', fn ($q) => $q->whereNull('payment_id')->where('due_date', '<', now()))
        ->get()
        ->map(fn ($s) => $s->toMorosoArray());
}`,
  sqlQuery: () => `SELECT s.*, COUNT(d.id) AS cuotas_mora, SUM(d.monto) AS monto_deuda
FROM students s JOIN debts d ON d.student_id = s.id
WHERE d.payment_id IS NULL AND d.due_date < CURDATE() AND s.estado != 'Retirado'
GROUP BY s.id;`,
  responseBody: (ctx) => ctx.morosos,
};

export const MOROSOS_FORCE_CHECK: ApiSimTemplate = {
  method: 'POST',
  route: '/api/morosos/force-check',
  entity: 'Morosidad',
  operationLabel: 'Forzar verificación de morosidad',
  controllerCode: `// MorososController.php
// El estado de mora se calcula en vivo (due_date vs. hoy), así que este
// endpoint solo dispara el recálculo y notifica cuántos casos hay activos.
public function forceCheck()
{
    $count = Debt::whereNull('payment_id')->where('due_date', '<', now())->count();
    return response()->json(['message' => "Verificación completada: {$count} cuota(s) en mora detectada(s)."]);
}`,
  sqlQuery: () => `SELECT COUNT(*) FROM debts WHERE payment_id IS NULL AND due_date < CURDATE();`,
  responseBody: (ctx) => ({ message: ctx.message }),
};

export const REPORT_DAILY: ApiSimTemplate = {
  method: 'GET',
  route: '/api/reports/daily',
  entity: 'Reporte',
  operationLabel: 'Reporte de ingresos diarios',
  controllerCode: `// ReportController.php
public function daily(Request $request)
{
    return Payment::with('student')
        ->whereDate('created_at', $request->date)
        ->where('status', 'Pagado')
        ->get()
        ->map(fn ($p) => $p->toDailyRow());
}`,
  sqlQuery: (ctx) => `SELECT p.*, s.first_name, s.last_name FROM payments p JOIN students s ON s.id = p.student_id
WHERE DATE(p.created_at) = '${ctx.date}' AND p.status = 'Pagado';`,
  responseBody: (ctx) => ctx.rows,
};

export const REPORT_PDF: ApiSimTemplate = {
  method: 'GET',
  route: '/api/reports/{tipo}',
  entity: 'Reporte',
  operationLabel: 'Exportar reporte en PDF',
  controllerCode: `// ReportController.php
public function exportPdf(string $tipo, Request $request)
{
    $pdf = Pdf::loadView("reports.{$tipo}", $this->dataFor($tipo, $request));
    return $pdf->download("{$tipo}.pdf");
}`,
  sqlQuery: (ctx) => `-- Misma consulta del reporte "${ctx.tipo}", renderizada a PDF con dompdf/laravel-pdf`,
  responseBody: () => '(binario application/pdf, ver pestaña Response como descarga)',
};

export const REPORT_DASHBOARD: ApiSimTemplate = {
  method: 'GET',
  route: '/api/reports/dashboard',
  entity: 'Reporte',
  operationLabel: 'Obtener indicadores del dashboard financiero',
  controllerCode: `// ReportController.php
public function dashboard()
{
    return response()->json([
        'recaudado_mes' => Payment::where('status', 'Pagado')->whereMonth('created_at', now()->month)->sum('total_amount'),
        'morosidad_promedio' => Debt::whereNull('payment_id')->where('due_date', '<', now())->count() / max(Debt::count(), 1) * 100,
        'pagos_hoy' => Payment::where('status', 'Pagado')->whereDate('created_at', today())->count(),
        'evolucion' => Payment::selectRaw("DATE_FORMAT(created_at, '%Y-%m') ym, SUM(total_amount) total")
            ->where('status', 'Pagado')->groupBy('ym')->orderBy('ym', 'desc')->limit(6)->get(),
    ]);
}`,
  sqlQuery: () => `SELECT SUM(total_amount) FROM payments WHERE status='Pagado' AND MONTH(created_at) = MONTH(CURDATE());
SELECT COUNT(*) FROM debts WHERE payment_id IS NULL AND due_date < CURDATE();
SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, SUM(total_amount) FROM payments WHERE status='Pagado' GROUP BY ym ORDER BY ym DESC LIMIT 6;`,
  responseBody: (ctx) => ctx.stats,
};

export const PORTAL_STUDENT_LOOKUP: ApiSimTemplate = {
  method: 'GET',
  route: '/api/portal/students/{codigo}',
  entity: 'Portal Público',
  operationLabel: 'Consultar estado de cuenta público (sin login)',
  controllerCode: `// PortalController.php
public function show(string $codigo)
{
    $student = Student::where('codigo', $codigo)->firstOrFail();
    return response()->json([
        'estudiante' => $student->toPortalArray(),
        'pensiones' => $student->debts->map(fn ($d) => $d->toPortalArray()),
    ]);
}`,
  sqlQuery: (ctx) => `SELECT * FROM students WHERE codigo = '${ctx.codigo}' LIMIT 1;
SELECT * FROM debts WHERE student_id = :id ORDER BY due_date;`,
  responseBody: (ctx) => ctx.payload,
};

export const PORTAL_PAYMENT_QR: ApiSimTemplate = {
  method: 'POST',
  route: '/api/portal/payments/qr',
  entity: 'Portal Público',
  operationLabel: 'Generar QR de pago (portal de padres)',
  controllerCode: `// PortalController.php
public function generateQr(Request $request)
{
    $student = Student::where('codigo', $request->codigo)->firstOrFail();
    $payment = Payment::create([
        'student_id' => $student->id, 'payment_method' => 'QR',
        'status' => 'Pendiente', 'transaction_id' => Str::uuid(),
        'total_amount' => Debt::whereIn('id', $request->debt_ids)->sum('monto'),
    ]);
    $payment->debts()->sync($request->debt_ids);
    return response()->json(['payment_id' => $payment->id, 'transaction_id' => $payment->transaction_id]);
}`,
  sqlQuery: (ctx) => `INSERT INTO payments (student_id, payment_method, status, transaction_id, total_amount)
VALUES (${ctx.studentId}, 'QR', 'Pendiente', '${ctx.transactionId}', ${ctx.total});`,
  responseBody: (ctx) => ({ payment_id: ctx.paymentId, transaction_id: ctx.transactionId }),
};

export const PORTAL_PAYMENT_STATUS: ApiSimTemplate = {
  method: 'GET',
  route: '/api/portal/payments/{id}/status',
  entity: 'Portal Público',
  operationLabel: 'Sondear confirmación de pago QR',
  controllerCode: `// PortalController.php
public function paymentStatus(Payment $payment)
{
    return response()->json(['status' => $payment->status]);
}`,
  sqlQuery: (ctx) => `SELECT status FROM payments WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ status: ctx.status }),
};

export const PORTAL_RECEIPT: ApiSimTemplate = {
  method: 'GET',
  route: '/api/portal/payments/{id}/receipt',
  entity: 'Portal Público',
  operationLabel: 'Ver comprobante de pago (portal de padres)',
  controllerCode: `// PortalController.php
public function receipt(Payment $payment)
{
    return response()->json([
        'recibo_id' => str_pad($payment->id, 6, '0', STR_PAD_LEFT),
        'fecha_pago' => $payment->created_at->format('d/m/Y'),
        'estudiante' => $payment->student->full_name,
        'curso' => $payment->student->course->nombre,
        'metodo' => $payment->payment_method,
        'conceptos' => $payment->debts,
        'monto_total' => $payment->total_amount,
    ]);
}`,
  sqlQuery: (ctx) => `SELECT p.*, s.first_name, s.last_name FROM payments p JOIN students s ON s.id = p.student_id WHERE p.id = ${ctx.id};`,
  responseBody: (ctx) => ctx.receipt,
};
