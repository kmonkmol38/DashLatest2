import React, { useState, useRef, useEffect } from 'react';
import { UndoIcon, RedoIcon } from './Icons';

interface TopMenuBarProps {
    onOpenImage: (url: string) => void;
    onAddImageLayer: () => void;
    onNewCanvas: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const MenuItem: React.FC<{ onClick?: () => void; disabled?: boolean; children: React.ReactNode; icon?: React.ReactNode }> = ({ onClick, disabled, children, icon }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-primary hover:text-white flex items-center justify-between disabled:bg-transparent disabled:text-content/40 disabled:cursor-not-allowed"
    >
        <span>{children}</span>
        {icon && <span className="text-content/50">{icon}</span>}
    </button>
);


const TopMenuBar: React.FC<TopMenuBarProps> = ({ onOpenImage, onAddImageLayer, onNewCanvas, onUndo, onRedo, canUndo, canRedo }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    onOpenImage(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
        if (event.target) {
            event.target.value = ''; // Reset input
        }
        setOpenMenu(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={menuRef} className="bg-secondary border-b border-border px-2 flex items-center h-10 relative z-10">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleOpenImageFileChange} className="hidden" />
            
            {/* File Menu */}
            <div className="relative">
                <button onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')} className="px-3 py-1 text-sm rounded hover:bg-bkg">File</button>
                {openMenu === 'file' && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-secondary border border-border rounded-md shadow-lg py-1">
                        <MenuItem onClick={onNewCanvas}>New...</MenuItem>
                        <div className="border-t border-border w-full my-1 opacity-50"></div>
                        <MenuItem onClick={() => fileInputRef.current?.click()}>Open Image...</MenuItem>
                        <MenuItem onClick={() => { onAddImageLayer(); setOpenMenu(null); }}>Add as Layer...</MenuItem>
                    </div>
                )}
            </div>

            {/* Edit Menu */}
            <div className="relative">
                <button onClick={() => setOpenMenu(openMenu === 'edit' ? null : 'edit')} className="px-3 py-1 text-sm rounded hover:bg-bkg">Edit</button>
                {openMenu === 'edit' && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-secondary border border-border rounded-md shadow-lg py-1">
                        <MenuItem onClick={onUndo} disabled={!canUndo} icon={<UndoIcon className="w-4 h-4" />}>Undo</MenuItem>
                        <MenuItem onClick={onRedo} disabled={!canRedo} icon={<RedoIcon className="w-4 h-4" />}>Redo</MenuItem>
                    </div>
                )}
            </div>

             {/* Image Menu */}
            <div className="relative">
                <button onClick={() => setOpenMenu(openMenu === 'image' ? null : 'image')} className="px-3 py-1 text-sm rounded hover:bg-bkg">Image</button>
                {openMenu === 'image' && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-secondary border border-border rounded-md shadow-lg py-1">
                        <span className="block w-full text-left px-3 py-1.5 text-sm text-content/50">Adjustments</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopMenuBar;