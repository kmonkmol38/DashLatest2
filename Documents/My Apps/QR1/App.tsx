
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { FileUploader } from './components/FileUploader';
import { QRScanner } from './components/QRScanner';
import { EmployeeCard } from './components/EmployeeCard';
import { ManualSearch } from './components/ManualSearch';
import { DataStatus } from './components/DataStatus';
import { Employee, AppStatus } from './types';
import { STORAGE_KEY } from './constants';

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEmployees(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored data', e);
      }
    }
  }, []);

  const handleDataLoaded = (data: Employee[]) => {
    setEmployees(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setStatus(AppStatus.IDLE);
    setErrorMsg('');
    setCurrentEmployee(null);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all employee data?')) {
      setEmployees([]);
      localStorage.removeItem(STORAGE_KEY);
      setCurrentEmployee(null);
      setStatus(AppStatus.IDLE);
    }
  };

  const lookupEmployee = useCallback((query: string) => {
    if (employees.length === 0) {
      setErrorMsg('No Excel data uploaded. Please upload an Excel file first.');
      setStatus(AppStatus.ERROR);
      return;
    }

    const trimmedQuery = query.trim();
    // Search by both Card_Number and Employee_ID as requested
    const found = employees.find(emp => 
      emp.cardNumber.toString().trim() === trimmedQuery || 
      emp.employeeId.toString().trim() === trimmedQuery
    );
    
    if (found) {
      setCurrentEmployee(found);
      setStatus(AppStatus.RESULT);
      setErrorMsg('');
    } else {
      setErrorMsg(`"${trimmedQuery}" not found as an Employee ID or Card Number.`);
      setStatus(AppStatus.ERROR);
      setCurrentEmployee(null);
    }
  }, [employees]);

  const toggleScanner = () => {
    if (status === AppStatus.SCANNING) {
      setStatus(AppStatus.IDLE);
    } else {
      setStatus(AppStatus.SCANNING);
      setCurrentEmployee(null);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-24">
        
        <div className="space-y-4">
          <DataStatus 
            count={employees.length} 
            onClear={handleClearData} 
          />
          
          {employees.length === 0 && (
            <div className="glass-card rounded-3xl p-10 border-dashed border-2 border-cyan-500/30 text-center animate-pulse">
              <p className="text-zinc-400 mb-6 font-light">Import the Master Employee Excel Sheet to begin</p>
              <FileUploader onDataLoaded={handleDataLoaded} />
            </div>
          )}
        </div>

        {employees.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <button
                onClick={toggleScanner}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 ${
                  status === AppStatus.SCANNING 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                }`}
              >
                {status === AppStatus.SCANNING ? (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    Close Scanner
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                    Scan QR
                  </>
                )}
              </button>
              
              <div className="flex-[1.5]">
                <ManualSearch onSearch={lookupEmployee} />
              </div>
            </div>

            {status === AppStatus.ERROR && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-center font-medium animate-in fade-in slide-in-from-top-2">
                {errorMsg}
              </div>
            )}

            {status === AppStatus.SCANNING && (
              <div className="glass-card rounded-3xl p-4 overflow-hidden border-2 border-cyan-500/20">
                <QRScanner 
                  onScanSuccess={(id) => {
                    lookupEmployee(id);
                  }}
                  onScanError={(err) => {
                    // Ignored
                  }}
                />
              </div>
            )}

            {status === AppStatus.RESULT && currentEmployee && (
              <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                <EmployeeCard employee={currentEmployee} />
              </div>
            )}
            
            <div className="pt-10 border-t border-zinc-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em]">Database Options</h3>
              <FileUploader onDataLoaded={handleDataLoaded} label="Update Database" />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
