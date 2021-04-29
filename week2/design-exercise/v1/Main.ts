import { TaskListService } from "./TaskList";
import { ITask, TaskService, Task } from "./Task";
import { Dao } from "./Dao";
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
    taskList.removeTask(tasks[1]);
})()