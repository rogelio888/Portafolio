import type { ApiSimTemplate } from '../templates';

export const STUDENT_LIST: ApiSimTemplate = {
  method: 'GET',
  route: '/api/students',
  entity: 'Estudiante',
  operationLabel: 'Listar / buscar estudiantes',
  controllerCode: `// StudentController.php
public function index(Request $request)
{
    return Student::with('course')
        ->when($request->q, fn ($q, $term) => $q->where('first_name', 'like', "%{$term}%")
            ->orWhere('last_name', 'like', "%{$term}%")
            ->orWhere('ci', 'like', "%{$term}%")
            ->orWhere('codigo', 'like', "%{$term}%"))
        ->get();
}`,
  sqlQuery: (ctx) => ctx.q
    ? `SELECT * FROM students WHERE first_name LIKE '%${ctx.q}%' OR last_name LIKE '%${ctx.q}%' OR ci LIKE '%${ctx.q}%' OR codigo LIKE '%${ctx.q}%';`
    : `SELECT * FROM students ORDER BY last_name ASC;`,
  responseBody: (ctx) => ctx.students,
};

export const STUDENT_CREATE: ApiSimTemplate = {
  method: 'POST',
  route: '/api/students',
  entity: 'Estudiante',
  operationLabel: 'Inscribir estudiante',
  controllerCode: `// StudentController.php
public function store(StoreStudentRequest $request)
{
    $codigo = 'CC-' . now()->year . '-' . str_pad(Student::count() + 1, 3, '0', STR_PAD_LEFT);
    $student = Student::create($request->validated() + ['codigo' => $codigo, 'estado' => 'Activo']);
    return response()->json($student, 201);
}`,
  sqlQuery: (ctx) => `INSERT INTO students (codigo, first_name, last_name, ci, course_id, guardian_name, guardian_ci, phone, estado)
VALUES ('${ctx.codigo}', '${ctx.first_name}', '${ctx.last_name}', '${ctx.ci}', ${ctx.course_id}, '${ctx.guardian_name}', '${ctx.guardian_ci}', '${ctx.phone}', 'Activo');`,
  responseBody: (ctx) => ctx.student,
};

export const STUDENT_UPDATE: ApiSimTemplate = {
  method: 'PUT',
  route: '/api/students/{id}',
  entity: 'Estudiante',
  operationLabel: 'Actualizar estudiante',
  controllerCode: `// StudentController.php
public function update(UpdateStudentRequest $request, Student $student)
{
    $student->update($request->validated());
    return response()->json($student);
}`,
  sqlQuery: (ctx) => `UPDATE students SET ${ctx.fields} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx.student,
};

export const STUDENT_BAJA: ApiSimTemplate = {
  method: 'PUT',
  route: '/api/students/{id}',
  entity: 'Estudiante',
  operationLabel: 'Dar de baja a estudiante',
  controllerCode: `// StudentController.php
public function update(UpdateStudentRequest $request, Student $student)
{
    $student->update(['estado' => 'Retirado']);
    return response()->json($student);
}`,
  sqlQuery: (ctx) => `UPDATE students SET estado = 'Retirado' WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx.student,
};

export const STUDENT_DEBTS: ApiSimTemplate = {
  method: 'GET',
  route: '/api/students/{id}/debts',
  entity: 'Cuota',
  operationLabel: 'Consultar estado de cuenta del estudiante',
  controllerCode: `// StudentController.php
public function debts(Student $student)
{
    return $student->debts()
        ->orderBy('due_date')
        ->get()
        ->map(fn ($d) => $d->toStatusArray()); // estado calculado: Pagado / Mora / Pendiente
}`,
  sqlQuery: (ctx) => `SELECT d.*, p.id AS payment_id
FROM debts d LEFT JOIN payments p ON p.id = d.payment_id
WHERE d.student_id = ${ctx.studentId} ORDER BY d.due_date ASC;`,
  responseBody: (ctx) => ctx.debts,
};

export const COURSE_LIST: ApiSimTemplate = {
  method: 'GET',
  route: '/api/courses',
  entity: 'Curso',
  operationLabel: 'Listar cursos',
  controllerCode: `// CourseController.php
public function index()
{
    return Course::withCount(['students' => fn ($q) => $q->where('estado', '!=', 'Retirado')])->get();
}`,
  sqlQuery: () => `SELECT c.*, COUNT(s.id) AS alumnos_count
FROM courses c LEFT JOIN students s ON s.course_id = c.id AND s.estado != 'Retirado'
GROUP BY c.id;`,
  responseBody: (ctx) => ctx.courses,
};

export const COURSE_CREATE: ApiSimTemplate = {
  method: 'POST',
  route: '/api/courses',
  entity: 'Curso',
  operationLabel: 'Aperturar curso',
  controllerCode: `// CourseController.php
public function store(StoreCourseRequest $request)
{
    $course = Course::create($request->validated());
    return response()->json($course, 201);
}`,
  sqlQuery: (ctx) => `INSERT INTO courses (level, grade, parallel, shift) VALUES ('${ctx.level}', '${ctx.grade}', '${ctx.parallel}', '${ctx.shift}');`,
  responseBody: (ctx) => ctx.course,
};

export const COURSE_DELETE: ApiSimTemplate = {
  method: 'DELETE',
  route: '/api/courses/{id}',
  entity: 'Curso',
  operationLabel: 'Eliminar curso',
  controllerCode: `// CourseController.php
public function destroy(Course $course)
{
    if ($course->students()->where('estado', '!=', 'Retirado')->exists()) {
        return response()->json(['message' => 'No se puede eliminar: el curso tiene alumnos inscritos.'], 400);
    }
    $course->delete();
    return response()->json(null, 204);
}`,
  sqlQuery: (ctx) => `SELECT COUNT(*) FROM students WHERE course_id = ${ctx.id} AND estado != 'Retirado';
-- Si count = 0: DELETE FROM courses WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const PERIOD_LIST: ApiSimTemplate = {
  method: 'GET',
  route: '/api/periods',
  entity: 'Periodo',
  operationLabel: 'Listar gestiones escolares',
  controllerCode: `// PeriodController.php
public function index()
{
    return Period::orderByDesc('year')->get();
}`,
  sqlQuery: () => `SELECT * FROM periods ORDER BY year DESC;`,
  responseBody: (ctx) => ctx.periods,
};

export const PERIOD_ACTIVE: ApiSimTemplate = {
  method: 'GET',
  route: '/api/periods/active',
  entity: 'Periodo',
  operationLabel: 'Obtener gestión activa',
  controllerCode: `// PeriodController.php
public function active()
{
    $period = Period::where('is_active', true)->firstOrFail();
    return response()->json([
        'period' => $period,
        'fees_template' => $period->feesTemplate,
        'course_amounts' => $period->courseAmounts()->with('course')->get(),
    ]);
}`,
  sqlQuery: () => `SELECT * FROM periods WHERE is_active = 1 LIMIT 1;
SELECT * FROM fees_template WHERE period_id = :id ORDER BY due_date;
SELECT * FROM course_amounts WHERE period_id = :id;`,
  responseBody: (ctx) => ctx.payload,
};

export const PERIOD_BY_YEAR: ApiSimTemplate = {
  method: 'GET',
  route: '/api/periods/by-year/{year}',
  entity: 'Periodo',
  operationLabel: 'Obtener gestión por año',
  controllerCode: `// PeriodController.php
public function byYear(int $year)
{
    $period = Period::where('year', $year)->firstOrFail();
    return response()->json([
        'period' => $period,
        'fees_template' => $period->feesTemplate,
        'course_amounts' => $period->courseAmounts()->with('course')->get(),
    ]);
}`,
  sqlQuery: (ctx) => `SELECT * FROM periods WHERE year = ${ctx.year} LIMIT 1;`,
  responseBody: (ctx) => ctx.payload,
};

export const PERIOD_CREATE: ApiSimTemplate = {
  method: 'POST',
  route: '/api/periods',
  entity: 'Periodo',
  operationLabel: 'Aperturar gestión escolar',
  controllerCode: `// PeriodController.php
public function store(StorePeriodRequest $request)
{
    $period = Period::create(['year' => $request->year, 'is_active' => true]);
    Period::where('id', '!=', $period->id)->update(['is_active' => false]);
    $period->saveFeesTemplate($request->due_dates);
    $period->saveCourseAmounts($request->course_amounts);
    return response()->json($period, 201);
}`,
  sqlQuery: (ctx) => `INSERT INTO periods (year, is_active) VALUES (${ctx.year}, 1);
UPDATE periods SET is_active = 0 WHERE year != ${ctx.year};
-- 10 INSERT INTO fees_template ... / N INSERT INTO course_amounts ...`,
  responseBody: (ctx) => ctx.period,
};

export const PERIOD_UPDATE: ApiSimTemplate = {
  method: 'PUT',
  route: '/api/periods/{year}',
  entity: 'Periodo',
  operationLabel: 'Actualizar cronograma de gestión',
  controllerCode: `// PeriodController.php
public function update(UpdatePeriodRequest $request, Period $period)
{
    $period->saveFeesTemplate($request->due_dates);
    $period->saveCourseAmounts($request->course_amounts);
    return response()->json($period);
}`,
  sqlQuery: (ctx) => `-- 10 UPDATE fees_template SET due_date = ... WHERE period_id = ${ctx.periodId} AND mes_index = n
-- N UPDATE course_amounts SET amount = ... WHERE period_id = ${ctx.periodId} AND course_id = c`,
  responseBody: (ctx) => ctx.period,
};

export const PERIOD_COURSE_FEE_UPDATE: ApiSimTemplate = {
  method: 'PUT',
  route: '/api/periods/{year}/courses/{course_id}/fees',
  entity: 'Periodo',
  operationLabel: 'Actualizar pensión mensual de un curso',
  controllerCode: `// PeriodController.php
public function updateCourseFee(Request $request, Period $period, Course $course)
{
    $period->courseAmounts()->updateOrCreate(['course_id' => $course->id], ['amount' => $request->amount]);
    return response()->json(['success' => true]);
}`,
  sqlQuery: (ctx) => `UPDATE course_amounts SET amount = ${ctx.amount} WHERE period_id = ${ctx.periodId} AND course_id = ${ctx.courseId};`,
  responseBody: () => ({ success: true }),
};
