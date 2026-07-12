import { HttpMethod, apiSimBus } from './bus';

export interface ApiSimTemplate<Ctx = any> {
  method: HttpMethod;
  route: string;
  entity: string;
  operationLabel: string;
  controllerCode: string;
  sqlQuery: (ctx: Ctx) => string;
  responseBody: (ctx: Ctx) => unknown;
}

export function emitApiSim<Ctx>(
  template: ApiSimTemplate<Ctx>,
  ctx: Ctx,
  options: { statusCode?: number; requestBody?: unknown } = {}
): void {
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
