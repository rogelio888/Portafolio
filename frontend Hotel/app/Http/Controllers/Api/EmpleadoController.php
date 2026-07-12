<?php
// app/Http/Controllers/Api/EmpleadoController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class EmpleadoController extends Controller
{
    public function index(Request $request)
    {
        // Seguridad: Scoping por hotel
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $query = Empleado::with(['rol', 'hotel']);

        if ($request->filled('id_hotel')) {
            $query->porHotel($request->id_hotel);
        }

        if ($request->filled('id_rol')) {
            $query->where('id_rol', $request->id_rol);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $empleados = $query->get();

        return response()->json([
            'success' => true,
            'data' => $empleados
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_rol' => 'required|exists:roles,id',
            'id_hotel' => 'nullable|exists:hoteles,id',
            'nombre' => 'required|string|max:150',
            'apellido' => 'required|string|max:150',
            'usuario' => 'required|string|max:100|unique:empleados,usuario',
            'password' => 'required|string|min:6',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $empleado = Empleado::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Empleado creado exitosamente',
            'data' => $empleado->load(['rol', 'hotel'])
        ], 201);
    }

    public function show($id)
    {
        $empleado = Empleado::with(['rol.permisos', 'hotel'])->find($id);

        if (!$empleado) {
            return response()->json([
                'success' => false,
                'message' => 'Empleado no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $empleado
        ]);
    }

    public function update(Request $request, $id)
    {
        $empleado = Empleado::find($id);

        if (!$empleado) {
            return response()->json([
                'success' => false,
                'message' => 'Empleado no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_rol' => 'exists:roles,id',
            'id_hotel' => 'nullable|exists:hoteles,id',
            'nombre' => 'string|max:150',
            'apellido' => 'string|max:150',
            'usuario' => 'string|max:100|unique:empleados,usuario,' . $id,
            'password' => 'nullable|string|min:6',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('password');

        // Solo actualizar password si se proporciona
        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $empleado->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Empleado actualizado exitosamente',
            'data' => $empleado
        ]);
    }

    public function destroy($id)
    {
        $empleado = Empleado::find($id);

        if (!$empleado) {
            return response()->json([
                'success' => false,
                'message' => 'Empleado no encontrado'
            ], 404);
        }

        $empleado->estado = 'INACTIVO';
        $empleado->save();

        return response()->json([
            'success' => true,
            'message' => 'Empleado inactivado exitosamente'
        ]);
    }

    /**
     * Obtener permisos del empleado
     */
    public function permisos($id)
    {
        $empleado = Empleado::with('rol.permisos')->find($id);

        if (!$empleado) {
            return response()->json([
                'success' => false,
                'message' => 'Empleado no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'empleado' => $empleado->getNombreCompleto(),
                'rol' => $empleado->rol ? $empleado->rol->nombre : 'Sin Rol',
                'permisos' => $empleado->rol ? $empleado->rol->permisos : []
            ]
        ]);
    }
}
