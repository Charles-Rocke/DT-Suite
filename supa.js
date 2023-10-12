// supa.js
import { createClient } from "@supabase/supabase-js";

// Create Supabase client
const supabaseKey = process.env.SUPABASE_KEY;
const supaProjectURL = "https://enssmnohepficaxcmyjb.supabase.co";
const supabase = createClient(supaProjectURL, supabaseKey);

// Upload file using standard upload
async function uploadFile(file) {
  const { data, error } = await supabase.storage
    .from("bucket_name")
    .upload("file_path", file);
  if (error) {
    // Handle error
  } else {
    // Handle success
  }
}

export { uploadFile };
