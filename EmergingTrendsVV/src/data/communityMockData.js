export const currentUser = {
  id: 'u-you',
  name: 'You',
  handle: '@you',
  bio: 'Building a smarter digital wardrobe.',
  avatarColor: '#7fae9a',
  followers: 124,
  following: 58,
};

export const communityUsers = [
  {
    id: 'u-priya',
    name: 'Priya',
    handle: '@priya.styles',
    bio: 'Mixing travel comfort with elegant staples.',
    avatarColor: '#e6b28e',
    followers: 1834,
    following: 312,
  },
  {
    id: 'u-jenny',
    name: 'Jenny',
    handle: '@jenny.fit',
    bio: 'I share fresh weekend and spring outfit ideas.',
    avatarColor: '#c8a789',
    followers: 2408,
    following: 421,
  },
  {
    id: 'u-hamid',
    name: 'Hamid',
    handle: '@hamidlooks',
    bio: 'Street style with practical layering tips.',
    avatarColor: '#9c85ac',
    followers: 1290,
    following: 198,
  },
  {
    id: 'u-mark',
    name: 'Mark',
    handle: '@mark.menswear',
    bio: 'Clean menswear and capsule wardrobe edits.',
    avatarColor: '#7e9ac2',
    followers: 3210,
    following: 287,
  },
  {
    id: 'u-laura',
    name: 'Laura',
    handle: '@laura.trips',
    bio: 'Outfits for city breaks and mountain escapes.',
    avatarColor: '#d67bb2',
    followers: 2745,
    following: 345,
  },
  {
    id: 'u-steven',
    name: 'Steven',
    handle: '@steven.outfitlab',
    bio: 'Smart casual formulas for office and cafe days.',
    avatarColor: '#e2b38a',
    followers: 1986,
    following: 233,
  },
];

export const communityPosts = [
  {
    id: 'p-1',
    userId: 'u-priya',
    caption: 'Love this neutral outfit! Perfect for spring.',
    likes: 45,
    comments: 12,
    createdAt: '2h',
    category: 'Travel',
    mockImage: { background: '#d7e9ef', accents: ['#8f8a7a', '#cfa082', '#ece4d8', '#7f97aa'] },
  },
  {
    id: 'p-2',
    userId: 'u-jenny',
    caption: 'Bringing out my summer dresses.',
    likes: 36,
    comments: 15,
    createdAt: '3h',
    category: 'Casual',
    mockImage: { background: '#f2ebe3', accents: ['#d9a887', '#f6d6c9', '#c7d9e7', '#967f67'] },
  },
  {
    id: 'p-3',
    userId: 'u-hamid',
    caption: 'Layered fit for a breezy evening walk.',
    likes: 28,
    comments: 9,
    createdAt: '5h',
    category: 'Street',
    mockImage: { background: '#ece6df', accents: ['#8e7c68', '#b8a593', '#d6d5cf', '#5e6669'] },
  },
  {
    id: 'p-4',
    userId: 'u-mark',
    caption: 'Weekend city outfit with simple essentials.',
    likes: 40,
    comments: 11,
    createdAt: '7h',
    category: 'Weekend',
    mockImage: { background: '#e5ebee', accents: ['#768798', '#d9d9d6', '#5f6d71', '#c9baa8'] },
  },
  {
    id: 'p-5',
    userId: 'u-laura',
    caption: 'Mountain day look with light layers.',
    likes: 33,
    comments: 10,
    createdAt: '9h',
    category: 'Travel',
    mockImage: { background: '#dceaf2', accents: ['#8ca1b0', '#f2efe9', '#7291ad', '#99b9cf'] },
  },
  {
    id: 'p-6',
    userId: 'u-steven',
    caption: 'Office-ready smart casual combo.',
    likes: 52,
    comments: 19,
    createdAt: '11h',
    category: 'Work',
    mockImage: { background: '#e9e4dc', accents: ['#8d857a', '#c0b6a6', '#d9d7d2', '#6f7a80'] },
  },
];

export const initialFollowedUserIds = ['u-priya', 'u-jenny'];

export const initialCommentsByPost = {
  'p-1': [
    { id: 'c-1', author: 'Jenny', text: 'The palette is clean. I would wear this.', time: '1h' },
    { id: 'c-2', author: 'Mark', text: 'Great spring layering idea.', time: '46m' },
  ],
  'p-2': [
    { id: 'c-3', author: 'Priya', text: 'This is such a soft summer look.', time: '54m' },
  ],
  'p-3': [
    { id: 'c-4', author: 'Laura', text: 'That outer layer works really well.', time: '37m' },
  ],
  'p-4': [
    { id: 'c-5', author: 'Steven', text: 'Minimal and strong. Nice fit.', time: '31m' },
  ],
  'p-5': [
    { id: 'c-6', author: 'Hamid', text: 'Perfect for travel weather.', time: '25m' },
  ],
  'p-6': [
    { id: 'c-7', author: 'Priya', text: 'Smart casual done right.', time: '18m' },
  ],
};
