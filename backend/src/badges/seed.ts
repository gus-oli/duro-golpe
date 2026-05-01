import { db } from '../db/index.js'
import { badges } from '../db/schema/index.js'
import { sql } from 'drizzle-orm'

const BADGE_DATA = [
  {
    type: 'O_MESTRE',
    labelPt: 'O Mestre',
    descriptionPt: 'Acertou o resultado de 5 partidas consecutivas',
    iconKey: 'badge-mestre',
  },
  {
    type: 'PE_FRIO',
    labelPt: 'Pé Frio',
    descriptionPt: 'Errou o resultado de 5 partidas consecutivas',
    iconKey: 'badge-pe-frio',
  },
  {
    type: 'ZEBRA_HUNTER',
    labelPt: 'Zebra Hunter',
    descriptionPt: 'Acertou o resultado de uma partida zebra',
    iconKey: 'badge-zebra',
  },
]

export async function seedBadges(): Promise<void> {
  await db
    .insert(badges)
    .values(BADGE_DATA)
    .onConflictDoUpdate({
      target: badges.type,
      set: {
        labelPt: sql`excluded.label_pt`,
        descriptionPt: sql`excluded.description_pt`,
        iconKey: sql`excluded.icon_key`,
      },
    })
  console.info(`[BadgeSeed] Upserted ${BADGE_DATA.length} badges`)
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seedBadges()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
