// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface User {
      id: number;
      github_id: string;
      github_username: string;
      github_email: string | null;
      github_access_token: string;
      avatar_url: string | null;
    }

    interface Locals {
      user: User | null;
    }

    interface PageData {
      user?: User;
      tenants?: any[];
    }

    // interface Error {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
