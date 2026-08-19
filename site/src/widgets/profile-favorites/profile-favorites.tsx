import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./profile-favorites.module.css";
import { SkillCard } from "../skillcard";
import type { SkillCardProps } from "../skillcard";
import { Button } from "../../shared/ui/button";
import type { IUserProfile, TId } from "../../utils/types";
import { useDispatch, useSelector } from "../../services/store";
import { fetchUpdateCurrentUser } from "../../services/auth/actions";
import { getSubcategoryNames } from "../../shared/lib/getSubcategoryNames";
import { getSkillTitle } from "../../shared/lib/getSkillTitle";
import { getLearnColors, getTeachColor } from "../../shared/lib/skillColors";

type ValidTId = Exclude<TId, null | undefined>;

type PreparedUser = IUserProfile & {
  age: number;
  canTeach: string;
  wantsToLearn: string[];
  userSkill: ValidTId;
};

function getAgeFromBirthDate(birthDate: string): number | null {
  const birth = new Date(birthDate);

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export const ProfileFavorites: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const users = useSelector((state) => state.user.list);
  const skills = useSelector((state) => state.skills.data);
  const subCategories = useSelector((state) => state.category.subCategories);
  const categories = useSelector((state) => state.category.categories);
  const sentRequests = useSelector((state) => state.requests.sent);

  const handleFavoriteClick = (skillId: TId): void => {
    if (!currentUser) {
      return;
    }

    const nextLikesSkillsIds = currentUser.likesSkillsIds.filter(
      (id) => id !== skillId,
    );

    dispatch(fetchUpdateCurrentUser({ likesSkillsIds: nextLikesSkillsIds }));
  };

  const handleGoToCatalog = (): void => {
    navigate("/");
  };

  const handleGoToLogin = (): void => {
    navigate("/login");
  };

  if (!currentUser) {
    return (
      <section className={styles.section}>
        <h1 className={styles.title}>Избранное</h1>

        <div className={styles.emptyWrapper}>
          <p className={styles.emptyMessage}>
            Избранное доступно только авторизованным пользователям
          </p>

          <div className={styles.actions}>
            <Button variant="secondary" onClick={handleGoToCatalog}>
              Вернуться в каталог
            </Button>

            <Button onClick={handleGoToLogin}>Войти</Button>
          </div>
        </div>
      </section>
    );
  }

  const favoriteUsers: PreparedUser[] = users
    .filter((user) => currentUser.likesSkillsIds.includes(user.userSkill))
    .map((user) => {
      const age = getAgeFromBirthDate(user.birthDate);
      const canTeach = getSkillTitle(user.userSkill, skills);
      const wantsToLearn = getSubcategoryNames(
        user.interestedSkillsSubcategoriesIds,
        subCategories,
      );

      return {
        ...user,
        age,
        canTeach,
        wantsToLearn,
      };
    })
    .filter((user): user is PreparedUser => {
      return (
        Boolean(user.name?.trim()) &&
        Boolean(user.city?.trim()) &&
        user.age !== null &&
        user.age >= 14 &&
        user.userSkill !== null &&
        user.userSkill !== undefined &&
        Boolean(user.canTeach?.trim()) &&
        user.wantsToLearn.length > 0
      );
    });

  const cards: SkillCardProps[] = favoriteUsers.map((user) => ({
    id: user.id,
    avatar: user.avatar,
    name: user.name,
    city: user.city,
    age: user.age,
    canTeach: user.canTeach,
    wantsToLearn: user.wantsToLearn,
    isFavorite: true,
    onFavoriteClick: () => handleFavoriteClick(user.userSkill),
    teachColor: getTeachColor(
      user.userSkill,
      skills,
      subCategories,
      categories,
    ),
    wantsToLearnColors: getLearnColors(
      user.interestedSkillsSubcategoriesIds,
      subCategories,
      categories,
    ),
    disableDetails: String(user.id) === String(currentUser.id),
    exchangeProposed: sentRequests.some(
      (request) => String(request.requiredSkillUserId) === String(user.id),
    ),
  }));

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Избранное</h1>

      {cards.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <p className={styles.emptyMessage}>Нет избранных карточек</p>

          <Button onClick={handleGoToCatalog}>Вернуться в каталог</Button>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.grid}>
            {cards.map((card, index) => (
              <div
                key={
                  card.id ?? `${card.name}-${card.city}-${card.age}-${index}`
                }
                className={styles.cardItem}
              >
                <SkillCard {...card} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
