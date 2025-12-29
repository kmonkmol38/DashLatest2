import { Employee } from "@/types/employee";
import { User, Building2, MapPin, CreditCard, Utensils, IdCard, Check, X } from "lucide-react";

interface EmployeeCardProps {
  employee: Employee | null;
  status: 'idle' | 'found' | 'not-found';
}

export const EmployeeCard = ({ employee, status }: EmployeeCardProps) => {
  if (status === 'idle') {
    return (
      <div className="glass-card p-8 mx-4 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-muted-foreground">No Employee Selected</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Scan a QR code or search by ID to view employee details
        </p>
      </div>
    );
  }

  if (status === 'not-found') {
    return (
      <div className="glass-card p-8 mx-4 text-center border-destructive/30 animate-fade-in-up">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
          <X className="w-10 h-10 text-destructive" />
        </div>
        <h3 className="text-lg font-bold text-destructive">Employee Not Found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          No matching record found. Please verify the ID and try again.
        </p>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="mx-4 animate-fade-in-up">
      {/* Glow Background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 via-neon-purple/10 to-neon-pink/20 rounded-3xl blur-xl" />
        
        <div className="relative glass-card overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-neon-emerald/20 to-transparent px-6 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-neon-emerald flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-neon-emerald tracking-wide">EMPLOYEE VERIFIED</span>
            </div>
          </div>

          {/* Employee Info */}
          <div className="p-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon-cyan">
                  <span className="text-2xl font-black text-primary-foreground">
                    {employee.employee_name?.charAt(0) || 'E'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-emerald rounded-full flex items-center justify-center border-2 border-card">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black tracking-tight">{employee.employee_name}</h2>
                <p className="text-sm text-muted-foreground font-mono">ID: {employee.employee_id}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <DetailItem
                icon={<Utensils className="w-4 h-4" />}
                label="Meal Type"
                value={employee.meal_type}
              />
              <DetailItem
                icon={<Building2 className="w-4 h-4" />}
                label="Company"
                value={employee.company_name}
              />
              <DetailItem
                icon={<MapPin className="w-4 h-4" />}
                label="Camp"
                value={employee.camp_allocation}
              />
              <DetailItem
                icon={<CreditCard className="w-4 h-4" />}
                label="Access Card"
                value={employee.access_card}
              />
            </div>

            {/* Card Number */}
            {employee.card_number && (
              <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <IdCard className="w-4 h-4" />
                  <span className="text-xs font-medium tracking-wide uppercase">Card Number</span>
                </div>
                <p className="font-mono text-lg font-bold tracking-widest text-neon-cyan">
                  {employee.card_number}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}

const DetailItem = ({ icon, label, value }: DetailItemProps) => (
  <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      {icon}
      <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
    </div>
    <p className="font-semibold truncate">{value || '-'}</p>
  </div>
);
