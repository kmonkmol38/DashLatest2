
// Fix: Add a global declaration for the 'fabric' object, which is loaded from a CDN.
// This makes the fabric types available throughout the application and resolves namespace errors.
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }

  // FIX: Replaced 'const fabric: any' with a 'namespace' declaration to provide proper type information
  // for the fabric.js library, resolving "Cannot find namespace 'fabric'" errors and subsequent property access errors.
  namespace fabric {
    class Object {
      left?: number;
      top?: number;
      width?: number;
      height?: number;
      scaleX?: number;
      scaleY?: number;
      fill?: string | Pattern | Gradient;
      stroke?: string;
      strokeWidth?: number;
      selectable?: boolean;
      evented?: boolean;
      type?: string;
      filters: any[];
      [key: string]: any; // Allow other properties

      set(options: any): this;
      sendToBack(): this;
      applyFilters(): void;
      // FIX: Added getBoundingRect to the fabric.Object type definition for use in robust crop calculations.
      getBoundingRect(): { left: number; top: number; width: number; height: number; };
    }

    class Pattern {}
    class Gradient {}

    class Canvas {
      constructor(el: HTMLCanvasElement | string | null, options?: any);
      add(...object: Object[]): this;
      remove(...object: Object[]): this;
      getObjects(): Object[];
      getActiveObject(): Object | null;
      getActiveObjects(): Object[];
      clear(): this;
      setWidth(width: number): this;
      setHeight(height: number): this;
      renderAll(): this;
      getPointer(e: Event): { x: number; y: number };
      setActiveObject(object: Object, e?: Event): this;
      discardActiveObject(e?: Event): this;
      centerObject(object: Object): this;
      on(event: string, handler: (e: IEvent) => void): this;
      // FIX: Corrected the 'off' method signature to accept optional event name and handler arguments,
      // allowing for specific event listener removal and fixing incorrect argument count errors.
      off(event?: string, handler?: (e: IEvent) => void): this;
      dispose(): this;
      isDrawingMode: boolean;
      selection: boolean;
      // FIX: Added `globalCompositeOperation` to the `freeDrawingBrush` type to support eraser functionality and resolve property access errors.
      freeDrawingBrush: { color: string; width: number; globalCompositeOperation?: string; };
      onPathCreated: (path: Path) => void;
      // FIX: Added the 'forEachObject' method to the fabric.Canvas type definition to resolve the "property does not exist" error.
      forEachObject(callback: (obj: Object) => void, context?: any): this;
      // FIX: Added missing method definitions (`toJSON`, `loadFromJSON`, `toDataURL`) to the `fabric.Canvas` type to support history management and cropping functionalities, resolving "property does not exist" errors.
      toJSON(propertiesToInclude?: string[]): any;
      loadFromJSON(json: string | object, callback: () => void): this;
      toDataURL(options?: any): string;
    }

    class Image extends Object {
      static fromURL(url: string, callback: (img: Image) => void, options?: any): void;
    }

    namespace Image {
      namespace filters {
        class Brightness {
          constructor(options?: { brightness: number });
        }
        class Contrast {
          constructor(options?: { contrast: number });
        }
        class Saturation {
          constructor(options?: { saturation: number });
        }
      }
    }

    interface IEvent {
      target?: Object;
      e: Event;
    }

    class IText extends Object {
      constructor(text: string, options?: any);
      enterEditing(): void;
    }

    class Rect extends Object {
      constructor(options?: any);
    }

    class Path extends Object {}
  }
}

export interface Photo {
  id: string;
  file: File;
  previewUrl: string;
  printWidthMm: number;
  printHeightMm: number;
  quantity: number;
}

export interface PaperSize {
  name: string;
  widthMm: number;
  heightMm: number;
}

export interface PaperSettings {
  size: PaperSize;
  orientation: 'portrait' | 'landscape';
  marginMm: number;
}

export interface PlacedPhoto extends Photo {
  x: number; // position in mm
  y: number; // position in mm
}

export interface PrintPage {
  photos: PlacedPhoto[];
}

// Editor-specific types
// FIX: Centralized the CustomFabricObject interface to ensure type consistency across components.
export interface CustomFabricObject extends fabric.Object {
  id: string;
}
export interface Properties {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    // FIX: Added scaleX and scaleY to the Properties interface to allow updating object scaling from the properties panel, resolving "Object literal may only specify known properties" errors.
    scaleX?: number;
    scaleY?: number;
    fill?: string | fabric.Pattern | fabric.Gradient;
    stroke?: string;
    strokeWidth?: number;
}

export interface Adjustments {
    brightness: number;
    contrast: number;
    saturation: number;
}