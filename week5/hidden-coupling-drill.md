# Hidden Coupling drill

_For each code sample below, answer the following three questions:_

1. _What is the coupling in this example?_
2. _Is the coupling visible or hidden?_
3. _If the coupling is hidden, then how can I remove it?_

<br/>

## Example 1

```java
public void foo() {
  bar(1, 2, 3);
}

public void bar(int a, int b, int c) {
  System.out.println(a + b + c);
}
```

1. The method `foo` is coupled to `bar` via `bar`'s signature - if the number or type of arguments change then `foo` will need to be updated
2. This is visible coupling since the change discussed above will cause the code to fail compilation
3. N/A

<br/>

## Example 2

```c
char *str = "Hello, ";
char *buf = malloc(8+strlen(name));
strcat(buf, str, name);
```

1. There is coupling between the variables `*str` and `*buf` since `*buf` assumes the length of the prefix/greeting when allocating memory
2. This is hidden coupling. If the length of the greeting in `*str` were to change, this would compile but the greeting could be truncated (or leave extra whitespace) when concatenated with name as it was assumed it would have a fixed lenth of 7 chars. 
3. Introducing a direct reference to to the length allocted in `*str` when allocating space for `*buf` would make the hidden coupling visible and ensure sufficient space allocation if the greeting string changed.

```c
char *str = "Hello, ";
char *buf = malloc(strlen(str)+strlen(name));
strcat(buf, str, name);
```

<br/>

## Example 3

```c
struct Game {
   ....
   Player players[2];
   ....
}


for (int i = 0; i < 2; i++) {
  if (game.players[i].isVictorious()) {
      ....
  }
}
```

1. There is coupling between the loop and the initialisation of the `players` array because the loop assumes the number of players will always be two.
2. This is hidden coupling. The length of the `players` array can change without compilation errors, but runtime errors would occur if the array length decreased, or more likely, the number of players could increase, causing the loop not to range over all players and hence may not find the winner.
3. This hidden coupling can be eliminated by ensuring the loop references the length of the `players` array directly

```c
struct Game {
   ....
   Player players[2];
   ....
}


int nPlayers = sizeof players / sizeof players[0];

for (int i = 0; i < nPlayers; i++) {
  if (game.players[i].isVictorious()) {
      ....
  }
}
```

<br/>

## Example 4

```py
def user_history(days = 90):
  # Do 90 days of history by default
  for i in xrange(days):
    # do stuff
```

1. There is coupling for callers of `user_history` that rely upon the default of 90 days. For example, the expected behavour of a UI could break if this default value were to change.
2. This coupling is hidden, since this default value could change arbitrarily causing changes in behaviour of client code, without overtly breaking it.
3. This coupling could be removed by removing the default value and ensuring callers always set the number of days history they wish to process.

```py
def user_history(days): # is there still coupling? Are the additional steps required for Python?
  for i in xrange(days):
    # do stuff
```

<br/>

## Example 5

```java
public class A {
  public void log() {
    ....
    writeLineToFile("log.txt", ...)
    ....
  }
} 

public class B {
  public void b() {
    ....
    writeLineToFile("log.txt", ...)
    ....
  }
}
```

1. There is potential coupling between these classes via the dependence of `writeLineToFile` on the `log.txt` file. A developer working on class `B` could relocate the file or change its name/format which could affect the behavour of class `A` (and vice-versa).
2. This is hidden coupling. Either class could change the hard-coded filename without causing compilation errors. Depending on the implementation of `writeLineToFile`, immediate runtime errors may not occur, but there might be subtle unexpected behaviour if the system expects that both classes will write to the same file.
3. Assuming the desired behaviour is that both classes will continue to write to the same file, and that there is no other relationship between classes `A` and `B` (e.g. inheritance can't be used), I would extract the reponsibility of actually writing to the file to another class, which could be initialised before passing-in to each class

```java
public class Logger {
  private String filepath;

  public Logger(String filepath) {
    this.filepath = filepath;
  }

  public void log(String text) {
    writeLineToFile(this.filepath, text);
  }
}

// For better or worse, I would probably rely on a DI framework to 
// init this logger and inject into the dependent classes.
Logger logger = new Logger("log.txt");

public class A {
  private Logger logger

  public A(Logger logger) {
      this.logger = logger
  }

  public void log() {
    ....
    logger.log(...)
    ....
  }
} 

public class B {
  private Logger logger

  public B(Logger logger) {
    this.logger = logger
  }

  public void b() {
    ....
    logger.log(...)
    ....
  }
}
```

<br/>

## Example 6

**Server**
```py
def handleRequest(request):
  username = request["username"]
  password = request["password"]
  # …
```

**Client**
```html
<form ...>
  <input type="text" name="username"></input>
  <input type="text" name="password"></input>
  <button type="submit"></button>
</form>
```

1. There is coupling between the `name` attributes applied to the `input` fields of the HTML `form` and the keys that the request handler expects to be present
2. This is hidden coupling - there is nothing at all preventing a developer changing the `name` attributes without updating the request handler correspondingly. Errors would only be discovered at runtime.
3. Assuming the use of a traditional MVC web-framework, I would use "form-model binding" or generation of the form from "model" data to introduce direct coupling between the form and the data. I'm not sure how to do this with Django, but something like:  

```py
class AuthController:
  def handleRequest(request):
    user.username = request["username"]
    user.password = request["password"]

class SignInForm(ModelForm):
  class Meta:
    model = User
    exclude = ['title', 'firstname', 'lastname']
```

<br/>

## Example 7

```java
openFile("prog/imgs/combat_images/MONSTER1.gif");
openFile("prog/imgs/combat_images/FIREBALL.gif");
```

1. Whilst I don't believe these two lines of code are coupled to each other, there is coupling of these calls to the name and path of the files they reference.
2. Changes to the filename or location will not cause compilation errors, but the code would "break" at runtime since it would not be able to open the files. Assuming that open file would throw an exception in this case, I believe this would constitute visible coupleing.
3. N/A

<br/>

## Example 8

```java
class Rectangle { public int getArea() { ... } }
class Circle { public int getArea() { ... } }

class GraphicsProgram {
   ...
   private Color computeAverageColor() {
     for (Rectangle r : this.rectangles) { ... }
     for (Circle c : this.circles) { ... }
   }
}
```

1. My assumption is that the `computeAverageColor` method would go on to call `getArea` for each rectangle and each circle. While the method name could be changed independently (since the calulation uses separate loops for each shape), coupling is introduced between the two shape classes due to the fact that in order to calculate the average, the unit of area must be the same.
2. This is hidden coupling. If `Rectangle` were to return its area in m^2 and `Circle` in ft^2, there would be no compile-time error, but the downstream calculation of average color may be incorrect (assuming a relation to area).
3. The method signature for `getArea` could be changed to force the caller to provide a `units` enum value (e.g. `METRES2`) to ensure visible coupling/consistency across the calls for each shape.

<br/>

## Example 9

```java
String[] recipeNames     = { "Fried calamari", "Spaghetti with meatballs", "Apple pie", ... };
RecipeType[] recipeTypes = { APPETIZER, ENTREE, DESSERT, ... } 
```

1. It appears that there is coupling here caused by reliance on the order of each array - `recipeNames[0]` corresponds to `recipeTypes[0]` and so on.
2. This is hidden coupling since there is no direct, compile-time relationship between `recipeName` and `recipeTypes`. A developer would be free to change either arbitrarily without compilation errors, but undesirable runtime behaviour would likely result.
3. This coupling could be made visible by combining recipe names and types into a single record:

```java
enum RecipeType { APPETIZER, ENTREE, MAIN, DESSERT };
public record Recipe(String name, RecipeType type) {};

Recipe[] recipes = {
    new Recipe("Fried calamari", APPETIZER),
    new Recipe("Spaghetti with meatballs", ENTREE),
    new Recipe("Apple pie", DESSERT),
};

```