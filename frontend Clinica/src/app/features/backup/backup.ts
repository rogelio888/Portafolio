import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BackupService } from '../../core/services/backup.service';

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './backup.html',
  styleUrl: './backup.css'
})
export class Backup {
  private readonly backupService = inject(BackupService);
  
  public readonly historial = this.backupService.historial;
  public generando = false;

  generarCopiaManual(): void {
    if (this.generando) return;
    
    this.generando = true;
    
    // Simulamos un pequeño retraso para que se vea la animación del botón
    setTimeout(() => {
      this.backupService.generarRespaldo();
      this.generando = false;
    }, 800);
  }

  // Helper para mostrar tamaño amigable (KB)
  formatearTamano(bytes: number): string {
    return (bytes / 1024).toFixed(2) + ' KB';
  }
}
