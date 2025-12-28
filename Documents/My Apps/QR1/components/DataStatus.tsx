
import React from 'react';

interface DataStatusProps {
  count: number;
  onClear: () => void;
}

export const DataStatus: React.FC<DataStatusProps> = ({ count, onClear }) => {
  return (
    <div className="flex items-center justify-between glass-card px-6 py-4 rounded-2xl border border-white/5">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${count > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">System Status</div>
          <div className="text-sm font-bold">
            {count > 0 ? `${count} Employees Loaded` : 'Offline / No Data'}
          </div>
        </div>
      </div>
      
      {count > 0 && (
        <button
          onClick={onClear}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-red-400 transition-colors"
        >
          Reset Database
        </button>
      )}
    </div>
  );
};
