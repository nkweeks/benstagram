export const USERS = [
  {
    id: 'ben',
    username: 'the_ben_official',
    fullName: 'General Ben',
    avatar: '/ben-avatar-general.jpeg',
    bio: 'Great Dane. General of the Army. Good Boy. 🦴',
    followers: 12500,
    following: 1,
    posts: 42,
    savedPostIds: [] // Array of post IDs that the user has saved
  },
  {
    id: 'user1',
    username: 'ben_admirer',
    fullName: 'Ben Fan Club',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ben1',
    bio: 'At ease, soldier!',
    followers: 800,
    following: 50,
    posts: 12
  },
  {
    id: 'user2',
    username: 'not_ben',
    fullName: 'Definitely Not Ben',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noben',
    bio: 'I wish I was a General.',
    followers: 300,
    following: 120,
    posts: 5
  }
];

export const POSTS = [
  {
    id: 'post_dancing',
    userId: 'ben',
    imageUrl: '/dogs-dancing.jpg', // User will provide this image
    caption: 'Dancing is the best! 🕺🐕 #DancingDogs #GoodVibes',
    likes: 5000,
    isLiked: true,
    timestamp: '15 mins ago',
    comments: [
        {
            id: 'c_dance1',
            userId: 'user1',
            username: 'ben_admirer',
            text: 'Look at those moves! 💃',
            timestamp: '5m ago'
        }
    ]
  },
  {
    id: 'post1',
    userId: 'ben',
    imageUrl: '/ben-post-general-1.jpeg',
    caption: 'Leading the troops (to the treat jar). #GeneralBen',
    likes: 1240,
    isLiked: false,
    timestamp: '2 hours ago',
    comments: [
      {
        id: 'c1',
        userId: 'user1',
        username: 'ben_admirer',
        text: 'Sir, yes sir! 🫡',
        timestamp: '2h ago'
      },
      {
        id: 'c2',
        userId: 'user2',
        username: 'not_ben',
        text: 'So regal.',
        timestamp: '1h ago'
      }
    ]
  },
  {
    id: 'post2',
    userId: 'ben',
    imageUrl: '/ben-post-general-2.jpeg',
    caption: 'Pondering the strategy for the next nap.',
    likes: 856,
    isLiked: true,
    timestamp: '1 day ago',
    comments: []
  },
  {
    id: 'post3',
    userId: 'user1',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop',
    caption: 'Spotted a... thing... in the wild.',
    likes: 45,
    isLiked: false,
    timestamp: '2 days ago',
    comments: [
      {
        id: 'c3',
        userId: 'ben',
        username: 'the_ben_official',
        text: 'Ew. What is that? A rat? Get it away from my feed. 🤢',
        timestamp: '5m ago'
      }
    ]
  }
];

export const CURRENT_USER_ID = 'ben';
