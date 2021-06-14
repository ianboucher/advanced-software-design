## The Algebra of Algebraic Datatypes, Part 1, Chris Taylor

https://web.archive.org/web/20160701062300/http://chris-taylor.github.io/blog/2013/02/10/the-algebra-of-algebraic-data-types/

Use the laws of this reading to rewrite this type to not have any sums: (int+string) → bool

```js
(int + string) -> bool

// using the Laws for Functions...
bool^(int + string)

bool^int . bool^string
```