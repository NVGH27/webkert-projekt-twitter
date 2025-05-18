export interface Tweet {
  id: string;
  content: string;
  timestamp: Date;
  likes: number;
  likedBy: string[];
  authorId: string;
  comments?: Comment[];
}