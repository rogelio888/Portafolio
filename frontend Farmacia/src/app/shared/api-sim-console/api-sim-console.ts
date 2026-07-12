import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiSimLogService } from '../../services/api-sim-log.service';
import { ApiSimEvent } from '../../services/api-sim/bus';

type ApiSimTab = 'request' | 'code' | 'sql' | 'response';

@Component({
  selector: 'app-api-sim-console',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-sim-console.html',
  styleUrl: './api-sim-console.css',
})
export class ApiSimConsole {
  expandedId = signal<string | null>(null);
  activeTab = signal<ApiSimTab>('request');

  constructor(public log: ApiSimLogService) {}

  toggleExpand(event: ApiSimEvent): void {
    this.expandedId.set(this.expandedId() === event.id ? null : event.id);
    this.activeTab.set('request');
  }

  setTab(tab: ApiSimTab): void {
    this.activeTab.set(tab);
  }

  methodClass(method: string): string {
    switch (method) {
      case 'GET':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'POST':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  }

  relativeTime(iso: string): string {
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (diffSec < 5) return 'ahora';
    if (diffSec < 60) return `hace ${diffSec}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin}m`;
    return `hace ${Math.floor(diffMin / 60)}h`;
  }
}
