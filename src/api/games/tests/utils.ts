import { mockedPosts } from '../../posts/tests/utils';

export const mockedGames = [
  {
    _id: 1,
    name: 'game1',
    banner: 'banner1',
    description: 'description1',
    tags: ['tag1', 'tag2', 'tag3'],
    mode: 'singleplayer',
    studio: 'studio1',
    launch: new Date(2021, 1, 1),
    rating: 3,
    posts: [mockedPosts[0]],
  },
  {
    _id: 2,
    name: 'game2',
    banner: 'banner2',
    description: 'description2',
    tags: ['tag1', 'tag2', 'tag3'],
    mode: 'multiplayer',
    studio: 'studio2',
    launch: new Date(2022, 2, 2),
    rating: 4,
    posts: [],
  },
];
