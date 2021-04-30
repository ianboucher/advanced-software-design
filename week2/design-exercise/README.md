## Create a ToDo List Application

Create the core data structures that track state, along with an API that can be connected to any frontend (command-line, web, desktop GUI, etc).

### Version 1:

A user should be able to:
 - Create Todo items
 - Delete Todo items
 - Mark Toto items as done
 - View a list of Todo items

#### Notes:

Common extensions might include:
 - The ability to add subtasks
 - The ability for a user to have several lists
 - The ability to group lists into 'projects' or similar concept
 - Setting due dates (or other properties) on tasks
 - Basic stats on lists, e.g. task count, complete count etc.

The organisation of lists (list-groups/projects, subtasks etc) might lead to the consideration of a fractal structure, e.g. each task having a reference to a parent construct (task-list) rather than the list being a literal list structure containing its todo items directly. This might increase flexibility at the expense of having to compute the contents of the list each time.

Ordering/searching may become important. Users would be likely to want to choose to view tasks in different orders, so choosing a data structure that stores in a particular order probably doesn't make sense. 

#### Reflection

Having looked at the first round of feature requests, I realise that I immediately fell into the "boolean blindness" trap. For the sake of some initial convenience, the use of a boolean for the `isComplete` property gives it no intrinsic meaning and makes the `ITask` interface difficult to extend to cater for additional statuses.

### Version 2:

Extend the design to support the following features:

- Assigning more statuses to todo items (e.g.: in-progress, under review, blocked)
- Adding due dates to todo items

Ensure the new design makes it easy to filter and display to-do items in whatever way the user may reasonably expect.

#### Notes:

Now that more statuses are allowed, it would be reasonable to forsee that users might want to define their own list of allowable statuses. Would this list of statuses be owned by the TaskList or by all Tasks?

Sorting on due-dates is potentially problematic given that due-dates must be optional. What should be the "empty" date-type and how should they be sorted?

Given that `toggleComplete()` is in the original interface, I am forced to make this work with the new list of statuses, which will probably involve keeping track of the previous status and knowing which status/statuses are considered "complete".

#### Reflection:
After consideration of allowing for users creating their own statuses, rather than restricting them to a predifined list, I decided to abandon the idea since I lost too much time on figuring out how to retain some type-safety and adhere to the representable/valid principle. Some of this pain was caused by the initial decision to represent done/not-done as a boolean and providing a method called "toggleComplete".

In hindsight, I can see that forcing the user to provide an `ownerId` to the `TaskService.getAll()` method as this assumes that the user will only ever want to get tasks that belong to a single list.

