import { useDispatch, useSelector } from "../../services/store.ts";
import {
  resetFilters,
  setSkillOption,
  setGender,
  setSubCategoryIds,
  setCities,
} from "../../services/filter/slice.ts";
import type { ActiveFilterItem } from "../../utils/filter/getActiveFilters.ts";

export const useFilterActions = (activeFilters: ActiveFilterItem[]) => {
  const dispatch = useDispatch();
  const filterState = useSelector((state) => state.filter);

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const handleRemoveFilter = (id: string) => {
    const filter = activeFilters.find((f) => f.id === id);

    if (!filter) {
      return;
    }

    switch (filter.type) {
      case "skillOption":
        dispatch(setSkillOption("all"));
        break;
      case "gender":
        dispatch(setGender("all"));
        break;
      case "city":
        dispatch(setCities(filterState.cities.filter((c) => c !== id)));
        break;
      case "subCategory":
        dispatch(
          setSubCategoryIds(filterState.subCategoryIds.filter((s) => s !== id)),
        );
        break;
      default:
        break;
    }
  };

  return {
    handleResetFilters,
    handleRemoveFilter,
  };
};
