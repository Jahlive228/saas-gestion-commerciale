
import { User } from "@/models/auth";

export interface GetUserResponse {
  status: string;
  code: number;
  message: string;
  content: User;
}

// Types pour les formulaires
export interface UpdateUserRequest {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Types pour les résultats d'actions
export type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string };
