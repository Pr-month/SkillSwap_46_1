import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./profile-favorites.module.css";
import { SkillCard } from "../skillcard";
import type { SkillCardProps } from "../skillcard";
import { Button } from "../../shared/ui/button";
import type {
  ISkillsCategory,
  ISkillsSubcategory,
  TId,
} from "../../utils/types";
import { useDispatch, useSelector } from "../../services/store";
import { fetchRemoveFavorite } from "../../services/favorite/actions";
import { selectFavorites } from "../../services/favorite/slice";
import { getCategoryColorBySubcategoryId } from "../../shared/lib/skillColors";

const DEFAULT_LEARN_COLOR = "var(--color-category-health)";

function getAgeFromBirthDate(
  birthdate: string | null | undefined,
): number {
  if (!birthdate) {
    return 0;
  }

  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) {
    return 0;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : 0;
}

function getSubcategoryColor(
  name: string | undefined,
  subCategories: ISkillsSubcategory[],
  categories: ISkillsCategory[],
): string | undefined {
  if (!name) {
    return undefined;
  }

  const subCategory = subCategories.find((item) => item.name === name);

  return subCategory
    ? getCategoryColorBySubcategoryId(subCategory.id, subCategories, categories)
    : undefined;
}

export const ProfileFavorites: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const favorites = useSelector(selectFavorites);
  const subCategories = useSelector((state) => state.category.subCategories);
  const categories = useSelector((state) => state.category.categories);
  const sentRequests = useSelector((state) => state.requests.sent);

  const handleFavoriteClick = (skillId: TId): void => {
    if (!currentUser) {
      return;
    }

    dispatch(fetchRemoveFavorite(skillId));
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

  const cards: SkillCardProps[] = favorites
    .filter((favorite) => Boolean(favorite.skill))
    .map((favorite) => {
      const skill = favorite.skill!;
      const owner = skill.owner;

      const wantsToLearn = owner?.wantsToLearn ?? [];

      return {
        id: owner?.id,
        avatar: owner?.avatar ?? "",
        name: owner?.name ?? "",
        city: owner?.city ?? "",
        age: getAgeFromBirthDate(owner?.birthdate),
        canTeach: skill.title,
        wantsToLearn,
        isFavorite: true,
        onFavoriteClick: () => handleFavoriteClick(favorite.skillId),
        teachColor: getSubcategoryColor(
          skill.subcategory,
          subCategories,
          categories,
        ),
        wantsToLearnColors: wantsToLearn.map(
          (name) =>
            getSubcategoryColor(name, subCategories, categories) ??
            DEFAULT_LEARN_COLOR,
        ),
        disableDetails: owner
          ? String(owner.id) === String(currentUser.id)
          : true,
        exchangeProposed: sentRequests.some(
          (request) =>
            String(request.requiredSkillUserId) === String(owner?.id),
        ),
      };
    });

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
