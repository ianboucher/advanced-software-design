import { TaskListService } from "./TaskList";
import { ITask, TaskService, Task, Status } from "./Task";
import { Dao, Filter, Sort } from "./Dao";
import { TaskList } from "./TaskList";

(() => {
    const taskService = new TaskService(new Dao<Task>());
    const listService = new TaskListService(new Dao<TaskList>(), taskService);
    const taskList = listService.create("My First Task List");

    taskList.addTask("My First Task");
    taskList.addTask("My Second Task");
    taskList.addTask("My Third Task");

    let tasks: ITask[] = taskList.getTasks();
    
    tasks[0].isComplete();
    tasks[0].toggleComplete();
    taskService.save(tasks[0]);
    
    tasks[1].setStatus(Status.INPROGRESS);
    taskService.save(tasks[1]);

    const isCompleteFilter: Filter = { field: "status", comparator: (val: Status) => val === Status.COMPLETE }
    let completeTasks: ITask[] = taskList.getTasks({ filter: isCompleteFilter });
    taskList.removeTask(completeTasks[0]);

    const sortAsc: Sort = { field: "dueDate", comparator: (a: number | null, b: number | null) => b - a};
    let sortedTasks = taskList.getTasks({ sort: sortAsc });
})()