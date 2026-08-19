import { SexRadioGroup, SkillOptionRadioGroup } from "./radio-groups";
import styles from "./filter.module.css";
import {
  CityCheckboxGroup,
  SkillSubcategoryCheckboxGroup,
} from "./checkbox-groups";
import {
  setSkillOption,
  setGender,
  setSubCategoryIds,
  setCities,
} from "../../services/filter/slice.ts";
import { useDispatch, useSelector } from "../../services/store.ts";
import { useMemo } from "react";

export const FilterBar = () => {
  const dispatch = useDispatch();

  const skillValue = useSelector((state) => state.filter.skillOption);
  const genderValue = useSelector((state) => state.filter.gender);
  const selectedSkills = useSelector((state) => state.filter.subCategoryIds);
  const selectedCities = useSelector((state) => state.filter.cities);

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (skillValue && skillValue !== "all") {
      count += 1;
    }

    if (genderValue && genderValue !== "all") {
      count += 1;
    }

    count += selectedSkills.length;

    count += selectedCities.length;

    return count;
  }, [skillValue, genderValue, selectedSkills, selectedCities]);

  return (
    <div className={styles.filter}>
      <h2 className={styles.title}>
        Фильтры {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </h2>
      <div className={styles.container}>
        <SkillOptionRadioGroup
          value={skillValue}
          onChange={(value) => dispatch(setSkillOption(value))}
        />
        <SkillSubcategoryCheckboxGroup
          value={selectedSkills}
          onChange={(value) => dispatch(setSubCategoryIds(value))}
        />
        <SexRadioGroup
          value={genderValue}
          onChange={(value) => dispatch(setGender(value))}
        />
        <CityCheckboxGroup
          value={selectedCities}
          onChange={(value) => dispatch(setCities(value))}
        />
      </div>
    </div>
  );
};
