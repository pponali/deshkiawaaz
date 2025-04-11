export interface Post {
  id: string;
  userId: string;
  regionId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
}