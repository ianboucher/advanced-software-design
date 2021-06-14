# Algrebraically Refactoring a Weak API

The Python code below gives a simple ToDoItem class with several attributes. Answer the following questions for it:

```py
class ToDoItem:
  def __init__(self, dueDate, description, status, colour, isPublic):
    self.dueDate = dueDate
    self.description = description
    self.status = status
    self.colour = colour
    self.isPublic = isPublic
    
  def updateItem(self, key, value):
    setattr(self, key, value)
```

1. _Imagine a program which takes a `ToDoItem` and sets all its attributes. What will happen if an attribute gets renamed, e.g.: "colour" to "color"?_

    Assuming the proposed program is taking a pre-initialised `ToDoItem` and using the `updateItem` method to set all attributes, a change to an attribute name will break the aforementioned program, since the `updateItem` method assumes knowledge of the attribute-keys used internally by the class. Any renaming of attributes would therefore require the calling program to be updated with the new attribute names.

<br/>

2. _Via the external view, it is possible to describe all states of a `ToDoItem` without referencing the implementation: a state of a `ToDoItem` is a call to the constructor followed by a sequence of calls to `updateItem` such that no key is set twice. Any sequence of calls can be "normalized" into a sequence of this form by removing all but the last call to each key. Using this as a definition of representable state, how does the implementation of `ToDoItem` violate the Representable/Valid principle?_

- The given implementation of `updateItem` (using `setattr`) would allow the caller to set an arbitrary list of attributes on the `ToDoItem` instance
- There is nothing to prevent arbitrary values being set against each key, e.g. `isPublic` implies a boolean and `dueDate` implies a date, but the API does not prevent any values being set against these keys
- Given the possibility for the caller to set arbitrary values against arbitrary keys, it is not possible to describe "all valid states" of a `ToDoItem` 

<br/>

3. Write down the type of the updateItem function (i.e.: the sets of valid inputs and outputs) using the notation from lecture. Change it using algebraic laws to an equivalent type which helps avoid the problems raised in the earlier parts of this question. Update the code accordingly.

    **Hint 1:** This is similar to an example from lecture 

    **Hint 2:** What is the exact set of all legal valid values to the "key" field? Use the notation S(x) to denote the "singleton type" that only contains one element, e.g.: S("hello") is the type that only contains the string hello. You should be able to write the type of all valid keys using the singleton type and the operators introduced in lecture.

```py
def updateItem(self, key, value):
  setattr(self, key, value)

f(updateItem)
    = 1^ [
        S('dueDate')       date
        | S('description') string
        | S('status')      string
        | S('color')       string
        | S('isPublic')    bool
    ]
```

<br/>

# Mechanically Refactoring a Weak API

The Functional Java code below sketches a code pattern that might be found in a game that runs in multiple resolutions. Answer the following questions for it:

```java
public void displayGame(String mode) {
  if (mode.equals("small")) {
    setColorDepth(8);
    drawRect(screen, 1024, 768);
  } else if (mode.equals("medium")) {
    setColorDepth(16);
    drawRect(screen, 1600, 1200);
  }
}
```

1. _Suppose you wanted to write another function which printed the graphical settings associated with each mode. How would you reuse this code to do so?_

Working under the assumption that no changes to the above function are permitted, I cannot think of a way in which another function could use it to print the graphical settings associated with each mode. 

If changes `displayGame` were permitted, one (unappealing) option might be to add a lambda/callback as a parameter, which would allow another function to be passed-in in order to print the settings. This would arguably reveal far too much knowledge about the implementation details of the `displayGame` function

```java

public printSettings(Integer colorDepth, Integer width, Integer height) {
    ...
}

public void displayGame(String mode, Function<Integer, Integer, Integer> fn = null) {
  if (mode.equals("small")) {
    setColorDepth(8);
    drawRect(screen, 1024, 768);
    if (fn != null) {
        printSettings(8, 1024, 768)
    }
  } else if (mode.equals("medium")) {
    setColorDepth(16);
    drawRect(screen, 1600, 1200);
    if (fn != null) {
        printSettings(8, 1024, 768)
    }
  }
}
```

2. _Suppose someone who doesn't speak English is reading some code that invokes displayGame. Assume they had also not read the implementation of displayGame. What information would seeing the "mode" argument being passed in convey to them?_

    A person reading code which calls `displayGame` would have very little information about the meaning of the function. All semantics are contained within the English meaning of the function name and the value of its mode argument. (I would argue that it would be very difficult to convey meaning to someone without sufficient command of the language, whilst adhering to "information hiding")

<br/>

3. _Refactor the function to replace the "mode" argument with something more semantically meaningful. Doing so should also eliminate the conditional._

```java
public class ScreenSettings {
    private int colorDepth;
    private Pair<Integer, Integer> screenSize;

    // getters & setters...
}

public void displayGame(ScreenSettings settings) {
    setColorDepth(settings.getColourDepth());
    drawRect(screen, settings.getScreenWidth(), settings.getScreenHeight())
}
```

<br/>

4. Show how to do this refactoring through a sequence of mechanical steps, as in lecture.

**Hint 1:** Your first step should be to use reverse-substitution to turn both branches into a function call.

```java
public void displayGame(String mode) {
    setScreen = (depth, width, height) -> { // COULD PERHAPS JUST USE A ANON FUNC?
        setColourDepth(depth);
        drawRect(width, height);
    }
    if (mode.equals("small")) {
        setScreen(8, 1024, 768)
    } else if (mode.equals("medium")) {
        setScreen(16, 1600, 1200)
    }
}
```

**Hint 2:** Recall that, in Functional Java, calling a function with several arguments is equivalent to calling it with a single tuple argument. This will help you move the conditional from deciding between two statements, to deciding between two values.

```java
public void displayGame(String mode) {
    Triplet<Integer, Integer, Integer> settings

    setScreen(depth, width, height) -> {
        setColourDepth(depth);
        drawRect(width, height);
    }

    // would need to handle default case in reality
    if (mode.equals("small")) {
        settings = Triplet(8, 1024, 768);
    } else if (mode.equals("medium")) {
        settings = Triplet(16, 1600, 1200);
    }

    setScreen(settings)
}
```

**Hint 3:** A list of arguments is equivalent to a single tuple argument. A tuple is equivalent to a named record (i.e.: a Java object).

```java
public record ScreenSettings(Integer colorDepth, Integer width, Integer height) {};

public void displayGame(String mode) {
    ScreenSettings smallScreen  = new ScreenSettings(8, 1024, 768);
    ScreenSettings mediumScreen = new ScreenSettings(16, 1600, 1200);

    setScreen(ScreenSettings settings) -> {
        setColourDepth(settings.depth);
        drawRect(settings.width, settings.height);
    }

    if (mode.equals("small")) {
        settings = smallScreen; 
    } else if (mode.equals("medium")) {
        settings = mediumScreen;
    }

    setScreen(settings)
}
```

And finally, if it were permitted to change the interface...

```java
public record ScreenSettings(Integer colorDepth, Integer width, Integer height) {};

public void displayGame(ScreenSettings settings) {
    setColourDepth(settings.depth);
    drawRect(settings.width, settings.height);
}

ScreenSettings smallScreen  = new ScreenSettings(8, 1024, 768);
ScreenSettings mediumScreen = new ScreenSettings(16, 1600, 1200);
displayGame(smallScreen)
```

**Hint 4:** You may be tempted to use defunctionalization for this exercise. It actually doesn't help (why?).

I'm stumped on this. My (very limited) understanding is that defunctionalisation is the conversion of higher-order functions to first order functions, which then must be cased-over - as illustrated by the example in the lecture. In this case, I'm unable to see an opportunity for defunctionalisation due to the absence of (obvious) higher-order functions. I will have to admit defeat and wait for the solution!
