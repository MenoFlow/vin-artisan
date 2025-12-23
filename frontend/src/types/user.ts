
export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: "admin" | "client";
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}
