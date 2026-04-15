/**
 * Closet / vault row (mock data, scans, and AI trip suggestions share this core shape).
 */
export type VaultItem = {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  isFavorite?: boolean;
  mockImage?: {
    background: string;
    accents: string[];
    layout: string;
  };
  /** Scan / AI pages may attach extra fields */
  [key: string]: unknown;
};
