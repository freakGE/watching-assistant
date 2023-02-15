declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      NEXTAUTH_URL: string;
      JWT_SECRET: string;
      GITHUB_ID: string;
      GITHUB_SECRET: string;
      MONGODB_URI: string;
      MONGODB_DB: string;
      OMDB_API: string;
      TMDB_API: string;
      NODE_ENV: "development" | "production";
      PORT?: string;
      PWD: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
