import type { Team } from '../types'

const TEAM_NAME_POOL = [
  'Atlético Norte',
  'Deportivo Sur',
  'Racing Costa',
  'Unión del Valle',
  'Sportivo Central',
  'Independiente Oeste',
  'Estudiantes del Río',
  'Defensores Unidos',
  'San Martín FC',
  'Belgrano Athletic',
  'Huracán del Este',
  'Lanús Capital',
  'Newells Reserva',
  'Talleres FC',
  'Colón Atlético',
  'Banfield Sur',
  'Gimnasia Norte',
  'Platense Unidos',
  'Argentinos Juniors',
  'Vélez Municipal',
  'Godoy Cruz FC',
  'Rosario Central B',
  'Instituto Athletic',
  'Belgrano Reserva',
  'Aldosivi Mar',
  'Sarmiento FC',
  'Tigre Capital',
  'Barracas Juniors',
  'Defensa y Justicia',
  'Central Córdoba',
  'Atlético Tucumán',
  'Unión Santa Fe',
  'Racing Interior',
  'River del Sur',
  'Boca del Norte',
  'Ferro Carril Oeste',
  'All Boys FC',
  'Chacarita Juniors',
  'Atlanta Athletic',
  'Temperley FC',
]

function toShortName(name: string, used: Set<string>): string {
  const letters = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()

  const words = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ''))
    .filter(Boolean)

  const candidates: string[] = []
  if (words.length >= 2) {
    candidates.push((words[0].slice(0, 1) + words[1].slice(0, 2)).toUpperCase())
    candidates.push(words.map((w) => w[0]).join('').slice(0, 3).toUpperCase())
  }
  candidates.push(letters.slice(0, 3))
  candidates.push(letters.slice(0, 4))

  for (const base of candidates) {
    if (base.length < 2) continue
    if (!used.has(base)) return base
    for (let i = 2; i <= 99; i += 1) {
      const suffix = String(i)
      const trimmed = base.slice(0, Math.max(2, 10 - suffix.length)) + suffix
      if (!used.has(trimmed)) return trimmed
    }
  }

  let n = 1
  while (used.has(`EQ${n}`)) n += 1
  return `EQ${n}`.slice(0, 10)
}

/** Builds unique random teams that do not collide with existing names/shortNames. */
export function buildRandomTeams(
  count: number,
  existing: Pick<Team, 'name' | 'shortName'>[],
): Array<{ name: string; shortName: string }> {
  if (count <= 0) return []

  const usedNames = new Set(existing.map((t) => t.name.trim().toLowerCase()))
  const usedShort = new Set(
    existing
      .map((t) => (t.shortName ?? '').trim().toUpperCase())
      .filter((s) => s.length >= 2),
  )

  const pool = [...TEAM_NAME_POOL]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const result: Array<{ name: string; shortName: string }> = []
  let poolIndex = 0
  let extra = 1

  while (result.length < count) {
    let name: string
    if (poolIndex < pool.length) {
      name = pool[poolIndex]
      poolIndex += 1
    } else {
      name = `Equipo Demo ${extra}`
      extra += 1
    }

    const key = name.toLowerCase()
    if (usedNames.has(key)) continue

    const shortName = toShortName(name, usedShort)
    usedNames.add(key)
    usedShort.add(shortName)
    result.push({ name, shortName })
  }

  return result
}
