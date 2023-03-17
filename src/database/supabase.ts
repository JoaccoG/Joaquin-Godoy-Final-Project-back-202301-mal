import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const bucketURL = process.env.BUCKET_URL ?? '';
const bucketKey = process.env.BUCKET_API_KEY ?? '';

export const supabase = createClient(bucketURL, bucketKey);

export const PROFILE_BUCKET_NAME = 'posts';
