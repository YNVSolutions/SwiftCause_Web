// Supabase project configuration
// In production, these should be set via environment variables

// Helper function to get environment variables safely
function getEnvVar(key: string, fallback: string = ''): string {
  // Try to get from process.env if available (Vite/webpack environments)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // Try to get from import.meta.env if available (Vite)
  if (typeof window !== 'undefined' && (window as any).ENV && (window as any).ENV[key]) {
    return (window as any).ENV[key];
  }
  
  // Return fallback value
  return fallback;
}

// These can be safely exposed in the frontend as they are public keys
export const projectId = getEnvVar('VITE_SUPABASE_PROJECT_ID', 'your-project-id');
export const publicAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'your-anon-key');
export const supabaseUrl = 'https://' + projectId + '.supabase.co';

// For development/demo purposes, you can temporarily hardcode these values:
// export const projectId = 'your-actual-project-id';
// export const publicAnonKey = 'your-actual-anon-key';

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return projectId !== 'your-project-id' && publicAnonKey !== 'your-anon-key';
};

// Log configuration status
if (!isSupabaseConfigured()) {
  console.warn('⚠️ Supabase configuration not set. Using demo mode with mock data.');
  console.log('To connect to Supabase:');
  console.log('1. Replace the hardcoded values in /utils/supabase/info.tsx');
  console.log('2. Or set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY environment variables');
} else {
  console.log('✅ Supabase configuration detected');
}