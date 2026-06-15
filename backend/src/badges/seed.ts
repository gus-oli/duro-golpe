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
  {
    type: 'PRIMEIRA_CRAVADA',
    labelPt: 'Primeira Cravada',
    descriptionPt: 'Acertou seu primeiro placar exato',
    iconKey: 'badge-primeira-cravada',
  },
  {
    type: 'HAT_TRICK_EXATO',
    labelPt: 'Hat-trick de Cravadas',
    descriptionPt: 'Acertou 3 placares exatos',
    iconKey: 'badge-hat-trick-exato',
  },
  {
    type: 'REI_DO_SALDO',
    labelPt: 'Rei do Saldo',
    descriptionPt: 'Acertou 5 resultados com vencedor e saldo de gols',
    iconKey: 'badge-rei-do-saldo',
  },
  {
    type: 'GOL_DE_HONRA',
    labelPt: 'Gol de Honra',
    descriptionPt: 'Fez seus primeiros pontos em partidas',
    iconKey: 'badge-gol-de-honra',
  },
  {
    type: 'REGULARIDADE',
    labelPt: 'Regularidade',
    descriptionPt: 'Pontuou em 10 partidas diferentes',
    iconKey: 'badge-regularidade',
  },
  {
    type: 'VOLTA_POR_CIMA',
    labelPt: 'Volta por Cima',
    descriptionPt: 'Acertou depois de uma sequencia ruim',
    iconKey: 'badge-volta-por-cima',
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
