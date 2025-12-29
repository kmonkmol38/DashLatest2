import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Upload, FileSpreadsheet, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { useToast } from "@/hooks/use-toast";
import { read, utils } from "xlsx";
import { Employee, ExcelRow } from "@/types/employee";

interface AdminUploadProps {
  onUpload: (employees: Employee[]) => Promise<void>;
  isUploading: boolean;
}

export const AdminUpload = ({ onUpload, isUploading }: AdminUploadProps) => {
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUploadClick = () => {
    if (isAuthenticated) {
      fileInputRef.current?.click();
    } else {
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    // Trigger file input after auth
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const parseExcel = async (file: File): Promise<Employee[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: ExcelRow[] = utils.sheet_to_json(worksheet);

          const employees: Employee[] = jsonData.map((row) => ({
            employee_id: String(row.Empoyee_ID || "").trim(),
            employee_name: String(row.Employee_Name || "").trim(),
            meal_type: row.Meal_Type ? String(row.Meal_Type).trim() : null,
            company_name: row.Company_Name ? String(row.Company_Name).trim() : null,
            camp_allocation: row.Camp_Allocation ? String(row.Camp_Allocation).trim() : null,
            access_card: row.Access_Card ? String(row.Access_Card).trim() : null,
            card_number: row.Card_Number ? String(row.Card_Number).trim() : null,
          })).filter(emp => emp.employee_id && emp.employee_name);

          resolve(employees);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls'
    ];
    
    if (!validTypes.some(type => file.type === type || file.name.endsWith(type))) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    try {
      const employees = await parseExcel(file);
      
      if (employees.length === 0) {
        toast({
          title: "No Data Found",
          description: "The Excel file appears to be empty or has incorrect headers.",
          variant: "destructive",
        });
        return;
      }

      await onUpload(employees);
      setUploadSuccess(true);
      
      toast({
        title: "Upload Successful",
        description: `${employees.length} employee records have been uploaded.`,
      });

      // Reset success state after animation
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Excel parse error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to parse the Excel file. Please check the format.",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="glass-card mx-4 p-6 mt-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-bold tracking-wide">Master Database Control</h3>
            <p className="text-xs text-muted-foreground">Admin access required</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          variant="secondary"
          className="w-full relative overflow-hidden"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : uploadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2 text-neon-emerald" />
              Upload Complete
            </>
          ) : (
            <>
              {isAuthenticated ? (
                <Upload className="w-4 h-4 mr-2" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {isAuthenticated ? "Upload Excel File" : "Unlock & Upload"}
            </>
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Expected headers: Empoyee_ID, Employee_Name, Meal_Type, Company_Name, Camp_Allocation, Access_Card, Card_Number
        </p>
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
        title="Database Upload Authorization"
      />
    </>
  );
};
