import { UserStats } from '../models/userStats';

export interface IRoomUserStats {
  [userId: string]: UserStats;
}
