export class UserStats {
  [key: string]: any;
  realTimeWordProgress: number = 0;
  realTimeWpm: number = 0;
  netWpm: number = 0;
  hasFinished: boolean = false;
  timeFinished?: Date;
}
