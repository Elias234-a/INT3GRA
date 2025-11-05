/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_OPENAI_API_KEY?: string
  // Vite built-in env variables are already defined by vite/client
}
