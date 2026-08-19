import type { IUserProfile } from "../../utils/types.ts";

export interface AuthState {
  currentUser: IUserProfile | null;
  loading: boolean;
  error: string | null;
  checkUserLoading: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkUserError: any | null;
}
