/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIGMA_CLIENT_ID: string;
    readonly VITE_FIGMA_CLIENT_SECRET: string;
    readonly VITE_FIGMA_REDIRECT_URI: string;
    readonly FIGMA_CLIENT_ID: string;
    readonly FIGMA_CLIENT_SECRET: string;
    readonly FIGMA_REDIRECT_URI: string;
    readonly FRONTEND_URL: string;
    readonly SUPABASE_URL: string;
    readonly SUPABASE_ANON_KEY: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
