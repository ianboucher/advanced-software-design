### Exercise 2

```
{ a = 0 }
b := 2 - a
{ b = 2 }
c := b * 2
{ c = 4 }
d := c + 1
{ d = 5 }
```

### Exercise 3

```
{ x > 0 }
y := (x / 2) * 2
{ ((x is odd) ->  y = x - 1) /\ ((x is even) -> y = x), x > 0 }
z :=  x - y
{ ((x is odd) ->  z = 1) /\ ((x is even) -> z = 0), x > 0 }
a :=  z * 5 + (1 - z) * 12
{ ((x is odd) ->  a = 5) /\ ((x is even) -> a = 12) }
```
