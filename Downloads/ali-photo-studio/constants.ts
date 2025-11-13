
import { PaperSize } from './types';

export const PAPER_SIZES: PaperSize[] = [
  { name: 'A4', widthMm: 210, heightMm: 297 },
  { name: 'A3', widthMm: 297, heightMm: 420 },
  { name: 'A5', widthMm: 148, heightMm: 210 },
  { name: 'Letter', widthMm: 215.9, heightMm: 279.4 },
  { name: 'Legal', widthMm: 215.9, heightMm: 355.6 },
];

export const PIXELS_PER_MM = 3.7795275591; // Assuming 96 DPI
