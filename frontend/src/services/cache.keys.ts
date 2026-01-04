export const CacheKeys = {
  board: (boardId: number) => `board_${boardId}`,
  boardList: () => 'board_list',
} as const