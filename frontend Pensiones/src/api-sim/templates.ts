import { apiSimBus, type ApiSimEvent } from './bus';

export interface ApiSimTemplate {
  method: ApiSimEvent['method'];
  route: string;
  entity: string;
  operationLabel: string;
  controllerCode: string;
  sqlQuery: (ctx: any) => string;
  responseBody: (ctx: any) => unknown;
}

export function emitApiSim(template: ApiSimTemplate, ctx: any, options: { statusCode?: number; requestBody?: unknown } = {}) {
  apiSimBus.emit({
    method: template.method,
    route: template.route,
    entity: template.entity,
    operationLabel: template.operationLabel,
    statusCode: options.statusCode ?? 200,
    durationMs: 120 + Math.floor(Math.random() * 380),
    controllerCode: template.controllerCode,
    sqlQuery: template.sqlQuery(ctx),
    responseBody: template.responseBody(ctx),
    requestBody: options.requestBody,
  });
}
