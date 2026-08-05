import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://myyjxzaadyirhmjcrnhh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eWp4emFhZHlpcmhtamNybmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTYzNDIsImV4cCI6MjEwMTE3MjM0Mn0.ng0_9njjHeRH-GOT8MvCx5cxlKpgdfnGr-3nz9RyVBM";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);