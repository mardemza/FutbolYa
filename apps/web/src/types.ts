export type ChampionshipStatus =
  | 'draft'
  | 'registration-closed'
  | 'drawn'
  | 'in-progress'
  | 'finished'

export type Championship = {
  id: string
  name: string
  season: string
  startDate: string
  status: ChampionshipStatus | string
  maxTeams: number
  registeredTeams: number
  ownerId?: string | null
}

export type Team = {
  id: string
  name: string
  shortName: string | null
}

export type Player = {
  id: string
  firstName: string
  lastName: string
  shirtNumber: number
}

export type Group = {
  id: string
  name: string
  teams: Team[]
}

export type Match = {
  id: string
  stageType: 'group' | 'knockout'
  roundName: string | null
  groupId: string | null
  matchday: number | null
  homeTeamId: string
  awayTeamId: string
  homeGoals: number | null
  awayGoals: number | null
  status: 'scheduled' | 'played'
}

export type Standing = {
  teamId: string
  position: number
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export type RecentChampionship = {
  id: string
  name: string
  season: string
  status: string
  registeredTeams: number
  maxTeams: number
  updatedAt: string
}
