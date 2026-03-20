export enum EstadoExpediente {
  INICIADO = 'INICIADO',               // Recién creado, todos los docs en PENDIENTE_CARGA
  EN_PROGRESO = 'EN_PROGRESO',          // Algunos docs cargados, otros aún pendientes de carga
  EN_REVISION = 'EN_REVISION',          // Todos los docs están CARGADOS o APROBADOS (el municipio puede revisar)
  PENDIENTE_RESUBIDA = 'PENDIENTE_RESUBIDA', // Al menos 1 doc necesita resubida
  FINALIZADO = 'FINALIZADO',            // Todos los docs APROBADOS
}
