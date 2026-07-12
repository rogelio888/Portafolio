import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BitacoraService, AccionBitacora } from '../../core/services/bitacora.service';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './bitacora.html',
  styleUrl: './bitacora.css'
})
export class Bitacora {
  private readonly bitacoraService = inject(BitacoraService);
  
  public readonly logs = this.bitacoraService.logs;

  // Helper para asignar un ícono o color visual según la acción
  obtenerEstiloAccion(accion: AccionBitacora): { bg: string, color: string, icono: string } {
    switch (accion) {
      case 'Creación':
        return { bg: '#dcfce7', color: '#166534', icono: 'plus' }; // Verde
      case 'Actualización':
        return { bg: '#fef3c7', color: '#92400e', icono: 'edit' }; // Naranja/Amarillo
      case 'Eliminación':
        return { bg: '#fee2e2', color: '#991b1b', icono: 'trash' }; // Rojo
      case 'Permisos':
        return { bg: '#e0e7ff', color: '#3730a3', icono: 'shield' }; // Indigo
      case 'Autenticación':
        return { bg: '#f3e8ff', color: '#6b21a8', icono: 'user' }; // Púrpura
      default:
        return { bg: '#f1f5f9', color: '#475569', icono: 'info' }; // Gris
    }
  }
}
