import { useEffect } from "react";
import { ProfileFavorites } from "../../widgets/profile-favorites/profile-favorites";
import { useInitialDataLoader } from "../../shared/hooks/useInitialDataLoader";
import { ProfileLayout } from "../../widgets/profile-layout/profile-layout";
import { useDispatch } from "../../services/store";
import { fetchFavorites } from "../../services/favorite/actions";

export const FavoritesPage = () => {
  useInitialDataLoader();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  return (
    <ProfileLayout>
      <ProfileFavorites />
    </ProfileLayout>
  );
};
