enum PlayerSymbol {
    O = '0',
    X = 'X'
}

export enum Result {
    DRAW,
    PLAYER1,
    PLAYER2,
}

export type CellRef = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type Move = [CellRef, PlayerSymbol];
export type PlayerOneMove = [CellRef, PlayerSymbol.O]
export type PlayerTwoMove = [CellRef, PlayerSymbol.X]

export type MoveSequence = [
    PlayerOneMove?,
    PlayerTwoMove?,
    PlayerOneMove?,
    PlayerTwoMove?,
    PlayerOneMove?,
    PlayerTwoMove?,
    PlayerOneMove?,
    PlayerTwoMove?,
    PlayerOneMove?
];

export interface IBoard {
    readonly moveSequence: MoveSequence
    isPositionOccupied(): boolean
}

export interface IBoardStart extends IBoard {
    move(move: PlayerOneMove): IBoardReadyPlayer2
}

export interface IBoardReadyPlayer1 extends IBoard {
    move(move: PlayerOneMove): IBoardReadyPlayer2 | IBoardEnd
    takeMoveBack(): IBoardReadyPlayer2
}

export interface IBoardReadyPlayer2 extends IBoard {
    move(move: PlayerTwoMove): IBoardReadyPlayer1 | IBoardEnd
    takeMoveBack(): IBoardReadyPlayer1
}

export interface IBoardEnd extends IBoard {
    whoWonOrDraw(): Result
}

class NewBoard implements IBoardStart {
    public moveSequence: MoveSequence

    constructor(moveSequence: MoveSequence) {
        this.moveSequence = moveSequence
    }

    move(move: PlayerOneMove): IBoardReadyPlayer2 {
        return new PlayerTwoReady([]);
    }
    isPositionOccupied() {
        return false;
    } 
}

class PlayerOneReady implements IBoardReadyPlayer1 {
    public moveSequence: MoveSequence

    constructor(moveSequence: MoveSequence) {
        this.moveSequence = moveSequence
    }

    move(move: PlayerOneMove): IBoardEnd | IBoardReadyPlayer2 {
        return new PlayerTwoReady([])
    }
    isPositionOccupied() {
        return false;
    }
    takeMoveBack() {
        return new PlayerTwoReady([])
    } 
}

class PlayerTwoReady implements IBoardReadyPlayer2 {
    public moveSequence: MoveSequence

    constructor(moveSequence: MoveSequence) {
        this.moveSequence = moveSequence
    }

    move(move: PlayerTwoMove): PlayerOneReady | IBoardEnd {
        return new PlayerOneReady([])
    }
    isPositionOccupied() {
        return false;
    }
    takeMoveBack() {
        return new PlayerOneReady([])
    }  
}
