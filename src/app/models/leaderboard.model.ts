import { Post } from './post.model';

export interface LeaderboardEntry {
  postId: string;
  score: number;
  post?: Post;  // Optional enriched post data
}

export interface Leaderboard {
  regionId: string;
  entries: LeaderboardEntry[];
}
