import { ProfileFavorites } from "../../widgets/profile-favorites/profile-favorites";
import { useInitialDataLoader } from "../../shared/hooks/useInitialDataLoader";
import { ProfileLayout } from "../../widgets/profile-layout/profile-layout";

export const FavoritesPage = () => {
  useInitialDataLoader();

  return (
    <ProfileLayout>
      <ProfileFavorites />
    </ProfileLayout>
  );
};
