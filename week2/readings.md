## Dark Knowledge and Graph Grammars

https://www.cs.utexas.edu/ftp/predator/13SLE.pdf

**My Summary:** I'm not sure how to summarise this in the context of "Embedded Design". The paper describes a method for deriving refinements/expansions of a design, to make "dark knowledge" visible/explicit, such that it would be possible/easier to understand the decisions made in the design process and to reproduce a program that met the design.

How is a derivation (sequence of rewrites according to a graph grammar) an example of dark knowledge? How would you capture it?

- A derivation is an example of dark knowledge since, while it makes the "what" of each step/refinement explicit, it does not necessarily make explict the decisions that led to each refinement.
- Could a decision-table for each step of the derivation be used to capture/make explicit the decisions that led to that particlar refinement
- In addition, if the design is embedded/explicit in the code, each iteration of the code should provide knowledge of who the design has evolved.

<br/>

## My Favourite Principle for Code Quality (Embedded Design)

http://www.pathsensitive.com/2018/02/making-bugs-impossible-illustrating.html

**My Summary:** Explains the concept of encoding the concepts of the design in to the code itself. By explicitly thinking at the design-level first, the code can be structured such that the distinct aspects of the design can be abstracted and made evident in the code.  

Suppose you only refactored this example according to the Don't Repeat Yourself principle or the Single Point of Truth principle. How would that refactoring differ?

- In order to satisfy DRY, the code in the article could have been refactored such that each aspect (e.g. caching/computation/printing) could have been pulled into their own separate methods, rather than rewriting the logic for each stat. However, this would be different from "embedding" the design in an OOP fashion by creating objects that abstracted the concepts of a "Stat" or a "Dashboard" in that these concepts would still have been implicit.