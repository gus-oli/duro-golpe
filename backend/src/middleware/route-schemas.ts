import { z } from 'zod'

export const routeIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9-]+$/, 'Identificador invalido')

export const inviteCodeSchema = z
  .string()
  .length(8)
  .regex(/^[A-Z0-9]+$/, 'Codigo de convite invalido')
