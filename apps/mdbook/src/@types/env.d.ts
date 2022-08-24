declare global {
  interface ImportMeta {
    env: {
      NODE_ENV: 'development' | 'production'
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
    }
  }
}
