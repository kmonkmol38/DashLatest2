
export interface Employee {
  employeeId: string;
  employeeName: string;
  mealType: string;
  companyName: string;
  campAllocation: string;
  accessCard: string;
  cardNumber: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
