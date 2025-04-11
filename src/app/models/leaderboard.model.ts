interface LeaderboardEntry {
  postId: string;
  score: number;
}

interface Leaderboard {
  regionId: string;
  entries: LeaderboardEntry[];
}