import { useEffect } from "react";
import { ProfileFavorites } from "../../widgets/profile-favorites/profile-favorites";
import { useInitialDataLoader } from "../../shared/hooks/useInitialDataLoader";
import { ProfileLayout } from "../../widgets/profile-layout/profile-layout";
import { useDispatch } from "../../services/store";
import { fetchUsers } from "../../services/user/actions";

export const FavoritesPage = () => {
  useInitialDataLoader();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 20 }));
  }, [dispatch]);

  return (
    <ProfileLayout>
      <ProfileFavorites />
    </ProfileLayout>
  );
};
