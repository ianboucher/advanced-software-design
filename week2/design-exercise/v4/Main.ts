import { Dao, Filter, Sort } from "./Dao";
import { ITask, ITaskPublic, Status, Task } from "./Task";
import { ITaskListPublic, TaskList } from "./TaskList";
import { TaskListService } from "./TaskListService";
import { TaskService } from "./TaskService";
import { Friend, IFriend, IListUser, User } from "./User";
import { FriendService, UserService } from "./UserService";

(() => {
    const friendService = new FriendService(new Dao<Friend>())
    const taskService = new TaskService(new Dao<Task>());
    const listService = new TaskListService(new Dao<TaskList>(), taskService);
    const userService = new UserService(new Dao<User>(), { listService, friendService });
    
    const me = userService.create("Ian Boucher");
    const myTaskList = listService.create("My First Task List");
    me.addList(myTaskList);

    myTaskList.addTask("My First Task");
    myTaskList.addTask("My Second Task");
    myTaskList.addTask("My Third Task");

    let tasks: ITask[] = myTaskList.getTasks();
    
    tasks[0].isComplete();
    tasks[0].toggleComplete();
    taskService.save(tasks[0]);
    
    tasks[1].setStatus(Status.INPROGRESS);
    taskService.save(tasks[1]);

    const isCompleteFilter: Filter = { field: "status", comparator: (val: Status) => val === Status.COMPLETE }
    let completeTasks: ITask[] = myTaskList.getTasks({ filter: isCompleteFilter });
    myTaskList.removeTask(completeTasks[0]);

    const sortAsc: Sort = { field: "dueDate", comparator: (a: number | null, b: number | null) => b - a};
    let sortedTasks = myTaskList.getTasks({ sort: sortAsc });

    const alice: IListUser = userService.create("Alice");
    const aliceTaskList: TaskList = listService.create("Alice's Task List");
    listService.save(aliceTaskList);
    alice.addList(aliceTaskList);
    userService.save(alice);

    me.addFriend(alice);

    const myFriendAlice: IFriend = me.getFriends().filter(f => f.name === "Alice")[0];
    const aliceList: ITaskListPublic = myFriendAlice.getLists()[0];
    const aliceTasks: ITaskPublic[] = aliceList.getTasks(); 
    aliceTasks[0].getStatus();

    const myTasks = me.getLists()[0].getTasks();
    const myTaskNames = myTasks.map(task => task.name);
    // This would be shockingly inefficient!!!!
    taskService.getAll("", { filter: { field: "name", comparator: (val: string) => myTaskNames.includes(val)}})

    const count = taskService.countMatching({ field: "name", value: "My First Task" });
})()