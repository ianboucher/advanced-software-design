### Exercise 1

```shell
# { true }
x = 10;
# { x > 1 }
y = 42
# { x > 1, y > 1 }
z = x + y;
# { z > 1 }
```

**In the example above, how could the code be changed without altering the postcondition?**

- The assignments of x & y could be re-ordered.
- The values of x & y could be changed to any other values greater than 1
- The expression could be changed to combine the values of x & y in a different fashion (e.g. x * y)

**How does the "forgetting" of assertions correspond to a form of modularity?**

Through the "forgetting" of assertions, there are fewer preconditions placed on succeeding lines of code by previous lines of code - in other words, each line of code is less constrained by the current state of the program. This implies that each line of code is easier to change independently and is thus more modular. 

### Exercise 2

**Fill-in the assertions between each line of the code below:**

```shell
# { a = 0 }
b := 2 - a
# { b = 2 }
c := b * 2
# { c = 4 }
d := c + 1
# { d = 5 }
```

### Exercise 3

**Fill-in the assertions between each line of the code below:**

```shell
# { x > 0 }
y := (x / 2) * 2
# { ((x is odd) ->  y = x - 1) /\ ((x is even) -> y = x), x > 0 }
z :=  x - y
# { ((x is odd) ->  z = 1) /\ ((x is even) -> z = 0) }
a :=  z * 5 + (1 - z) * 12
# { ((x is odd) ->  a = 5) /\ ((x is even) -> a = 12) }
```

### Exercise 4

**Fill-in the assertions between each line of the code below:**

```shell
# { true }
d := (2 - (a + 1) / a) / 2;
# { (a <= 0) -> d = 1) /\ (( a > 0) -> d = 0) }
m := d * 2 + (1 - d) * 3;
# { (a <= 0) -> m = 2) /\ ((a > 0) -> m = 3) }
x := b * 2;
# { ((a <= 0) -> m = 2) /\ ((a > 0) -> m = 3), x = 2b }
x := x * 2;
# { ((a <= 0) -> m = 2) /\ ((a > 0) -> m = 3), x = 4b }
x := m * x;
# { ((a <= 0) -> x = 8b /\ ((a > 0) -> x = 12b) }
x := x + 1;
# { ((a <= 0) -> x = 8 * b + 1) /\ ((a > 0) -> x = 12b + 1) }
```

**In what sense does the code above contain a conditional?

- If a > 0, the code will behave differently than if a <= 0, thus necessitating different postconditions predicated on the evaluation of a > 0.

### Exercise 5

**How might the code in Exercise 4 be simplified by "forgetting" information through the reordering of statements and the use of the _consequence_ rule?**

(NEED TO DOUBLE CHECK THAT I HAVE USED THE CONSEQUENCE RULE. COULD a BE FORGOTTEN? COULD EXPRESSIONS FOR d AND m BE SIMPLIFIED?)

```shell
# { true }
x := b * 2;
# { x = 2b }
x := x * 2;
# { x = 4b }
x := x + 1;
# { x = 4b + 1 }
d := (2 - (a + 1) / a) / 2;
# { ((a <= 0) -> d = 1) /\ ((a > 0) -> d = 0), x = 4b + 1 }
m := d * 2 + (1 - d) * 3;
# { ((a <= 0) -> m = 2) /\ ((a > 0) -> m = 3), x = 4b + 1 }
x := m * x;
# { ((a <= 0) -> x = 8b + 1) /\ ((a > 0) -> x = 12b + 1) }
```
