import { Injectable } from '@nestjs/common';

@Injectable()
export class ChampionshipService {
  getStatus(): { status: string } {
    return { status: 'pending-implementation' };
  }
}
