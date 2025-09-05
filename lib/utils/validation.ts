import { z } from "zod"

export const MatchSchema = z.object({
  homeTeam: z.string().min(1, "Hazai csapat neve kötelező").max(100, "Túl hosszú csapatnév"),
  awayTeam: z.string().min(1, "Vendég csapat neve kötelező").max(100, "Túl hosszú csapatnév"),
  homeScore: z.number().int().min(0, "A gólok száma nem lehet negatív"),
  awayScore: z.number().int().min(0, "A gólok száma nem lehet negatív"),
  date: z.string().datetime("Érvénytelen dátum formátum"),
  league: z.string().min(1, "Liga neve kötelező").max(50, "Túl hosszú liga név"),
  btts: z.boolean(),
  comeback: z.boolean(),
})

export const MatchFilterSchema = z.object({
  homeTeam: z.string().optional(),
  awayTeam: z.string().optional(),
  league: z.string().optional(),
  btts: z.boolean().optional(),
  comeback: z.boolean().optional(),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
})

export type MatchFormData = z.infer<typeof MatchSchema>
export type MatchFilterData = z.infer<typeof MatchFilterSchema>
