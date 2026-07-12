<?php
// app/Http/Controllers/Api/HuespedController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Huesped;
use App\Models\SolicitudAutorizacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class HuespedController extends Controller
{
    public function index(Request $request)
    {
        $query = Huesped::query();

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('buscar')) {
            $query->buscar($request->buscar);
        }

        $huespedes = $query->get();

        // Agregar flag can_edit
        $user = Auth::user();
        $huespedes->transform(function ($huesped) use ($user) {
            $huesped->can_edit = false;

            if (!$user)
                return $huesped;

            // Si tiene permiso directo
            if ($user->tienePermiso('gestionar_huespedes')) {
                $huesped->can_edit = true;
                return $huesped;
            }

            // Si tiene solicitud aprobada y NO usada
            $solicitud = SolicitudAutorizacion::where('solicitante_id', $user->id)
                ->where('modelo', Huesped::class)
                ->where('modelo_id', $huesped->id)
                ->where('estado', 'APROBADA')
                ->whereNull('used_at')
                ->where('created_at', '>=', now()->subHours(24)) // Validez de 24h
                ->exists();

            if ($solicitud) {
                $huesped->can_edit = true;
            }

            return $huesped;
        });

        return response()->json([
            'success' => true,
            'data' => $huespedes
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:150',
            'apellido' => 'required|string|max:150',
            'ci' => 'required|string|max:30|unique:huespedes,ci',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $huesped = Huesped::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Huésped registrado exitosamente',
            'data' => $huesped
        ], 201);
    }

    public function show($id)
    {
        $huesped = Huesped::with(['reservasPrincipales', 'reservasAdicionales'])
            ->find($id);

        if (!$huesped) {
            return response()->json([
                'success' => false,
                'message' => 'Huésped no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $huesped
        ]);
    }

    public function update(Request $request, $id)
    {
        $huesped = Huesped::find($id);
        $user = Auth::user();

        if (!$huesped) {
            return response()->json([
                'success' => false,
                'message' => 'Huésped no encontrado'
            ], 404);
        }

        // Verificar autorización
        $autorizado = false;
        $solicitud = null;

        if ($user->tienePermiso('gestionar_huespedes')) {
            $autorizado = true;
        } else {
            // Buscar solicitud aprobada y no usada
            $solicitud = SolicitudAutorizacion::where('solicitante_id', $user->id)
                ->where('modelo', Huesped::class)
                ->where('modelo_id', $id)
                ->where('estado', 'APROBADA')
                ->whereNull('used_at')
                ->first();

            if ($solicitud) {
                $autorizado = true;
            }
        }

        if (!$autorizado) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes autorización para editar este registro.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'string|max:150',
            'apellido' => 'string|max:150',
            'ci' => 'string|max:30|unique:huespedes,ci,' . $id,
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $huesped->update($request->all());

        // Si se usó una solicitud, marcarla como usada
        if ($solicitud) {
            $solicitud->update(['used_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Huésped actualizado exitosamente',
            'data' => $huesped
        ]);
    }

    public function destroy($id)
    {
        $huesped = Huesped::find($id);

        if (!$huesped) {
            return response()->json([
                'success' => false,
                'message' => 'Huésped no encontrado'
            ], 404);
        }

        $huesped->estado = 'INACTIVO';
        $huesped->save();

        return response()->json([
            'success' => true,
            'message' => 'Huésped inactivado exitosamente'
        ]);
    }

    /**
     * Buscar huésped por CI
     */
    public function buscarPorCi(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ci' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $huesped = Huesped::where('ci', $request->ci)->first();

        if (!$huesped) {
            return response()->json([
                'success' => false,
                'message' => 'Huésped no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $huesped
        ]);
    }
}