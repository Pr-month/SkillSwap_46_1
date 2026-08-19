const getNumberAgeFromBirthDate = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Если день рождения еще не наступил в этом году
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const formatAgeWithDeclension = (age: number): string => {
  const lastDigit = age % 10;
  const lastTwoDigits = age % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${age} лет`;
  }

  if (lastDigit === 1) {
    return `${age} год`;
  }

  if (lastDigit === 2 || lastDigit === 3 || lastDigit === 4) {
    return `${age} года`;
  }

  return `${age} лет`;
};

export const getAgeFromBirthDate = (birthDate: string): string => {
  const age = getNumberAgeFromBirthDate(birthDate);
  return formatAgeWithDeclension(age);
};
