
import { EGAME_RESULT, EPLAY_ITEM } from "typing/typing";

export function generateBoardNxN(n: number) {
  return new Array(n).fill(0).map(_ => new Array<EPLAY_ITEM>(n).fill(EPLAY_ITEM.EMPTY));
}

export function evaluateBoard(board: EPLAY_ITEM[][], boardSize: number): EGAME_RESULT {

    /* All rows evaluation */
    for(const rows of board) {
      const rowAsSet = new Set(rows);
      if(rowAsSet.size === 1 && !(rowAsSet.has(EPLAY_ITEM.EMPTY))) return EGAME_RESULT.WON;
    }
    
    /* Diagonals evaluation */
    const diagSet = new Set();
    const crossDiagSet = new Set();
    for(let i = 0; i < board.length; i++) {
      diagSet.add(board[i][i]);
      crossDiagSet.add(board[i][(boardSize - i) - 1]);
    }

    if((diagSet.size === 1 && !(diagSet.has(EPLAY_ITEM.EMPTY))) || 
      (crossDiagSet.size === 1 && !(crossDiagSet.has(EPLAY_ITEM.EMPTY)))) return EGAME_RESULT.WON;

    /* All cols evaluation */
    const cols = new Set();
    for(let col = 0; col < boardSize; col++) {
      for(let row = 0; row < boardSize; row++) {
        cols.add(board[row][col]);
      }
      if(cols.size === 1 && !(cols.has(EPLAY_ITEM.EMPTY))) return EGAME_RESULT.WON;
      cols.clear();
    }

    const filteredBoard = board.flatMap(rows => rows.filter(row => row === EPLAY_ITEM.EMPTY));
    
    return filteredBoard.length === 0 ? EGAME_RESULT.DRAW : EGAME_RESULT.NONE;
}