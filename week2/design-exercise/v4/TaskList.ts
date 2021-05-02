import { Filter, Query } from "./Dao";
import { IServiceReadonly } from "./Service";
import { ITask, ITaskPublic, ITaskReadonly, Visibility } from "./Task"
import { ITaskService } from "./TaskService";

export interface ITaskListReadonly<T> {
    id: string;
    ownerId?: string;
    name: string;
    getTasks(): T[];
    getTotalTaskCount(): number;
}

export interface ITaskListPublic extends ITaskListReadonly<ITaskPublic> {
    getTasks(): ITaskPublic[];
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
    
    public abstract getTasks(): ITask[] | ITaskReadonly[];
    public abstract getTotalTaskCount(): number
}

export class TaskList extends TaskListReadonly implements ITaskList {
    private tasks: ITask[];
    private totalCount: number;
    private taskService: ITaskService

    constructor(props: TaskListProps, taskService: ITaskService) {
        super(props, taskService)
        this.tasks = props.id ? taskService.getAll(props.id) : [];
        this.totalCount = this.tasks.length;
        this.taskService = taskService;
    }

    public getTasks(query?: Query): ITask[] {
        // if query === prev-query return this.tasks;
        this.tasks = this.taskService.getAll(this.id, query)
        return this.tasks
    }

    public getTotalTaskCount(): number {
        return this.totalCount;
    }

    public addTask(name: string): void {
        const task = this.taskService.createTask(this.id, name);
        this.totalCount++;
        this.tasks.push(task);
    }

    public removeTask(task: ITask): void {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.totalCount--;
        this.taskService.delete(task.id);
    }
}

export class TaskListPublic extends TaskListReadonly implements ITaskListPublic {
    private filterFn = (val: Visibility) => val === Visibility.PUBLIC;
    private PUBLIC_FILTER: Filter = { field: "visibility", comparator: this.filterFn };
    private tasks: ITaskPublic[];
    private totalCount: number;
    private taskService: IServiceReadonly<ITaskPublic>

    constructor(props: TaskListProps, taskService: IServiceReadonly<ITaskPublic>) {
        super(props, taskService);
        this.tasks = props.id ? taskService.getAll(props.id, {filter: this.PUBLIC_FILTER}) : [];
        this.totalCount = this.tasks.length;
        this.taskService = taskService;
    }

    public getTasks(query?: Query): ITaskPublic[] {
        // if query === prev-query return this.tasks;
        query.filter = this.PUBLIC_FILTER
        this.tasks = this.taskService.getAll(this.id, query);
        return this.tasks;
    }

    public getTotalTaskCount(): number {
        return this.totalCount;
    }
}