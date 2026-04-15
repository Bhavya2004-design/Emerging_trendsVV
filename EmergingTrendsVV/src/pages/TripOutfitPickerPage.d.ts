import type { ComponentType } from 'react';
import type { VaultItem } from '../types/vaultItem';

declare const TripOutfitPickerPage: ComponentType<{
  items?: VaultItem[];
  onNavigate: (tabKey: string) => void;
  onGoBack: () => void;
  onContinuePacking: (selectedIds: Record<string, boolean>) => void;
  onOpenAiSuggestions?: () => void;
}>;

export default TripOutfitPickerPage;
