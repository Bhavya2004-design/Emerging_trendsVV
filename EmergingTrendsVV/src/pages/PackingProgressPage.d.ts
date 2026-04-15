import type { ComponentType } from 'react';
import type { VaultItem } from '../types/vaultItem';

declare const PackingProgressPage: ComponentType<{
  onNavigate: (tabKey: string) => void;
  onTripReady?: () => void;
  selectedOutfits?: VaultItem[];
}>;

export default PackingProgressPage;
