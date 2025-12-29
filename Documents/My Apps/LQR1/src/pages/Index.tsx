import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { StatusBar } from "@/components/StatusBar";
import { SearchBar } from "@/components/SearchBar";
import { EmployeeCard } from "@/components/EmployeeCard";
import { AdminUpload } from "@/components/AdminUpload";
import { Footer } from "@/components/Footer";
import { QRScanner } from "@/components/QRScanner";
import { AuthModal } from "@/components/AuthModal";
import { Employee } from "@/types/employee";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [status, setStatus] = useState<'idle' | 'found' | 'not-found'>('idle');
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showResetAuth, setShowResetAuth] = useState(false);
  const { toast } = useToast();

  // Fetch employees from cloud
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('employee_name');

      if (error) throw error;

      setEmployees(data || []);
      setLastSync(new Date());
      setIsConnected(true);
      
      // Also store locally for offline access
      localStorage.setItem('employees', JSON.stringify(data || []));
    } catch (error) {
      console.error('Fetch error:', error);
      setIsConnected(false);
      
      // Fallback to local storage
      const localData = localStorage.getItem('employees');
      if (localData) {
        setEmployees(JSON.parse(localData));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Search employee
  const handleSearch = (query: string) => {
    const found = employees.find(
      emp => 
        emp.employee_id.toLowerCase() === query.toLowerCase() ||
        emp.card_number?.toLowerCase() === query.toLowerCase()
    );

    if (found) {
      setSelectedEmployee(found);
      setStatus('found');
      if (navigator.vibrate) navigator.vibrate(100);
    } else {
      setSelectedEmployee(null);
      setStatus('not-found');
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
  };

  // Handle QR scan
  const handleScan = (data: string) => {
    handleSearch(data);
  };

  // Upload employees
  const handleUpload = async (newEmployees: Employee[]) => {
    setIsUploading(true);
    try {
      // Delete existing employees
      await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert new employees
      const { error } = await supabase.from('employees').insert(
        newEmployees.map(emp => ({
          employee_id: emp.employee_id,
          employee_name: emp.employee_name,
          meal_type: emp.meal_type,
          company_name: emp.company_name,
          camp_allocation: emp.camp_allocation,
          access_card: emp.access_card,
          card_number: emp.card_number,
        }))
      );

      if (error) throw error;

      await fetchEmployees();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to sync with cloud. Data saved locally.",
        variant: "destructive",
      });
      // Store locally as fallback
      localStorage.setItem('employees', JSON.stringify(newEmployees));
      setEmployees(newEmployees);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset database
  const handleReset = async () => {
    try {
      await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      localStorage.removeItem('employees');
      setEmployees([]);
      setSelectedEmployee(null);
      setStatus('idle');
      setShowResetAuth(false);
      toast({ title: "Database Reset", description: "All employee records have been cleared." });
    } catch (error) {
      toast({ title: "Reset Failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isConnected={isConnected} employeeCount={employees.length} />
      
      <StatusBar
        employeeCount={employees.length}
        lastSync={lastSync}
        onReset={() => setShowResetAuth(true)}
        onRefresh={fetchEmployees}
        isLoading={isLoading}
      />

      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-6">
        <SearchBar
          onSearch={handleSearch}
          onScanClick={() => setShowScanner(true)}
          isLoading={isLoading}
        />

        <EmployeeCard employee={selectedEmployee} status={status} />

        <div className="flex-1" />

        <AdminUpload onUpload={handleUpload} isUploading={isUploading} />
      </main>

      <Footer />

      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />

      <AuthModal
        isOpen={showResetAuth}
        onClose={() => setShowResetAuth(false)}
        onSuccess={handleReset}
        title="Confirm Database Reset"
      />
    </div>
  );
};

export default Index;
