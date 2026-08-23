import { describe, expect, it } from "@jest/globals";
import {
  selectUsers,
  selectSelectedUser,
  selectUserLoading,
  selectUserError,
  selectPopularUsers,
  selectNewestUsers,
  selectRecommendedUsers,
  selectSimilarUsers,
} from "./selectors";
import type { IUserProfile, ISkill } from "../../utils/types";
import type {
  TGenderOption,
  TSkillOption,
} from "../../widgets/filter-bar/radio-groups/types";

//Мок-данные
const makeUser = (
  overrides: Partial<IUserProfile> & { id: string },
): IUserProfile => ({
  email: `${overrides.id}@test.com`,
  name: overrides.id,
  birthDate: "2000-01-01",
  gender: "unspecified",
  city: "Moscow",
  avatar: "a.png",
  likesSkillsIds: [],
  userSkill: "",
  interestedSkillsSubcategoriesIds: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

const makeSkill = (overrides: Partial<ISkill> & { id: string }): ISkill => ({
  title: "Skill",
  description: "Desc",
  skillSubcategory: "sub-1",
  images: [],
  userId: "user-1",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

interface FilterState {
  skillOption: TSkillOption;
  gender: TGenderOption;
  subCategoryIds: string[];
  cities: string[];
  searchQuery: string;
}

const defaultFilterState: FilterState = {
  skillOption: "all",
  gender: "all",
  subCategoryIds: [],
  cities: [],
  searchQuery: "",
};

const buildState = (overrides: {
  users?: IUserProfile[];
  selectedUser?: IUserProfile | null;
  currentUser?: IUserProfile | null;
  skills?: ISkill[];
  filter?: Partial<FilterState>;
}) =>
  ({
    user: {
      list: overrides.users ?? [],
      selectedUser: overrides.selectedUser ?? null,
      loading: false,
      error: null,
    },
    filter: { ...defaultFilterState, ...overrides.filter },
    skills: {
      loading: false,
      data: overrides.skills ?? [],
      addedSkill: null,
      error: null,
    },
    // Заглушки для остальных слайсов
    auth: {
      currentUser: overrides.currentUser ?? null,
      loading: false,
      error: null,
      checkUserLoading: false,
      checkUserError: null,
    },
    categories: { loading: false, data: [], error: null },
    requests: { sent: [], received: [], loading: false, error: null },
  }) as any;

//Простые селекторы
describe("простые селекторы", () => {
  const user = makeUser({ id: "u1" });
  const state = buildState({ users: [user], selectedUser: user });

  it("selectUsers возвращает list", () => {
    expect(selectUsers(state)).toEqual([user]);
  });

  it("selectSelectedUser возвращает selectedUser", () => {
    expect(selectSelectedUser(state)).toEqual(user);
  });

  it("selectUserLoading возвращает loading", () => {
    expect(selectUserLoading(state)).toBe(false);
  });

  it("selectUserError возвращает error", () => {
    expect(selectUserError(state)).toBeNull();
  });
});

//selectPopularUsers
describe("selectPopularUsers", () => {
  it("сортирует пользователей по количеству лайков на их навык", () => {
    const users = [
      makeUser({ id: "u1", userSkill: "skill-a", likesSkillsIds: [] }),
      makeUser({ id: "u2", userSkill: "skill-b", likesSkillsIds: ["skill-a"] }),
      makeUser({
        id: "u3",
        userSkill: "skill-c",
        likesSkillsIds: ["skill-a", "skill-a"],
      }),
    ];
    // skill-a имеет 3 лайка (u2 лайкнул 1 + u3 лайкнул 2), skill-b — 0, skill-c — 0
    const state = buildState({ users });
    const result = selectPopularUsers(state);

    // u1 с skill-a должен быть первым (3 лайка на skill-a)
    expect(result[0].id).toBe("u1");
  });

  it("возвращает максимум 9 пользователей", () => {
    const users = Array.from({ length: 15 }, (_, i) =>
      makeUser({ id: `u${i}` }),
    );
    const state = buildState({ users });
    expect(selectPopularUsers(state)).toHaveLength(9);
  });
});

//selectNewestUsers
describe("selectNewestUsers", () => {
  it("возвращает пользователей, созданных за последний месяц", () => {
    const now = new Date();

    const newestDate = new Date(now);
    newestDate.setDate(now.getDate() - 1);

    const midDate = new Date(now);
    midDate.setDate(now.getDate() - 10);

    const mid2Date = new Date(now);
    mid2Date.setDate(now.getDate() - 20);

    const oldDate = new Date(now);
    oldDate.setMonth(now.getMonth() - 2);

    const users = [
      makeUser({ id: "old", createdAt: oldDate.toISOString() }),
      makeUser({ id: "newest", createdAt: newestDate.toISOString() }),
      makeUser({ id: "mid", createdAt: midDate.toISOString() }),
      makeUser({ id: "mid2", createdAt: mid2Date.toISOString() }),
    ];

    const state = buildState({ users });
    const result = selectNewestUsers(state);

    expect(result).toHaveLength(3);
    expect(result.map((user) => user.id)).toEqual(
      expect.arrayContaining(["newest", "mid", "mid2"]),
    );
    expect(result.some((user) => user.id === "old")).toBe(false);
  });
});

//selectRecommendedUsers
describe("selectRecommendedUsers", () => {
  const skills = [
    makeSkill({ id: "skill-1", skillSubcategory: "sub-a", userId: "u1" }),
    makeSkill({ id: "skill-2", skillSubcategory: "sub-b", userId: "u2" }),
    makeSkill({ id: "skill-3", skillSubcategory: "sub-a", userId: "u3" }),
  ];

  it("без авторизации возвращает 9 случайных пользователей", () => {
    const users = Array.from({ length: 12 }, (_, i) =>
      makeUser({ id: `u${i}` }),
    );
    const state = buildState({ users, skills, currentUser: null });
    const result = selectRecommendedUsers(state);

    expect(result).toHaveLength(9);
  });

  it("при пустых интересах возвращает 9 случайных пользователей без текущего", () => {
    const currentUser = makeUser({
      id: "u1",
      interestedSkillsSubcategoriesIds: [],
    });

    const users = [
      currentUser,
      ...Array.from({ length: 11 }, (_, i) => makeUser({ id: `u${i + 2}` })),
    ];

    const state = buildState({ users, skills, currentUser });
    const result = selectRecommendedUsers(state);

    expect(result).toHaveLength(9);
    expect(result.some((user) => user.id === currentUser.id)).toBe(false);
  });

  it("при наличии интересов возвращает пользователей с подходящей сабкатегорией и исключает текущего", () => {
    const currentUser = makeUser({
      id: "u1",
      interestedSkillsSubcategoriesIds: ["sub-a"],
    });

    const users = [
      currentUser,
      makeUser({ id: "u2", userSkill: "skill-2" }),
      makeUser({ id: "u3", userSkill: "skill-3" }),
    ];

    const state = buildState({ users, skills, currentUser });
    const result = selectRecommendedUsers(state);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("u3");
  });
});

//selectSimilarUsers
describe("selectSimilarUsers", () => {
  const skills = [
    makeSkill({ id: "skill-1", skillSubcategory: "sub-a", userId: "u1" }),
    makeSkill({ id: "skill-2", skillSubcategory: "sub-a", userId: "u2" }),
    makeSkill({ id: "skill-3", skillSubcategory: "sub-b", userId: "u3" }),
  ];

  it("возвращает пользователей с навыком из той же подкатегории", () => {
    const selectedUser = makeUser({ id: "u1", userSkill: "skill-1" });
    const users = [
      selectedUser,
      makeUser({ id: "u2", userSkill: "skill-2" }),
      makeUser({ id: "u3", userSkill: "skill-3" }),
    ];
    const state = buildState({ users, selectedUser, skills });
    const result = selectSimilarUsers(state);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("u2");
  });

  it("исключает самого выбранного пользователя", () => {
    const selectedUser = makeUser({ id: "u1", userSkill: "skill-1" });
    const users = [selectedUser];
    const state = buildState({ users, selectedUser, skills });

    expect(selectSimilarUsers(state)).toHaveLength(0);
  });

  it("возвращает пустой массив если нет selectedUser", () => {
    const users = [makeUser({ id: "u1", userSkill: "skill-1" })];
    const state = buildState({ users, selectedUser: null, skills });

    expect(selectSimilarUsers(state)).toEqual([]);
  });

  it("возвращает пустой массив если навык selectedUser не найден", () => {
    const selectedUser = makeUser({ id: "u1", userSkill: "nonexistent" });
    const users = [selectedUser];
    const state = buildState({ users, selectedUser, skills });

    expect(selectSimilarUsers(state)).toEqual([]);
  });
});

