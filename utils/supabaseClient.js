import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ndpiexhqqypsfgofzkks.supabase.co";
const supabaseAnonKey = "sb_publishable_fz6cWZZSoziyq9ZBinPwSg_qcZawAaT";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;