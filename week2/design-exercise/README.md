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

In hindsight, I can see that forcing the user to provide an `ownerId` to the `TaskService.getAll()` method was a poor choice as this assumes that the user will only ever want to get tasks that belong to a single list.

### Version 3

Support a notion of users, where each user has a list of friends and a single todo list. Extend the design to support an "accountability" feature, where users can allow friends to view their todo list and progress. Ensure users can mark some todo items as "private." If a todo item is "private," then no-one may view it or be given any information that it exists.

Make sure to explain how the user interface for viewing a friend's to-do list would work, and in particular how it may reuse code from your normal user interface.

#### Notes

Since a User's task list and private tasks must be accessible via a User class (in order for a user to view their own private tasks), one solution is for the entity returned when accessing a user's friends to be something other than another User.

In addition, once a "Friend" had been obtained, I assumed that it would not be possible to add or remove tasks from their list, or to edit their tasks in any way. The Friend object should return readonly versions of TaskLists and Tasks.

In splitting the interfaces, it should ideally not be possible to return a User instead of a Friend, or a "private" Task instead of a "public" Task.

#### Reflection

I am starting to feel the pain of some of the early versions of the interfaces, as I attempt to use them for more entities. I strongly dislike that a `User` must be newed-up with two service classes, which in turn forces me to pass these services into the `UserService`. I already feels like an overly complex variety of interfaces and classes for a simple application.

Some code re-use was achieved through the use of abstract classes and sub-classing in order to extract the readonly/public versions of the TaskList and Task entities.

### Version 4

Extend the design to support one of the following features:

- Ability to look up, for all users, how many have a todo item with the same name as one of yours. 
- Also, explain how to extend your user interface to display the total number of todo items in the list currently being viewed. This feature is simple, but there are some easy ways to get it wrong.

#### Notes

Assuming that the ability to look up a count of tasks with "the same name as one of yours" indicates that the user would the supply the name to match on, rather than generating a count of tasks that match the name of any in your list. The latter would be possible with a cached task-name vs frequency map.

For the total number of tasks in the currently view list, I am assuming this would disregard any currently applied filters, e.g. if filtering by a status of "in-progress", the count would still show all tasks in the list. For the task-lists belonging to "Friends", the count should exclude any that have been marked private.

#### Reflection

The inadvertent/ill-considered leaking of the Query/Filter abstraction from the DAO layer, all the way up to the client-code is extemely unwise and would undoubtably be hard to change and lead to many problems. Additionally, it would have been useful to have enabled client code to provide several filters at once.

The example implementations are littered with dreadful mistakes - hopefully this doesn't detract too much from the design (good or bad) as my assumption was that the focus should be on the interfaces.