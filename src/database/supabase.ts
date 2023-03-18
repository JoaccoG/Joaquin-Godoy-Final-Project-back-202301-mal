import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

export const supabase = createClient(
  process.env.BUCKET_URL!,
  process.env.BUCKET_API_KEY!,
);

export const POSTS_BUCKET_NAME = 'posts';
