declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_DEFAULT_THEME: "light" | "dark";
    NEXT_PUBLIC_MAX_FILE_SIZE?: string;
  }
}
