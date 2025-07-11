/**
 * Calculates the total XP needed to reach a specific level.
 * @param level The level to calculate the required XP for.
 * @returns The total XP required to reach that level.
 */
export const calculateXpForLevel = (level: number): number => {
  if (level <= 1) {
    return 0;
  }
  let requiredXp = 100;
  let totalXp = 0;
  for (let i = 2; i <= level; i++) {
    totalXp += requiredXp;
    requiredXp = Math.floor(requiredXp * 1.5);
  }
  return totalXp;
};

/**
 * Calculates the XP needed to advance from the current level to the next.
 * @param level The current level.
 * @returns The amount of XP needed to get to the next level.
 */
const getXpForNextLevelUp = (level: number): number => {
    if (level < 1) return 100;
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Calculates the user's current level and progress based on their total XP.
 * @param totalXp The user's total accumulated experience points.
 * @returns An object containing the current level, XP progress, and total XP.
 */
export const calculateLevelInfo = (totalXp: number) => {
  let level = 1;
  let xpForNext = getXpForNextLevelUp(level);
  let xpAtLevelStart = 0;

  while (totalXp >= xpAtLevelStart + xpForNext) {
    xpAtLevelStart += xpForNext;
    level++;
    xpForNext = getXpForNextLevelUp(level);
  }

  const xpInCurrentLevel = totalXp - xpAtLevelStart;
  const progress = (xpInCurrentLevel / xpForNext) * 100;

  return {
    level,
    xpInCurrentLevel,
    xpForNextLevel: xpForNext,
    progress,
    totalXp,
  };
};
