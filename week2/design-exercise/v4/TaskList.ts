import { Filter, Query } from "./Dao";
import { IServiceReadonly } from "./Service";
import { ITask, ITaskPublic, ITaskReadonly, Visibility } from "./Task"
import { ITaskService } from "./TaskService";

export interface ITaskListReadonly<T> {
    id: string;
    ownerId?: string;
    name: string;
    getTasks(): T[];
}

export interface ITaskListPublic extends ITaskListReadonly<ITaskPublic> {
    getTasks(): ITaskPublic[]
}

export interface ITaskList extends ITaskListReadonly<ITask> {
    addTask(name: string): void;
    removeTask(task: ITask): void;
}

type TaskListProps = {
    id: string;
    ownerId?: string;
    name: string;
}

export abstract class TaskListReadonly implements ITaskListReadonly<ITask | ITaskReadonly> {
    public id: string;
    public ownerId?: string;
    public name: string;

    constructor(props: TaskListProps, taskService: ITaskService | IServiceReadonly<ITaskPublic>) {
        this.id = props.id;
        this.ownerId = props.ownerId;
        this.name = props.name;
    }
    
    public getTasks(): ITask[] | ITaskReadonly[] {
        return [];
    };
}

export class TaskList extends TaskListReadonly implements ITaskList {
    private tasks: ITask[];
    private taskService: ITaskService

    constructor(props: TaskListProps, taskService: ITaskService) {
        super(props, taskService)
        this.tasks = props.id ? taskService.getAll(props.id) : [];
        this.taskService = taskService;
    }

    public getTasks(query?: Query): ITask[] {
        return this.taskService.getAll(this.id, query)
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

export class TaskListPublic extends TaskListReadonly implements ITaskListPublic {
    private tasks: ITaskPublic[];
    private taskService: IServiceReadonly<ITaskPublic>

    constructor(props: TaskListProps, taskService: IServiceReadonly<ITaskPublic>) {
        super(props, taskService);
        this.tasks = props.id ? taskService.getAll(props.id) : [];
        this.taskService = taskService;
    }

    public getTasks(query?: Query): ITaskPublic[] {
        const fn = (val: Visibility) => val === Visibility.PUBLIC;
        const filter: Filter = { field: "visibility", comparator: fn }
        return this.taskService.getAll(this.id, query)
    }
}