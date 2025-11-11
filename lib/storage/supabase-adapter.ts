import { createClient } from "@supabase/supabase-js";
import { StorageAdapter } from ".";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdapter : StorageAdapter = {
    async uploadFile(bucket, path, file) {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file);
        if (error) {
            throw new Error(`Error uploading file: ${error.message}`);
        }
        return data.path;
    },

    async getFileUrl(bucket, path) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        if (!data || !data.publicUrl) {
            throw new Error(`Error getting file URL for path: ${path}`);
        }
        return data.publicUrl;
    },
};