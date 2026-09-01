import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../../shared/ui/avatar";
import { Button } from "../../shared/ui/button";
import { Icon } from "../../shared/ui/icon";
import { ModalUI } from "../../shared/ui/modal-ui";
import { CreateOffer } from "../../features/modals/create-offer";
import { ImageGallery } from "../../features/image-gallery/image-gallery";
import { drumsImages } from "../../assets/images/skills";
import styles from "./skill-page.module.css";
import { SkillCardSlider } from "../../widgets/skillcard-slider";
import { useDispatch, useSelector } from "../../services/store";
import {
  selectSelectedUser,
  selectSimilarUsers,
} from "../../services/user/selectors";
import { fetchUserById, fetchUsers } from "../../services/user/actions";
import { fetchSkills } from "../../services/skill/actions";
import { fetchCategories } from "../../services/category/actions";
import { getSkillTitle } from "../../shared/lib/getSkillTitle";
import { getSubcategoryNames } from "../../shared/lib/getSubcategoryNames";
import { getLearnColors, getTeachColor } from "../../shared/lib/skillColors";
import { getAgeFromBirthDate } from "../../utils/age";
import clsx from "clsx";
import {
  createRequestAction,
  fetchMyRequests,
  updateRequestStatusAction,
} from "../../services/request/actions";
import { fetchUpdateCurrentUser } from "../../services/auth/actions";
import { showToast } from "../../utils/toast";

const getAgeNumber = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

export function SkillPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedUser = useSelector(selectSelectedUser);
  const similarUsers = useSelector(selectSimilarUsers);
  const users = useSelector((state) => state.user.list);
  const skills = useSelector((state) => state.skills.data);
  const subCategories = useSelector((state) => state.category.subCategories);
  const categories = useSelector((state) => state.category.categories);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const requestsReceived = useSelector((state) => state.requests.received);
  const sentRequests = useSelector((state) => state.requests.sent);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Защита от повторного dispatch fetchSkills при двойном монтировании
  // эффекта в React StrictMode (dev-режим).
  const skillsRequested = useRef(false);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }

    if (skills.length === 0 && !skillsRequested.current) {
      skillsRequested.current = true;
      dispatch(fetchSkills());
    }

    if (categories.length === 0) {
      dispatch(fetchCategories());
    }

    if (id && selectedUser?.id !== id) {
      dispatch(fetchUserById(id));
    }

    if (currentUser) {
      dispatch(fetchMyRequests());
    }
  }, [
    dispatch,
    id,
    selectedUser?.id,
    users.length,
    skills.length,
    categories.length,
    currentUser,
  ]);

  if (!id) {
    return (
      <section className={styles.page}>
        <p>Навык не выбран</p>
      </section>
    );
  }

  if (!selectedUser) {
    return (
      <section className={styles.page}>
        <p>Загрузка...</p>
      </section>
    );
  }

  const selectedSkill = skills.find(
    (skill) => skill.id === selectedUser.userSkill,
  );

  const selectedSubCategory = selectedSkill
    ? subCategories.find(
        (subCategory) => subCategory.id === selectedSkill.skillSubcategory,
      )
    : null;

  const selectedCategory = selectedSubCategory
    ? categories.find(
        (category) => category.id === selectedSubCategory.skillCategoryId,
      )
    : null;

  const categoryLabel =
    selectedCategory && selectedSubCategory
      ? `${selectedCategory.name} / ${selectedSubCategory.name}`
      : (selectedSubCategory?.name ?? "");

  const authorCanTeach = selectedSkill ? [selectedSkill.title] : [];

  const authorWantsToLearn = getSubcategoryNames(
    selectedUser.interestedSkillsSubcategoriesIds,
    subCategories,
  );

  const authorTeachColor = getTeachColor(
    selectedUser.userSkill,
    skills,
    subCategories,
    categories,
  );

  const authorLearnColors = getLearnColors(
    selectedUser.interestedSkillsSubcategoriesIds,
    subCategories,
    categories,
  );

  const isFavorite =
    (currentUser?.likesSkillsIds ?? []).includes(selectedUser.userSkill);

  const isOwnProfile = currentUser?.id === selectedUser?.id;

  const galleryImages =
    selectedSkill?.images && selectedSkill.images.length > 0
      ? selectedSkill.images
      : drumsImages;

  // Проверяем, отправлено ли предложение
  const isOfferSent =
    !!currentUser &&
    !!selectedUser.id &&
    sentRequests.some((request) => {
      const isTargetUser =
        String(request.requiredSkillUserId) === String(selectedUser.id) ||
        String(request.toUserId) === String(selectedUser.id);

      const isActiveStatus =
        request.status !== "rejected" && request.status !== undefined;

      const isPendingByDefault =
        !request.status || request.status === "pending";

      return isTargetUser && (isActiveStatus || isPendingByDefault);
    });

  const preparedSimilarUsers = similarUsers
    .map((user) => {
      const age = getAgeNumber(user.birthDate);
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
    .filter((user) => {
      return (
        String(user.id) !== String(selectedUser.id) &&
        Boolean(user.name?.trim()) &&
        Boolean(user.city?.trim()) &&
        user.age >= 14 &&
        Boolean(user.canTeach?.trim()) &&
        user.wantsToLearn.length > 0
      );
    });

  const handleFavoriteClick = async (skillId: string | null | undefined) => {
    if (!currentUser || !skillId || isTogglingFavorite) {
      return;
    }

    setIsTogglingFavorite(true);

    const likesSkillsIds = currentUser.likesSkillsIds ?? [];
    const isLiked = likesSkillsIds.includes(skillId);

    const nextLikesSkillsIds = isLiked
      ? likesSkillsIds.filter((id) => id !== skillId)
      : [...likesSkillsIds, skillId];

    try {
      await dispatch(
        fetchUpdateCurrentUser({ likesSkillsIds: nextLikesSkillsIds }),
      ).unwrap();
      dispatch(fetchUsers());
      showToast(
        isLiked ? "Удалено из избранного" : "Добавлено в избранное",
        "success",
      );
    } catch (error) {
      console.error("Не удалось обновить избранное", error);
      showToast("Не удалось обновить избранное", "error");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Ссылка скопирована", "success");
    } catch (error) {
      console.error("Не удалось скопировать ссылку", error);
      showToast("Не удалось скопировать ссылку", "error");
    }
  };

  const handleOfferClick = () => {
    if (isOwnProfile) {
      return;
    }

    setIsOfferModalOpen(true);
  };

  const handleOfferModalAction = async () => {
    setIsOfferModalOpen(false);

    if (!currentUser) {
      navigate("/registration", { state: { from: `/skill/${id}` } });
      return;
    }

    if (!selectedUser?.id || !currentUser.userSkill) {
      return;
    }

    setIsCreatingRequest(true);

    try {
      await dispatch(
        createRequestAction({
          offeredSkillId: currentUser.userSkill,
          requestedSkillId: selectedUser.userSkill,
        }),
      ).unwrap();

      await dispatch(fetchMyRequests());
      showToast("Предложение обмена отправлено", "success");
    } catch (error) {
      console.error("Не удалось создать запрос на обмен", error);
      showToast("Не удалось отправить предложение", "error");
    } finally {
      setIsCreatingRequest(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.topSection}>
        <aside className={styles.authorCard}>
          <div className={styles.authorHeader}>
            <Avatar
              src={selectedUser.avatar}
              name={selectedUser.name}
              size="profile"
              className={styles.avatar}
            />

            <div className={styles.authorInfo}>
              <h2 className={styles.authorName}>{selectedUser.name}</h2>
              <p className={styles.authorMeta}>
                {selectedUser.city},{" "}
                {getAgeFromBirthDate(selectedUser.birthDate)}
              </p>
            </div>
          </div>

          <p className={styles.authorDescription}>
            {selectedUser.aboutMe ?? "Описание пользователя отсутствует"}
          </p>

          <div className={styles.tagsSection}>
            <h3 className={styles.tagsTitle}>Может научить</h3>

            <div className={styles.tags}>
              {authorCanTeach.map((tag) => (
                <span
                  key={tag}
                  className={`${styles.tag} ${styles.tagTeach}`}
                  style={{ backgroundColor: authorTeachColor }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.tagsSection}>
            <h3 className={styles.tagsTitle}>Хочет научиться</h3>

            <div className={styles.tags}>
              {authorWantsToLearn.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className={`${styles.tag} ${styles.tagLearn}`}
                  style={{ backgroundColor: authorLearnColors[index] }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <article className={styles.skillCard}>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionButton}
              aria-label="Добавить в избранное"
              onClick={() => handleFavoriteClick(selectedUser.userSkill)}
              disabled={isTogglingFavorite}
            >
              <Icon
                name={isFavorite ? "like-filled" : "like"}
                size={24}
                color={isFavorite ? "#ABD27A" : "currentColor"}
              />
            </button>

            <button
              type="button"
              className={styles.actionButton}
              aria-label="Поделиться"
              onClick={handleCopyLink}
            >
              <Icon name="share" size={24} />
            </button>

            <button
              type="button"
              className={styles.actionButton}
              aria-label="Дополнительные действия"
            >
              <Icon name="more-square" size={24} />
            </button>
          </div>

          <div className={styles.skillCardHeader}>
            <div className={styles.skillContent}>
              <div className={styles.skillTextBlock}>
                <h1 className={styles.title}>
                  {selectedSkill?.title ?? "Навык"}
                </h1>

                <p className={styles.category}>{categoryLabel}</p>

                <p className={styles.description}>
                  {selectedSkill?.description ?? "Описание навыка отсутствует"}
                </p>
              </div>

              {!isOwnProfile && (
                <div className={styles.exchangeActions}>
                  {(() => {
                    const incomingRequest = requestsReceived.find(
                      (req) =>
                        req.requiredSkillUserId === currentUser?.id &&
                        (req.fromUserId === selectedUser.id ||
                          req.toUserId === selectedUser.id),
                    );

                    if (incomingRequest?.status === "accepted") {
                      return (
                        <Button
                          variant="primary"
                          disabled
                          className={styles.acceptedButton}
                          fullWidth
                        >
                          Обмен принят
                        </Button>
                      );
                    }

                    if (incomingRequest?.status === "pending") {
                      return (
                        <div className={styles.requestActions}>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              dispatch(
                                updateRequestStatusAction({
                                  id: incomingRequest.id,
                                  status: "rejected",
                                }),
                              );
                            }}
                            className={styles.rejectButton}
                            fullWidth
                          >
                            Отклонить
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => {
                              dispatch(
                                updateRequestStatusAction({
                                  id: incomingRequest.id,
                                  status: "accepted",
                                }),
                              );
                            }}
                            className={styles.acceptButton}
                            fullWidth
                          >
                            Принять обмен
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <Button
                        variant={isOfferSent ? "secondary" : "primary"}
                        onClick={
                          isOfferSent || isCreatingRequest
                            ? undefined
                            : handleOfferClick
                        }
                        className={clsx(
                          styles.exchangeButton,
                          isOfferSent && styles.exchangeButtonStatus,
                        )}
                        icon={isOfferSent ? "clock" : undefined}
                        iconPosition="left"
                        fullWidth
                        disabled={isCreatingRequest}
                      >
                        {isCreatingRequest
                          ? "Отправка..."
                          : isOfferSent
                            ? "Обмен предложен"
                            : "Предложить обмен"}
                      </Button>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className={styles.galleryWrapper}>
              <ImageGallery images={galleryImages} />
            </div>
          </div>
        </article>
      </div>

      <section className={styles.similarSection}>
        <h2 className={styles.similarTitle}>Похожие предложения</h2>

        {preparedSimilarUsers.length > 0 ? (
          <SkillCardSlider
            cards={preparedSimilarUsers.map((user) => ({
              id: user.id,
              avatar: user.avatar,
              name: user.name,
              city: user.city,
              age: user.age,
              canTeach: user.canTeach,
              wantsToLearn: user.wantsToLearn,
              isFavorite:
                (currentUser?.likesSkillsIds ?? []).includes(user.userSkill),
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
            }))}
          />
        ) : (
          <div className={styles.emptySimilar}>
            Похожих предложений пока нет
          </div>
        )}
      </section>

      <ModalUI
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
      >
        <CreateOffer
          variant={currentUser ? "created" : "registration"}
          onActionClick={handleOfferModalAction}
        />
      </ModalUI>
    </section>
  );
}
