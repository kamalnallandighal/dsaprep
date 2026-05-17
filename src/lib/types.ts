export type Rating = 'again' | 'good' | 'easy' | 'mastered';

export type Problem = {
  id: number;
  slug: string;
  title: string;
  leetcode_url: string;
  neetcode_url: string | null;
  topic: string;
  topic_order: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  source: 'neetcode150' | 'custom';
  created_by: string | null;
  created_at: string;
};

export type UserProblem = {
  id: number;
  user_id: string;
  problem_id: number;
  stage: number;
  status: 'learning' | 'graduated' | 'suspended';
  next_due_date: string;
  last_reviewed: string | null;
  first_solved_at: string;
  added_at: string;
  notes: string | null;
  graduation_source: 'natural' | 'mastered' | null;
};

export type Stats = {
  solved: number;
  tracking: number;
  graduated: number;
  streak: { current: number; longest: number };
};
