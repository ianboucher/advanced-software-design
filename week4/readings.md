## On the Criteria to be Used in Decomposing Systems Into Modules, David Parnas

http://citeseer.ist.psu.edu/viewdoc/download;jsessionid=EEA35F04282BD1CBB783C6973EA2C41A?doi=10.1.1.132.7232&rep=rep1&type=pdf

_A claim in the article is that, by decomposing the KWIC system into the second modular decomposition in the article, they could put any implementation of the pieces together to create a working system. Come up with a way of designing the pieces that still fits the decomposition, but so that they nonetheless don't work together._

- I'm assuming we can ignore the possibility of incompatible types (if using a dynamically typed language) or incorrect implementations of algorithms etc, 
- The paper specifies the order of the circular shifts in the 2nd modularization, and this is mentioned later as a mistake of revealing too much information. Significantly this order cannot be enforced by the interface as specified.
- It would therefore be possible to implement a circular-shift module that adhered to the decomposition and the specified interface, but which ignored the implied ordering of shifts and stored them out-of-order. 
- Consequently, without the addition of a method on the circular-shift module to identify the line-number associated with a shift, it would not be possible to retrieve this information and therefore display a reference to the line-number for each shift, rendering the program unfit for purpose.

- _What lesson can we take from this?_

- That information-hiding alone is not sufficient to ensure flexibility and correctness. Awareness of other principles are needed alongside information-hiding to ensure we are not reliant upon implicit assumptions. In this case, consideration of the representable/valid principle would help to improve the design of the circular-shift module.


## The Secret History of Information Hiding, David Parnas

https://www.dropbox.com/s/2j812i6347jbbrp/parnas_secret_history.pdf?dl=0

_Have you encountered a story like "The Napkin of Doom" in your own experience? What was the story, and how did it hurt?_

- The most similar anecdote I can recall was a decision to combine two types of user in a codebase and API because their underlying data were similar at that stage in the project. I argued against as it was similar to examples I had read about the "single responsibility principle", but besides quoting this principle, I struggled to provide a persuasive reason not to make the change.
- Over time, one type of user accumulated more capabilities within the system that were not applicable to the other, and with that, more complexity accumulated to restrict access to those capabilities for the less cabable users.

## Research Corner: The Programmer's Apprentice, James Koppel.

https://courses.jameskoppelcoaching.com/courses/1345189/lectures/30856074

_Suppose you wanted to extract out the part of the foo method that computes the sum? How would its dataflow graph help you?_

- By examining the direction of data-flow, the minimum set of data & operations needed to compute the sum can be identified by traversing the graph from node-to-node in the opposite diretion to the arrows, starting from the desired end result, in this case `sum`. Each node that is connected in reverse direction by an arrow should be included in the computation.
- N.B. After returning to this, it's clear that, on the basis of the algorithm above, the less-than operation required for array-iteration would be excluded, so now I'm not sure.

