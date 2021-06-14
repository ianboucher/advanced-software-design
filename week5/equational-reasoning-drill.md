# Changing a function call

_Here is the basic rule for reducing a function application of 1 argument. There are analagous rules for functions of multiple arguments. The substitution operator [a/x]M follows the semantics described in the Hoare logic drill._

```java
((x) -> M)(a) -> [a/x]M
```

_Use this, together with the basic rules of algebra, to show the following equivalence:_

```java
((x, y) -> x + y + 1)(a + 1, b) === ((x, y) -> x + y + 1)(a, b + 1)
```

### Ans:

```java
// Show forall (x: int), (y: int):
((x, y) -> x + y + 1)(a + 1, b) === ((x, y) -> x + y + 1)(a, b + 1)

// Substitute (a + 1, b)
[a + 1 / x],[b / y](x + y + 1) -> a + 1 + b + 1 === a + b + 2

// Substitute (a, b + 1)
[a / x],[b + 1 / y](x + y + 1) -> a + b + 1 + 1 === a + b + 2
```

<br/>

# Swapping an if Statement

_Using these rules for booleans:_

```java
if (true)  x else y -> x
if (false) x else y -> y
!true -> false
!false -> true
```

_Prove the following equivalence. You'll need to quantify over x, showing that this equivalence is valid if you substitute in all possible values for x (i.e.: true and false)._

```java
if (x) a else b === if (!x) b else a
```

### Ans:
```java
// Show forall (x: Bool): 
if (x) a else b === if (!x) b else a

// Case x = true
if (true)  a else b -> a // NOTATION: should this be '=' rather than '->'?
if (!true) b else a -> a

// Case x = false
if (false)  a else b -> b
if (!false) b else a -> b
```

<br/>

# Un-nesting an if statement

_We now add the basic evaluation rules for && and ||:_

```java
true  && true  -> true
true  && false -> false
false && true  -> false
false && false -> false

true  || true  -> true
true  || false -> true
false || true  -> true
false || false -> false
```

_Note that these define && and || as pure mathematical operators, without short circuiting. Use them along with previous rules to show the following equivalences:_

```java
if (x) { if (y) a else b  } else b
              ===
if (x && y) a else b

if (x) a else { if (y) a else b }
              ===
if (x || y) a else b
```

### Ans:
```java
// Show forall (x: Bool), (y: Bool):
if (x) { if (y) a else b  } else b
              ===
if (x && y) a else b

// Case x = true, y = true
if (true) { if (true) a else b } else b             = a
if (true && true) a else b -> if (true) a else b    = a

// Case x = true, y = false
if (true) { if (false) a else b } else b            = b
if (true && false) a else b -> if (false) a else b  = b

// Case x = false, y = true
if (false) { if (true) a else b } else b            = b
if (false && true) a else b -> if (false) a else b  = b

// Case x = false, y = false
if (false) { if (false) a else b } else b           = b
if (false && false) a else b -> if (false) a else b = b

// QED
```

<br/>

# Conditional-to-function
_This exercise uses assignments. This rule gives the semantics for assigning to a variable which is never re-assigned, similar to the let statement found in functional languages. It says that, to evaluate an assignment of a value to a variable x, you replace all later uses of that variable with the value._

```java
x = A; M -> [A/X]M
```

_Use it along with previous rules to show how you can replace a conditional with a function call. This is similar to something you had to do in the "Simpler and More Correct" drill from the unit on the Representable/Valid Principle. This often takes the form of the "Replace Conditional with Polymorphism" refactoring._

```java
if (A) o.foo() else o.bar()
              ===
f = if (A) (() -> o.foo()) else (() -> o.bar());
f()
```

### Ans:
```java
// Show forall (A: Bool)
if (A) o.foo() else o.bar()
              ===
f = if (A) (() -> o.foo()) else (() -> o.bar());
f()

// Case A = true
f = if (true) (() -> o.foo()) else (() -> o.bar());
f()                            = o.foo()
if (true) o.foo() else o.bar() = o.foo()

// Case A = false
f = if (false) (() -> o.foo()) else (() -> o.bar());
f()                             = o.bar()
if (false) o.foo() else o.bar() = o.bar()
```
**NB: Very unsure about this answer. I don't appear to have used the assignment rule explicitly**

_How does this help remove if-statements?_

The previous change clearly did not remove the if-statement, but only moved it and added some indirection. How can this help clear up code?_

_At some point, the program needs to do something different based on some fact. The way to destroy an if-statement is to move the decision to a point where that fact is already known._

_The transformation above is the first step. It allows us to move the if-statement to a distant part of the code, perhaps into a caller or a caller of the caller. At some point in the program, the value of A may be known. By moving the if-statement there, it can be collapsed._
