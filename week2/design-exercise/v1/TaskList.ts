import { Filter, IDao } from "./Dao";
import { ITaskService, ITask } from "./Task"

type TaskListProps = {
    id: string;
    ownerId?: string;
    name: string;
}

export interface ITaskList<T> extends TaskListProps {
    getTasks(): T[];
    addTask(name: string): void;
    removeTask(task: T): void;
}

export class TaskList implements ITaskList<ITask> {
    public readonly id: string;
    public ownerId: string;
    public name: string;
    private tasks: ITask[];
    private taskService: ITaskService

    constructor(props: TaskListProps, taskService: ITaskService) {
        this.id = props.id;
        this.ownerId = props.ownerId;
        this.name = props.name;
        this.tasks = props.id ? taskService.getAll(props.id) : [];
        this.taskService = taskService;
    }

    public getTasks(): ITask[] {
        this.tasks = this.taskService.getAll(this.id);
        return this.tasks;
    }

    public getTaskCount(): number {
        return this.tasks.length;
    }

    public addTask(name: string): void {
        const task = this.taskService.createTask(this.id, name);
        this.tasks.push(task);
    }

    public removeTask(task: ITask): void {
        this.tasks = this.tasks.filter(t => t.id !== task.id)
        this.taskService.delete(task.id);
    }
}

export interface ITaskListService<T> {
    getAll(ownerId: string): T[]
    get(id: string): T
    create(name: string, ownerId: string): T
    save(taskList: T): void
}

export class TaskListService implements ITaskListService<TaskList> {
    private dao: IDao<TaskList>;
    private taskService: ITaskService;

    constructor(dao: IDao<TaskList>, taskService: ITaskService) {
        this.dao = dao;
        this.taskService = taskService;
    }

    public getAll(ownerId: string): TaskList[] {
        const filter: Filter = { field: ownerId, comparator: (a: string) => a === ownerId }; 

        return this.dao.getAll({filter});
    }

    public get(id: string): TaskList {
        return this.dao.get(id)
    }

    public create(name: string, ownerId?: string): TaskList {
        const listProps = {
            id: this.dao.nextId(),
            name: name,
            ownerId: ownerId ?? "",
        };
        const list = new TaskList(listProps, this.taskService);
        this.dao.save(list);
        return list; 
    }

    public save(taskList: TaskList): void {
        this.dao.save(taskList);
    }

}