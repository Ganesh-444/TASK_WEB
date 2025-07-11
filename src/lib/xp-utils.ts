export const XP_PER_LEVEL = 100;

export const calculateLevelInfo = (totalXp: number) => {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = totalXp % XP_PER_LEVEL;
  const xpForNextLevel = XP_PER_LEVEL;
  const progress = (xpInCurrentLevel / xpForNextLevel) * 100;

  return {
    level,
    xpInCurrentLevel,
    xpForNextLevel,
    progress,
    totalXp,
  };
};
