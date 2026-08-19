export type TSelectedFilterItem = {
  id: string;
  label: string;
};

export type TSelectedFiltersProps = {
  filters: TSelectedFilterItem[];
  onRemove?: (id: string) => void;
  onReset?: () => void;
  className?: string;
};
