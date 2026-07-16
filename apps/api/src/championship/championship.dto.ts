import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateChampionshipDto {
  @ApiProperty({ example: 'Copa FutbolYa' })
  @IsString()
  @Length(3, 120)
  name!: string;

  @ApiProperty({ example: '2026' })
  @IsString()
  @Length(2, 20)
  season!: string;

  @ApiProperty({ example: '2026-08-01' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate!: string;
}

export class UpdateChampionshipDto {
  @ApiPropertyOptional({ example: 'Copa FutbolYa Apertura' })
  @IsOptional()
  @IsString()
  @Length(3, 120)
  name?: string;

  @ApiPropertyOptional({ example: '2026-A' })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  season?: string;

  @ApiPropertyOptional({ example: '2026-08-15' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;
}

export class DrawDto {
  @ApiPropertyOptional({ example: 'seed-2026' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  seed?: string;
}

export class CreateTeamDto {
  @ApiProperty({ example: 'Boca Juniors' })
  @IsString()
  @Length(2, 80)
  name!: string;

  @ApiPropertyOptional({ example: 'BOC' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  shortName?: string;
}

export class UpdateTeamDto {
  @ApiPropertyOptional({ example: 'Boca Juniors A' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  name?: string;

  @ApiPropertyOptional({ example: 'BJA' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  shortName?: string;
}

export class CreatePlayerDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @Length(2, 80)
  firstName!: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  @Length(2, 80)
  lastName!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @Max(99)
  shirtNumber!: number;
}

export class UpdatePlayerDto {
  @ApiPropertyOptional({ example: 'Juan Manuel' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Perez' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  lastName?: string;

  @ApiPropertyOptional({ example: 11 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  shirtNumber?: number;
}

export class MatchResultDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  homeGoals!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  awayGoals!: number;
}

export class IdParamDto {
  @IsUUID()
  id!: string;
}

export class ChampionshipParamsDto {
  @IsUUID()
  championshipId!: string;
}

export class ChampionshipTeamParamsDto {
  @IsUUID()
  championshipId!: string;

  @IsUUID()
  teamId!: string;
}

export class ChampionshipGroupParamsDto {
  @IsUUID()
  championshipId!: string;

  @IsUUID()
  groupId!: string;
}
