export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface CreateUserInput {
  username: string;
  password_hash: string;
}

export interface UserSafe {
  id: number;
  username: string;
  created_at: string;
}
