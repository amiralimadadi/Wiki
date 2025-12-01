import type { GoalItem, MenuItemType } from "../types/Interfaces";

export const convertGoalsToMenu = (goals: GoalItem[]): MenuItemType[] => {
  const goalMap: Record<number, MenuItemType> = {};

  goals.forEach((goal) => {
    goalMap[goal.id] = {
      key: goal.id.toString(),
      title: goal.goalTitle,
      path: `/goal/${goal.id}`,
    };
  });

  const menuItems: MenuItemType[] = [];

  goals.forEach((goal) => {
    const menuItem = goalMap[goal.id];

    if (goal.parentId && goalMap[goal.parentId]) {
      if (!goalMap[goal.parentId].children) {
        goalMap[goal.parentId].children = [];
      }
      goalMap[goal.parentId].children?.push(menuItem);
    } else {
      menuItems.push(menuItem);
    }
  });

  return menuItems;
};
