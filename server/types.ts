import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends import("@shared/schema").User {}
    
    interface Request {
      isAuthenticated(): boolean;
      user?: User;
    }
  }
}

export {};
