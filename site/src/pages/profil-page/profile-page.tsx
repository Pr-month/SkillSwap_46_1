import { type FC, useEffect, useRef, type ChangeEvent } from "react";
import { useDispatch, useSelector, type RootState } from "../../services/store";
import {
  fetchProfile,
  fetchUpdateCurrentUser,
} from "../../services/auth/actions";
import { UserInfo } from "../../shared/ui/user-info";
import type { UserInfoProps } from "../../shared/ui/user-info";
import { ProfileLayout } from "../../widgets/profile-layout/profile-layout";
import { useImageUpload } from "../../shared/hooks/useImageUpload";

export const ProfilePage: FC = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { currentUser, loading } = useSelector(
    (state: RootState) => state.auth,
  );

  const {
    uploadSingle,
    isLoading: isAvatarUploading,
    error: avatarUploadError,
  } = useImageUpload();

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchProfile());
    }
  }, [dispatch, currentUser]);

  const handleAvatarEdit = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const uploadedImage = await uploadSingle(file);

    if (uploadedImage?.url) {
      await dispatch(
        fetchUpdateCurrentUser({
          avatar: uploadedImage.url,
        }),
      );
    }

    event.target.value = "";
  };

  const handleSave: UserInfoProps["onSave"] = async (data) => {
    await dispatch(
      fetchUpdateCurrentUser({
        email: data.email,
        name: data.name,
        birthDate: data.birthDate,
        gender:
          data.gender?.value === "male" || data.gender?.value === "female"
            ? data.gender.value
            : "unspecified",
        city: data.city,
        aboutMe: data.about,
      }),
    );
  };

  const mappedUser: UserInfoProps["user"] | undefined = currentUser
    ? {
        email: currentUser.email,
        name: currentUser.name,
        birthDate: currentUser.birthDate,
        gender: currentUser.gender
          ? {
              value: currentUser.gender,
              title:
                currentUser.gender === "male"
                  ? "Мужской"
                  : currentUser.gender === "female"
                    ? "Женский"
                    : "Другой",
            }
          : null,
        city: currentUser.city,
        about: currentUser.aboutMe ?? "",
        avatar: currentUser.avatar,
      }
    : undefined;

  return (
    <ProfileLayout>
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleAvatarChange}
        />

        <UserInfo
          key={currentUser?.updatedAt ?? currentUser?.id ?? "user-info"}
          user={mappedUser}
          onSave={handleSave}
          onAvatarEdit={handleAvatarEdit}
          loading={loading || isAvatarUploading}
        />

        {avatarUploadError && <p>{avatarUploadError}</p>}
      </>
    </ProfileLayout>
  );
};
