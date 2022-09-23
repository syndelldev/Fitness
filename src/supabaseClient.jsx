// import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
// const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)


import { createClient } from "@supabase/supabase-js";



export const supabase = createClient(
    "https://ffvsdsgnxuxijtcwboew.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdnNkc2dueHV4aWp0Y3dib2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTI0ODI5ODcsImV4cCI6MTk2ODA1ODk4N30.bxycBt4M6iQJn5PkLmZyGcVGwt-SWoVbKvibZJN-ixA"
)