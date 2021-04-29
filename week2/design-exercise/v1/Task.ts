import { Filter, IDao } from "./Dao";

export type TaskProps = {
    id: string;
    ownerId: string;
    name: string;
    complete?: boolean;
}

export interface ITask { 
    id: string;
    ownerId: string;
    name: string;
    isComplete(): boolean;
    toggleComplete(): void;
}

export class Task implements ITask {
    public readonly id: string;
    public ownerId: string;
    public name: string;
    private complete: boolean;
    
    constructor(props: TaskProps) {
        this.id = props.id;
        this.ownerId = props.ownerId;
        this.name = props.name;
        this.complete = props.complete ?? false;
    }

    public isComplete(): boolean {
        return this.complete
    }

    public toggleComplete(): void {
        this.complete = !this.complete;
    }
}

export interface ITaskService {
    getAll(ownerId: string): ITask[];
    get(id: string): ITask;
    createTask(ownerId: string, name: string): ITask;
    save(task: ITask): void;
    delete(id: string): void;
}

export class TaskService implements ITaskService {
    private dao: IDao<ITask>;

    constructor(dao: IDao<ITask>) {
        this.dao = dao;
    }

    public getAll(ownerId: string): ITask[] {
        const filter: Filter = { field: ownerId, comparator: (a: string) => a === ownerId }; 
        return this.dao.getAll({ filter })
    }

    public get(id: string): ITask {
        return this.dao.get(id);
    }

    public createTask(ownerId: string, name: string) {
        const task = new Task({
            id: this.dao.nextId(),
            ownerId,
            name,
        });
        this.dao.save(task);
        return task;
    }

    public save(task: ITask) {
        // perform validion
        this.dao.save(task);
    }

    public delete(id: string) {
        this.dao.delete(id);
    }
}

