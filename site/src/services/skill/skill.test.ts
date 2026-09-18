import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import type {
  ISkill,
  TModifySkillData,
  TSkillData,
  TSkillResponse,
} from "../../utils/types";
import {
  appendSkill,
  changeSkill,
  fetchSkillById,
  fetchSkills,
  removeSkill,
} from "./actions";
import { removeSkillFromStore, skillSlice } from "./slice";

// Мокаем API модуль
jest.mock("../../api/skillApi", () => ({
  addSkill: jest.fn(),
  getSkills: jest.fn(),
  getSkillById: jest.fn(),
  modifySkill: jest.fn(),
  deleteSkillById: jest.fn(),
}));

import {
  addSkill,
  deleteSkillById,
  getSkillById,
  getSkills,
  modifySkill,
} from "../../api/skillApi";
import type { PaginatedSkillsResponse } from "../../api/skillApi";

// Типизируем моки
const mockedAddSkill = addSkill as jest.MockedFunction<typeof addSkill>;
const mockedGetSkills = getSkills as jest.MockedFunction<typeof getSkills>;
const mockedGetSkillById = getSkillById as jest.MockedFunction<
  typeof getSkillById
>;
const mockedModifySkill = modifySkill as jest.MockedFunction<
  typeof modifySkill
>;
const mockedDeleteSkillById = deleteSkillById as jest.MockedFunction<
  typeof deleteSkillById
>;

describe("ПРОВЕРКА РЕДЮСЕРА СЛАЙСА НАВЫКА [skillSlice]", () => {
  let requestedSkills: (ISkill & { id: string })[] = [];
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    // Восстановление массива запрашиваемых навыков
    requestedSkills = [
      {
        id: "skill-1",
        title: "Игра на барабанах",
        description: "Играю на барабанах...",
        skillSubcategory: "sub-4-4",
        userId: "user-1",
        createdAt: "2025-02-14T15:30:00Z",
        updatedAt: "2025-02-14T15:30:00Z",
        images: [
          "https://picsum.photos/seed/skill-1-1/400/300",
          "https://picsum.photos/seed/skill-1-2/400/300",
          "https://picsum.photos/seed/skill-1-3/400/300",
          "https://picsum.photos/seed/skill-1-4/400/300",
        ],
      },
      {
        id: "skill-2",
        title: "Портретная фотография",
        description: "Профессионально занимаюсь портретной съёмкой...",
        skillSubcategory: "sub-4-2",
        userId: "user-2",
        createdAt: "2025-01-20T09:15:00Z",
        updatedAt: "2025-01-20T09:15:00Z",
        images: [
          "https://picsum.photos/seed/skill-2-1/400/300",
          "https://picsum.photos/seed/skill-2-2/400/300",
          "https://picsum.photos/seed/skill-2-3/400/300",
          "https://picsum.photos/seed/skill-2-4/400/300",
        ],
      },
      {
        id: "skill-3",
        title: "Запуск бизнеса с нуля",
        description: "Прошёл путь от идеи до работающего бизнеса...",
        skillSubcategory: "sub-1-8",
        userId: "user-3",
        createdAt: "2025-03-02T08:20:00Z",
        updatedAt: "2025-03-02T08:20:00Z",
        images: [
          "https://picsum.photos/seed/skill-3-1/400/300",
          "https://picsum.photos/seed/skill-3-2/400/300",
          "https://picsum.photos/seed/skill-3-3/400/300",
          "https://picsum.photos/seed/skill-3-4/400/300",
        ],
      },
    ];

    // Мокаем console.error чтобы подавить вывод ошибок в тестах
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Восстанавливаем console.error
    consoleErrorSpy.mockRestore();
  });

  //* ТЕСТ 1: ПОЛУЧЕНИЕ НАВЫКОВ
  test("Тест получения навыков [fetchSkills]", async () => {
    mockedGetSkills.mockResolvedValue({
      data: requestedSkills,
      page: 1,
      totalPages: 1,
    });

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    let state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.data).toEqual([]);
    expect(state.skills.error).toBeNull();

    await store.dispatch(fetchSkills());

    state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.data).toEqual(requestedSkills);
    expect(state.skills.error).toBeNull();
    expect(mockedGetSkills).toHaveBeenCalled();
    expect(mockedGetSkills).toHaveBeenCalledTimes(1);
  });

  //* ТЕСТ 2: ДОБАВЛЕНИЕ НАВЫКА
  test("Тест добавления навыка [appendSkill]", async () => {
    const skillData: TSkillData = {
      title: "Игра на нервах",
      description: "Играю профессионально на нервах",
      skillSubcategory: "sub-4-4",
      images: [
        "https://picsum.photos/seed/skill-1-1/400/300",
        "https://picsum.photos/seed/skill-1-2/400/300",
        "https://picsum.photos/seed/skill-1-3/400/300",
        "https://picsum.photos/seed/skill-1-4/400/300",
      ],
    };

    const expectedResponse: TSkillResponse = {
      status: true,
      data: {
        ...skillData,
        id: "skill-5",
        userId: "user-1",
        createdAt: "2025-02-14T15:30:00Z",
        updatedAt: "2025-02-14T15:30:00Z",
      },
    };

    mockedAddSkill.mockResolvedValue(expectedResponse);

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    let state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.data).toEqual([]);
    expect(state.skills.error).toBeNull();

    await store.dispatch(appendSkill(skillData));

    state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.data[0]).toEqual(expectedResponse.data);
    expect(state.skills.addedSkill).toEqual(expectedResponse.data);
    expect(state.skills.error).toBeNull();
    expect(mockedAddSkill).toHaveBeenCalledWith(skillData);
    expect(mockedAddSkill).toHaveBeenCalledTimes(1);
  });

  //* ТЕСТ 3: ПОЛУЧЕНИЕ НАВЫКА ПО ID
  test("Тест получения навыка по ID [fetchSkillById]", async () => {
    const skillId = "skill-1";
    const expectedSkill = requestedSkills[0];

    mockedGetSkillById.mockResolvedValue({
      status: true,
      data: expectedSkill,
    });

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    let state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.addedSkill).toBeNull();
    expect(state.skills.error).toBeNull();

    await store.dispatch(fetchSkillById(skillId));

    state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.addedSkill).toEqual(expectedSkill);
    expect(state.skills.error).toBeNull();
    expect(mockedGetSkillById).toHaveBeenCalledWith(skillId);
    expect(mockedGetSkillById).toHaveBeenCalledTimes(1);
  });

  //* ТЕСТ 4: УСПЕШНОЕ ИЗМЕНЕНИЕ НАВЫКА
  test("Тест успешного изменения навыка [changeSkill fulfilled]", async () => {
    const initialSkill = requestedSkills[0];
    const modifyData: TModifySkillData = {
      id: initialSkill.id!,
      title: "Обновленное название навыка",
      description: "Обновленное описание",
    };

    const updatedSkill = {
      ...initialSkill,
      ...modifyData,
      updatedAt: "2025-03-21T12:00:00Z",
    };

    mockedModifySkill.mockResolvedValue({
      status: true,
      data: updatedSkill,
    });

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    mockedAddSkill.mockResolvedValue({
      status: true,
      data: initialSkill,
    });
    await store.dispatch(appendSkill(initialSkill as TSkillData));

    let state = store.getState();
    expect(state.skills.data).toHaveLength(1);
    expect(state.skills.data[0]).toEqual(initialSkill);

    await store.dispatch(changeSkill(modifyData));

    state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.data[0]).toEqual(updatedSkill);
    expect(state.skills.error).toBeNull();
    expect(mockedModifySkill).toHaveBeenCalledWith(modifyData);
    expect(mockedModifySkill).toHaveBeenCalledTimes(1);
  });

  //* ТЕСТ 5: УДАЛЕНИЕ НАВЫКА
  test("Тест удаления навыка [removeSkill]", async () => {
    const skillId = "skill-1";
    const skillToRemove = requestedSkills[0];

    mockedDeleteSkillById.mockResolvedValue({ status: true });

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    mockedAddSkill.mockResolvedValue({
      status: true,
      data: skillToRemove,
    });
    await store.dispatch(appendSkill(skillToRemove as TSkillData));

    let state = store.getState();
    expect(state.skills.data).toHaveLength(1);
    expect(state.skills.data[0]).toEqual(skillToRemove);

    await store.dispatch(removeSkill(skillId));

    state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.data).toHaveLength(0);
    expect(state.skills.error).toBeNull();
    expect(mockedDeleteSkillById).toHaveBeenCalledWith(skillId);
    expect(mockedDeleteSkillById).toHaveBeenCalledTimes(1);
  });

  //* ТЕСТ 6: РЕДЬЮСЕР УДАЛЕНИЯ НАВЫКА ИЗ STORE
  test("Тест удаления навыка из store [removeSkillFromStore]", async () => {
    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    // Добавляем навык в store
    mockedAddSkill.mockResolvedValue({
      status: true,
      data: requestedSkills[0],
    });
    await store.dispatch(appendSkill(requestedSkills[0] as TSkillData));

    let state = store.getState();
    expect(state.skills.data).toHaveLength(1);

    store.dispatch(removeSkillFromStore("skill-1"));

    state = store.getState();
    expect(state.skills.data).toHaveLength(0);
  });

  //* ТЕСТ 7: ОШИБКА ПРИ ПОЛУЧЕНИИ НАВЫКОВ
  test("Тест ошибки при получении навыков [fetchSkills rejected]", async () => {
    const error = new Error("Ошибка получения навыков");
    mockedGetSkills.mockRejectedValue(error);

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    await store.dispatch(fetchSkills());

    const state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.data).toEqual([]);
    expect(state.skills.error).toBe("Ошибка получения навыков");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  //* ТЕСТ 8: ОШИБКА ПРИ ПОЛУЧЕНИИ НАВЫКА ПО ID
  test("Тест ошибки при получении навыка по ID [fetchSkillById rejected]", async () => {
    const skillId = "non-existent-id";
    const error = new Error("Ошибка получения навыка по его id");
    mockedGetSkillById.mockRejectedValue(error);

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    await store.dispatch(fetchSkillById(skillId));

    const state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.addedSkill).toBeNull();
    expect(state.skills.error).toBe("Ошибка получения навыка по его id");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  //* ТЕСТ 9: ОШИБКА ПРИ ДОБАВЛЕНИИ НАВЫКА
  test("Тест ошибки при добавлении навыка [appendSkill rejected]", async () => {
    const skillData: TSkillData = {
      title: "Игра на нервах",
      description: "Играю профессионально на нервах",
      skillSubcategory: "sub-4-4",
      images: ["https://picsum.photos/seed/skill-1-1/400/300"],
    };

    const error = new Error("Ошибка создания навыка");
    mockedAddSkill.mockRejectedValue(error);

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    await store.dispatch(appendSkill(skillData));

    const state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.data).toEqual([]);
    expect(state.skills.error).toBe("Ошибка создания навыка");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  //* ТЕСТ 10: СОСТОЯНИЕ PENDING ПРИ ИЗМЕНЕНИИ НАВЫКА
  test("Тест состояния loading при изменении навыка [changeSkill pending]", async () => {
    // Создаем неразрешенный промис
    let resolvePromise: (value: TSkillResponse) => void;
    const promise = new Promise<TSkillResponse>((resolve) => {
      resolvePromise = resolve;
    });

    // Мокаем modifySkill, чтобы он возвращал промис, который не резолвится сразу
    mockedModifySkill.mockImplementation(() => promise);

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    // Добавляем начальный навык в store
    mockedAddSkill.mockResolvedValue({
      status: true,
      data: requestedSkills[0],
    });
    await store.dispatch(appendSkill(requestedSkills[0] as TSkillData));

    // Проверяем начальное состояние
    let state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.error).toBeNull();
    expect(state.skills.data).toHaveLength(1);

    const modifyData: TModifySkillData = {
      id: "skill-1",
      title: "Обновленное название",
    };

    // Запуск changeSkill без ожидания его завершения
    const changePromise = store.dispatch(changeSkill(modifyData));

    // Проверка: после диспатча loading стал true?
    state = store.getState();
    expect(state.skills.loading).toBe(true);
    expect(state.skills.error).toBeNull();

    // Резолвим промис для завершения теста
    resolvePromise!({
      status: true,
      data: {
        ...requestedSkills[0],
        ...modifyData,
        updatedAt: new Date().toISOString(),
      },
    });

    await changePromise;

    // Проверка финального состояния
    state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.data[0].title).toBe("Обновленное название");
    expect(mockedModifySkill).toHaveBeenCalledWith(modifyData);
  });

  //* ТЕСТ 11: ОШИБКА ПРИ ИЗМЕНЕНИИ НАВЫКА
  test("Тест ошибки при изменении навыка [changeSkill rejected]", async () => {
    const modifyData: TModifySkillData = {
      id: "skill-1",
      title: "Обновленное название",
    };

    const error = new Error("Ошибка изменения навыка");
    mockedModifySkill.mockRejectedValue(error);

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    await store.dispatch(changeSkill(modifyData));

    const state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.error).toBe("Ошибка изменения навыка");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  //* ТЕСТ 12: ОШИБКА ПРИ УДАЛЕНИИ НАВЫКА
  test("Тест ошибки при удалении навыка [removeSkill rejected]", async () => {
    const skillId = "skill-1";
    const error = new Error("Ошибка удаления навыка");
    mockedDeleteSkillById.mockRejectedValue(error);

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    await store.dispatch(removeSkill(skillId));

    const state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.error).toBe("Ошибка удаления навыка");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  //* ТЕСТ 13: ПРОВЕРКА ЧТО CONSOLE.ERROR НЕ ВЫЗЫВАЕТСЯ ПРИ УСПЕШНЫХ ЗАПРОСАХ
  test("Тест проверки что console.error не вызывается при успешных запросах", async () => {
    consoleErrorSpy.mockClear();

    mockedGetSkills.mockResolvedValue({
      data: requestedSkills,
      page: 1,
      totalPages: 1,
    });

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    await store.dispatch(fetchSkills());

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  //* ТЕСТ 14: ПРОВЕРКА СОСТОЯНИЯ PENDING ДЛЯ fetchSkills
  test("Тест состояния loading при получении навыков [fetchSkills pending]", async () => {
    let resolvePromise: (value: PaginatedSkillsResponse) => void;
    const promise = new Promise<PaginatedSkillsResponse>((resolve) => {
      resolvePromise = resolve;
    });

    mockedGetSkills.mockReturnValue(promise);

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    let state = store.getState();
    expect(state.skills.loading).toBe(false);

    const dispatchPromise = store.dispatch(fetchSkills());

    state = store.getState();
    expect(state.skills.loading).toBe(true);

    resolvePromise!({
      data: requestedSkills,
      page: 1,
      totalPages: 1,
    });

    await dispatchPromise;

    state = store.getState();
    expect(state.skills.loading).toBe(false);
  });

  //* ТЕСТ 15: ПРОВЕРКА СОСТОЯНИЯ PENDING ДЛЯ fetchSkillById
  test("Тест состояния loading при получении навыка по ID [fetchSkillById pending]", async () => {
    let resolvePromise: (value: TSkillResponse) => void;
    const promise = new Promise<TSkillResponse>((resolve) => {
      resolvePromise = resolve;
    });

    mockedGetSkillById.mockReturnValue(promise);

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    let state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.addedSkill).toBeNull();

    const dispatchPromise = store.dispatch(fetchSkillById("skill-1"));

    state = store.getState();
    expect(state.skills.loading).toBe(true);
    expect(state.skills.addedSkill).toBeNull();

    resolvePromise!({
      status: true,
      data: requestedSkills[0],
    });

    await dispatchPromise;

    state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.addedSkill).toEqual(requestedSkills[0]);
  });

  //* ТЕСТ 16: ПРОВЕРКА СОСТОЯНИЯ PENDING ДЛЯ appendSkill
  test("Тест состояния loading при добавлении навыка [appendSkill pending]", async () => {
    let resolvePromise: (value: TSkillResponse) => void;
    const promise = new Promise<TSkillResponse>((resolve) => {
      resolvePromise = resolve;
    });

    mockedAddSkill.mockReturnValue(promise);

    const skillData: TSkillData = {
      title: "Игра на нервах",
      description: "Играю профессионально на нервах",
      skillSubcategory: "sub-4-4",
      images: ["https://picsum.photos/seed/skill-1-1/400/300"],
    };

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    let state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.addedSkill).toBeNull();

    const dispatchPromise = store.dispatch(appendSkill(skillData));

    state = store.getState();
    expect(state.skills.loading).toBe(true);
    expect(state.skills.addedSkill).toBeNull();

    resolvePromise!({
      status: true,
      data: {
        ...skillData,
        id: "skill-5",
        userId: "user-1",
        createdAt: "2025-02-14T15:30:00Z",
        updatedAt: "2025-02-14T15:30:00Z",
      },
    });

    await dispatchPromise;

    state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.addedSkill).toBeDefined();
  });

  //* ТЕСТ 17: ПРОВЕРКА СОСТОЯНИЯ PENDING ДЛЯ removeSkill
  test("Тест состояния loading при удалении навыка [removeSkill pending]", async () => {
    // Создаем промис, который возвращает правильный тип { status: boolean }
    let resolvePromise: (value: { status: boolean }) => void;
    const promise = new Promise<{ status: boolean }>((resolve) => {
      resolvePromise = resolve;
    });

    // Мокаем deleteSkillById, чтобы он возвращал промис с правильным типом
    mockedDeleteSkillById.mockImplementation(() => promise);

    const store = configureStore({
      reducer: { skills: skillSlice.reducer },
    });

    // Добавляем навык для удаления
    mockedAddSkill.mockResolvedValue({
      status: true,
      data: requestedSkills[0],
    });
    await store.dispatch(appendSkill(requestedSkills[0] as TSkillData));

    let state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.data).toHaveLength(1);

    // Запускаем удаление без ожидания
    const dispatchPromise = store.dispatch(removeSkill("skill-1"));

    // Проверяем, что loading стал true
    state = store.getState();
    expect(state.skills.loading).toBe(true);

    // Резолвим промис с правильным типом
    resolvePromise!({ status: true });

    await dispatchPromise;

    // Проверяем финальное состояние
    state = store.getState();
    expect(state.skills.loading).toBe(false);
    expect(state.skills.data).toHaveLength(0);
  });
});
