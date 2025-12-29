export interface Employee {
  id?: string;
  employee_id: string;
  employee_name: string;
  meal_type: string | null;
  company_name: string | null;
  camp_allocation: string | null;
  access_card: string | null;
  card_number: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExcelRow {
  Empoyee_ID?: string;
  Employee_Name?: string;
  Meal_Type?: string;
  Company_Name?: string;
  Camp_Allocation?: string;
  Access_Card?: string;
  Card_Number?: string;
}
