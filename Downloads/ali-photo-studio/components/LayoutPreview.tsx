
import React, { useState, useRef, useEffect } from 'react';
import { PrintPage, PaperSettings } from '../types';
import { PIXELS_PER_MM } from '../constants';
import { PrintIcon, UploadIcon } from './Icons';

interface LayoutPreviewProps {
  pages: PrintPage[];
  paperSettings: PaperSettings;
}

const PrintStyles = () => (
    <style>
    {`
        @media print {
            body {
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            body * {
                visibility: hidden;
            }
            .print-area, .print-area * {
                visibility: visible;
            }
            .print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: auto;
                padding: 0;
                margin: 0;
                overflow: visible !important;
            }
            .print-page-container {
                display: block !important;
            }
            .print-page {
                width: 100% !important;
                height: 100vh !important;
                transform: none !important;
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                page-break-after: always;
                position: relative;
                overflow: hidden;
            }
            .print-page:last-child {
                page-break-after: auto;
            }
        }
        @page {
            size: auto;
            margin: 0mm;
        }
    `}
    </style>
);

const LayoutPreview: React.FC<LayoutPreviewProps> = ({ pages, paperSettings }) => {
  const { size, orientation } = paperSettings;
  const [isExporting, setIsExporting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const paperWidth = orientation === 'portrait' ? size.widthMm : size.heightMm;
  const paperHeight = orientation === 'portrait' ? size.heightMm : size.widthMm;

  const viewboxWidth = paperWidth * PIXELS_PER_MM;
  const viewboxHeight = paperHeight * PIXELS_PER_MM;
  
  const scale = 500 / viewboxWidth;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setExportMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrint = () => {
    setExportMenuOpen(false);
    window.print();
  };

  const handleSaveAsPdf = async () => {
    setIsExporting(true);
    setExportMenuOpen(false);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: paperSettings.orientation,
        unit: 'mm',
        format: [paperWidth, paperHeight]
    });
    
    const pageElements = document.querySelectorAll('.print-area .print-page');

    for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i] as HTMLElement;
        const canvas = await window.html2canvas(pageEl, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
            doc.addPage([paperWidth, paperHeight], paperSettings.orientation);
        }
        doc.addImage(imgData, 'PNG', 0, 0, paperWidth, paperHeight, undefined, 'FAST');
    }

    doc.save("ALI's Photo Studio Layout.pdf");
    setIsExporting(false);
  };

  const handleSaveAsImage = async (format: 'jpeg' | 'png') => {
    setIsExporting(true);
    setExportMenuOpen(false);
    
    const pagesContainer = document.querySelector('.print-page-container') as HTMLElement;
    if (!pagesContainer) {
        setIsExporting(false);
        return;
    };

    const canvas = await window.html2canvas(pagesContainer, { scale: 3, useCORS: true });
    const image = canvas.toDataURL(`image/${format}`, 1.0);

    const link = document.createElement('a');
    link.download = `ALI's Photo Studio Layout.${format}`;
    link.href = image;
    link.click();
    
    setIsExporting(false);
  };


  if (pages.length === 0) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-bkg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-content/30 mb-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            <h2 className="text-xl font-bold text-content/80">Print Layout Preview</h2>
            <p className="text-content/60 mt-2">Configure your paper and photos, then click "Generate Layout" to see the preview here.</p>
        </div>
    );
  }

  return (
    <div className="w-full h-full bg-bkg flex flex-col">
      <PrintStyles />
      <div className="p-4 flex justify-between items-center border-b border-border">
          <h2 className="text-lg font-bold">Preview ({pages.length} Pages)</h2>
          <div ref={exportMenuRef} className="relative">
            <button 
                onClick={() => setExportMenuOpen(prev => !prev)}
                disabled={isExporting}
                className="flex items-center space-x-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                <UploadIcon className="w-5 h-5"/>
                <span>{isExporting ? 'Saving...' : 'Export'}</span>
                <svg className={`w-4 h-4 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-secondary rounded-md shadow-lg border border-border z-20">
                    <ul className="py-1">
                        <li><button onClick={handlePrint} className="w-full text-left px-3 py-1.5 text-sm hover:bg-primary hover:text-white">Print...</button></li>
                        <div className="border-t border-border w-full my-1 opacity-50"></div>
                        <li><button onClick={handleSaveAsPdf} className="w-full text-left px-3 py-1.5 text-sm hover:bg-primary hover:text-white">Save as PDF</button></li>
                        <li><button onClick={() => handleSaveAsImage('png')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-primary hover:text-white">Save as PNG</button></li>
                        <li><button onClick={() => handleSaveAsImage('jpeg')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-primary hover:text-white">Save as JPG</button></li>
                    </ul>
                </div>
            )}
          </div>
      </div>
      <div className="flex-1 p-8 overflow-auto print-area">
        <div className="flex flex-col items-center space-y-8 print-page-container">
            {pages.map((page, pageIndex) => (
            <div
                key={pageIndex}
                className="print-page bg-white shadow-lg relative"
                style={{
                    width: `${viewboxWidth}px`,
                    height: `${viewboxHeight}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    marginBottom: `${viewboxHeight * (scale-1) * -1 + 32}px`
                }}
            >
                {page.photos.map(photo => (
                <img
                    crossOrigin="anonymous"
                    key={photo.id + Math.random()}
                    src={photo.previewUrl}
                    alt={photo.file.name}
                    className="absolute"
                    style={{
                        left: `${photo.x * PIXELS_PER_MM}px`,
                        top: `${photo.y * PIXELS_PER_MM}px`,
                        width: `${photo.printWidthMm * PIXELS_PER_MM}px`,
                        height: `${photo.printHeightMm * PIXELS_PER_MM}px`,
                    }}
                />
                ))}
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LayoutPreview;