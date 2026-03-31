export const vaultTabs = [
  { key: 'all', label: 'All' },
  { key: 'travel', label: 'Travel Outfit' },
  { key: 'favorites', label: 'Favourites Outfit' },
  { key: 'work', label: 'Work Outfits' },
];

export const mockVaultItems = [
  {
    id: 'airport-comfort-set',
    title: 'Airport Comfort Set',
    subtitle: 'Travel, Casual',
    category: 'travel',
    isFavorite: false,
    mockImage: {
      background: '#d9ecef',
      accents: ['#b4876a', '#efe8df', '#8f8b7a', '#c6d1dd'],
      layout: 'travel-kit',
    },
  },
  {
    id: 'weekend-carry-on-look',
    title: 'Weekend Carry-On Look',
    subtitle: 'Travel, Spring',
    category: 'travel',
    isFavorite: false,
    mockImage: {
      background: '#ecd9d4',
      accents: ['#8d542d', '#eecac8', '#b7d0de', '#6d4839'],
      layout: 'carry-on',
    },
  },
  {
    id: 'city-tour-denim-fit',
    title: 'City Tour Denim Fit',
    subtitle: 'Travel, Day Out',
    category: 'travel',
    isFavorite: true,
    mockImage: {
      background: '#ead9bf',
      accents: ['#bf9866', '#d9b88a', '#876046', '#f4e9d3'],
      layout: 'city-tour',
    },
  },
  {
    id: 'resort-transit-fit',
    title: 'Resort Transit Fit',
    subtitle: 'Travel, Light Layers',
    category: 'travel',
    isFavorite: true,
    mockImage: {
      background: '#e8e2d7',
      accents: ['#b8d0dc', '#69876a', '#f0ede5', '#9d856d'],
      layout: 'resort',
    },
  },
  {
    id: 'light-packing-fit',
    title: 'Light Packing Fit',
    subtitle: 'Travel, Minimal',
    category: 'travel',
    isFavorite: false,
    mockImage: {
      background: '#d9dde3',
      accents: ['#756254', '#f1ece4', '#a3b6cb', '#cfb49a'],
      layout: 'minimal-pack',
    },
  },
  {
    id: 'holiday-denim-combo',
    title: 'Holiday Denim Combo',
    subtitle: 'Travel, Weekend',
    category: 'travel',
    isFavorite: false,
    mockImage: {
      background: '#d4c2b0',
      accents: ['#876b50', '#f1f1ec', '#8ea7c2', '#d9cabb'],
      layout: 'denim-combo',
    },
  },
  {
    id: 'monday-blazer-set',
    title: 'Monday Blazer Set',
    subtitle: 'Work, Layered',
    category: 'work',
    isFavorite: false,
    mockImage: {
      background: '#d7ccbb',
      accents: ['#7a6248', '#75824d', '#d9b78f', '#f0eee8'],
      layout: 'blazer-set',
    },
  },
  {
    id: 'executive-black-pairing',
    title: 'Executive Black Pairing',
    subtitle: 'Work, Formal',
    category: 'work',
    isFavorite: false,
    mockImage: {
      background: '#f2eee8',
      accents: ['#f9f6f2', '#212226', '#2f3038', '#6d645e'],
      layout: 'executive',
    },
  },
  {
    id: 'boardroom-neutral-fit',
    title: 'Boardroom Neutral Fit',
    subtitle: 'Work, Professional',
    category: 'work',
    isFavorite: false,
    mockImage: {
      background: '#f2d6d2',
      accents: ['#e8ada4', '#f8ede5', '#f1b2b1', '#b96b6e'],
      layout: 'boardroom',
    },
  },
  {
    id: 'desk-day-classic',
    title: 'Desk Day Classic',
    subtitle: 'Work, Smart Casual',
    category: 'work',
    isFavorite: true,
    mockImage: {
      background: '#eef0ea',
      accents: ['#bccce0', '#f4f2ea', '#d9cdb5', '#ece5d8'],
      layout: 'desk-day',
    },
  },
  {
    id: 'office-capsule-fit',
    title: 'Office Capsule Fit',
    subtitle: 'Work, Clean Lines',
    category: 'work',
    isFavorite: true,
    mockImage: {
      background: '#f4ebde',
      accents: ['#d7a14c', '#f6f2ea', '#d6c1a7', '#8b6335'],
      layout: 'capsule',
    },
  },
  {
    id: 'conference-ready-look',
    title: 'Conference Ready Look',
    subtitle: 'Work, Elevated',
    category: 'work',
    isFavorite: true,
    mockImage: {
      background: '#f2f0ea',
      accents: ['#f9f7f2', '#e8dcc7', '#d0bba8', '#b89f8d'],
      layout: 'conference',
    },
  },
];

export async function getVaultItems() {
  return Promise.resolve(mockVaultItems);
}
