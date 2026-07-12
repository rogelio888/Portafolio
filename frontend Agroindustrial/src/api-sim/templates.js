import { apiSimBus } from './bus';

// template = { method, route, entity, operationLabel, controllerCode, sqlQuery(ctx), responseBody(ctx) }
export function emitApiSim(template, ctx, options = {}) {
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
