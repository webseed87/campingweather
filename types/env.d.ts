declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_KEY: string;
      EXPO_PUBLIC_CAMPING_API_KEY: string;
    }
  }
} 