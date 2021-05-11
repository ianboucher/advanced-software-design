## Exercise 1

The following gives code for managing a laundromat. There are many washing machines it can control. There is also a website where users can see which laundry machines are currently in use.

The  website  should  not  be  able  to  control  the  washing  machines,  nor  accessinternal details about the state of the washer.  We want to enforce this program-matically.

```java
public class WashingMachine {
    private final static int LAUNDRY_MODELOW;
    private final static int LAUNDRY_MODEMEDIUM;
    private final static int LAUNDRY_MODEHIGH;

    public void run(int time, int temp, int mode);
    public void turnOff;
    public boolean isOn();

    public int getWeightOfClothesInWasher();
    public int getCurrentTemperature();
    public int getNumberOfQuarters();
}

public class LaundryDisplay {
    public HttpResponse;
    ...
}

public class Laundromat {
    private final List<WashingMachine> washers;
    ...
}
```

1. _Suppose you’re writing code that needs to turn the laundry machine on by calling the `run` method. There are at least  four ways to accidentally call the `run` method incorrectly. (This is just counting single calls to `run`, notcounting errors like calling `run` on a running machine.) What are they,and how would you prevent misuse?_

    Callers could:
    
    -  pass an int for `mode` that is not represented by one of the static variables defined by the class
    - accidentally pass parameter values out-of-order (e.g. time & temp swapped) since all paramters of of type `int`
    - pass negative (or large positive) values for any of the parameters
    - misinterpret the units of time or temperature (e.g. passing a time value in seconds when minutes are expected)
    - ???

    To mitigate against these issues:

    - accept a POJO with named fields e.g: `timeInSec`, `tempInCelcius` and `washMode` 
    - accept `enum` type consisting of only allowable values for `mode` (or indeed time & temp)
    -  ???

2. _In the first design, `LaundryDisplay` contains its own  copy of the list of `WashingMachines`. How would you enforce that it can only access whether a laundry machine is on?_

    One of:

    - Extract a more limited interface (say `WashingMachineState`) containing only the `isOn` method of `WashingMachine` and have `LaundryDisplay` consider its list of machines to contain objects adhering this more limited interface, thus preventing other methods being accessed on machines obtained through `LaundryDisplay`
    
    -  Ensure the list of machines was private to `LaundryDisplay` and only enable callers to access machine state via a get method on `LaundryDisplay` e.g.

        ```java
        public class LaundryDisplay {
            private final List<WashingMachine> washers;
            public MachineState getMachineState(String washerId)
        }
        ```
3. _In the second design, LaundryDisplay has a reference to the Laundromat, but not to the WashingMachine’s.  How would you enforce that it can onlyaccess whether a laundry machine is on?_

    - Similar to the solution outlined above, I would extract a more limited interface from `Laundromat` & `WashingMachine`, and constrain `LaundryDisplay` to expect those interfaces and therefore only be able to call the restricted methods e.g.

    ```
    # insert sketched code example here...
    ```

## Exercise 2

Design an API for a Tic-Tac-Toe board, consisting of types representing states of the board, along with functions `move`, `takeMoveBack`,`whoWonOrDraw`, and `isPositionOccupied`

- All functions must be pure.  If you write a function, it must be callable with the same arguments and always get the same results, forever
- All functions must return a sensible result, and may not throw exceptions
- If I call `move` on a tic-tac-toe board, but the game has finished, I should get a compile-time type-error. In other words, calling `move` on inappropriate game states (i.e. move doesnt make sense) is disallowed by the types
- If I call `takeMoveBack` on a tic-tac-toe board, but no moves have yet been made, I get a compile-time type-error
- If I call `whoWonOrDraw` on a tic-tac-toe board, but the game hasn't yet finished, I get a compile-time type-error
- `isPositionOccupied` works for in-play and completed games.

### Notes

- There are 255168 potential board 'states' representing each combination of markers - clearly impractical to model each of these!
- Given an empty board, Player 1 is to move
- Given Player 1 has moved, Player 2 must move next
- Game is over when one player has placed 3 markers along any horizontal, vertical or diagonal
- Once game is over, only possible results are a draw or Player 1 or 2 has won
- The sequence of moves must be stored to facilitate `takeMoveBack` (e.g. use stack?)
- Cannot call `takeMoveBack` on empty board, which implies a separate type to represent empty board is necessary
- Cannot call `whoWonOrDraw` unless board is in a "game-over" state
- Cannot call `move` if board _is_ in "game-over" state
- Types that represent arguments to `move` that are distict for each state may further define the API

```ts
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

// Outline implementation of one of the states
class PlayerOneReady implements IBoardReadyPlayer1 {
    public readonly moveSequence: MoveSequence

    constructor(moveSequence: MoveSequence) {
        this.moveSequence = moveSequence;
    }

    move(move: PlayerOneMove): IBoardEnd | IBoardReadyPlayer2 {
        // check propose move is valid
        // copy moveSequence and add latest move
        return new PlayerTwoReady(updatedSeq)
    }

    takeMoveBack() {
        // copy moveSequence and remove last move
        return new PlayerTwoReady(updatedSeq)
    }
    ...
}
```

