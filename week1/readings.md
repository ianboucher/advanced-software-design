## The Three Levels of Software:

_Give another example of a defect of modular reasoning ("level 3") which does not result in a code ("level 2") or runtime ("level 1") failure_

The following is an example of an error in modular reasoning that does not presently cause an error in the code:

```typescript
function charFreqs(str: string): { val: number } {
  // return map of ascii code to char count
}

function mostCommonChar(charFreqs: { val: number }: string {
  // keep track of key corresponding to max value and return ascii 
  // char for given key/code
}    
```

The above would work from a runtime/code perspective for all values of str provided that the encoding in `charFreqs` used ASCII. There is no strong guarantee of this and if it were to change, `mostCommonChar` would be incorrect.

<br/>

## The Design of Software is a Thing Apart

_Give another example of when two different (or partially different) design intentions result in the same code._

```typescript
function decrease(val: number): number {
    return val -= 1;
}
```

The function above could correspond to a design which decrements a stock quantity for an ecommerce site, or it could correspond to a simple simulation of a vehicle in which the function was used to decrease speed.

In the first design, the implementation is unlikely to change, whereas in second design, the implementation of the function could change significantly (e.g. by introducing a constant to represent braking coefficient).

(Apologies - in hindsight, this example is perhaps overly contrived)

<br/>

## Painless Functional Specifications

_A software artifact is anything that comes out of the software process: code, diagrams, installers, etc. What artifacts depend on the design spec as advocated by Spoelsky._

- Source code
- Test & QA plans
- Technical & user documentation
- Sales material
- Marketing material