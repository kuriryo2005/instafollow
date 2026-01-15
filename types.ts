
export interface TimerState {
  secondsRemaining: number;
  isActive: boolean;
  isLocked: boolean;
  targetAccount: string;
}

export enum AppView {
  SETUP = 'SETUP',
  COUNTDOWN = 'COUNTDOWN',
  LOCKED = 'LOCKED',
  COMPLETE = 'COMPLETE'
}
