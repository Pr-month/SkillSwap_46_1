import { useState, type FC } from "react";
import { fetchUpdateCurrentUser } from "../../services/auth/actions";
import { useDispatch, useSelector } from "../../services/store";
import { getSkillTitle } from "../../shared/lib/getSkillTitle";
import { getSubcategoryNames } from "../../shared/lib/getSubcategoryNames";
import { getLearnColors, getTeachColor } from "../../shared/lib/skillColors";
import type { IUserProfile, TId } from "../../utils/types";
import type { SkillCardProps } from "../skillcard";
import { SkillCardGroup } from "../skillcard-group";
import { SkillCardGroupHeader } from "../skillcard-group-header";
import { SkillCardSlider } from "../skillcard-slider";
import styles from "./user-section.module.css";

interface UserSectionProps {
  title: string;
  users: IUserProfile[];
  actionText?: string;
  onActionClick?: () => void;
  emptyMessage?: string;
  viewMode?: "grid" | "slider";
  isSorted?: boolean;
}

type ValidTId = Exclude<TId, null | undefined>;

type PreparedUser = IUserProfile & {
  age: number;
  canTeach: string;
  wantsToLearn: string[];
  userSkill: ValidTId;
  skillCreatedAt: string;
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

export const UserSection: FC<UserSectionProps> = ({
  title,
  users,
  actionText = "Смотреть все",
  onActionClick,
  emptyMessage = "Пользователи не найдены",
  viewMode = "grid",
  isSorted = false,
}) => {
  const dispatch = useDispatch();
  const skills = useSelector((state) => state.skills.data);
  const subCategories = useSelector((state) => state.category.subCategories);
  const categories = useSelector((state) => state.category.categories);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const sentRequests = useSelector((state) => state.requests.sent);

  const [sortOrder, setSortOrder] = useState<"new" | "old">("new");

  // Обработчик клика по ❤️
  const handleFavoriteClick = (skillId: TId): void => {
    if (!currentUser) {
      return;
    }

    const isLiked = currentUser.likesSkillsIds.includes(skillId);

    const nextLikesSkillsIds = isLiked
      ? currentUser.likesSkillsIds.filter((id) => id !== skillId)
      : [...currentUser.likesSkillsIds, skillId];

    // Асинхронное обновление пользователей для автообновления selectPopularUsers в HomePage
    (async () => {
      await dispatch(
        fetchUpdateCurrentUser({ likesSkillsIds: nextLikesSkillsIds }),
      );
    })();
  };

  const usersWithSkillDate = users.map((user) => {
    const skill = skills.find((s) => s.id === user.userSkill);
    return {
      ...user,
      skillCreatedAt: skill?.createdAt || user.createdAt,
    };
  });

  const preparedUsers: PreparedUser[] = usersWithSkillDate
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

  if (preparedUsers.length === 0) {
    return (
      <section className={styles.section}>
        <SkillCardGroupHeader
          title={title}
          actionText={actionText}
          onActionClick={onActionClick}
          hideAction={!onActionClick}
          isSorted={false}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <p className={styles.emptyMessage}>{emptyMessage}</p>
      </section>
    );
  }

  const cards: SkillCardProps[] = preparedUsers.map((user) => ({
    id: user.id,
    avatar: user.avatar,
    name: user.name,
    city: user.city,
    age: user.age,
    canTeach: user.canTeach,
    wantsToLearn: user.wantsToLearn,
    isFavorite: currentUser
      ? currentUser.likesSkillsIds.includes(user.userSkill)
      : false,
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
    disableDetails: String(user.id) === String(currentUser?.id),
    exchangeProposed: sentRequests.some(
      (request) => String(request.requiredSkillUserId) === String(user.id),
    ),
  }));

  return (
    <section className={styles.section}>
      {viewMode === "slider" ? (
        <>
          <SkillCardGroupHeader
            title={title}
            actionText={actionText}
            onActionClick={onActionClick}
            hideAction={!onActionClick}
            isSorted={isSorted}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
          <SkillCardSlider cards={cards} />
        </>
      ) : (
        <SkillCardGroup
          title={title}
          cards={cards}
          actionText={actionText}
          onActionClick={onActionClick}
          hideAction={!onActionClick}
          initialVisibleCount={3}
          isSorted={isSorted}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          infiniteScroll={!onActionClick}
        />
      )}
    </section>
  );
};
