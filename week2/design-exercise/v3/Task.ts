import { Filter, IDao, Query } from "./Dao";

export enum Status {
    NEW = 'New',
    INPROGRESS = "In Progress",
    REVIEW = "Under Review",
    BLOCKED = "Blocked",
    COMPLETE = 'Complete'
}

export interface ITask { 
    id: string;
    ownerId: string;
    name: string;
    isComplete(): boolean;
    toggleComplete(): void;
    getStatus?(): Status; 
    setStatus?(status: Status): void;
    getDueDate?(): Date; 
    setDueDate?(date: Date): void;
}

export type TaskProps = {
    id: string;
    ownerId: string;
    name: string;
    status?: Status;
    dueDate?: number;
}

export class Task implements ITask {
    public readonly id: string;
    public ownerId: string;
    public name: string;
    private status: Status;
    private prevStatus: Status;
    private dueDate: Date | null;
    
    constructor(props: TaskProps) {
        this.id = props.id;
        this.ownerId = props.ownerId;
        this.name = props.name;
        this.status = props.status ?? Status.NEW;
        this.prevStatus = props.status;
        this.dueDate = props.dueDate ? new Date(props.dueDate) : null;
    }

    public isComplete(): boolean {
        return this.status === Status.COMPLETE
    }

    public toggleComplete(): void {
        const prev = this.prevStatus;
        this.prevStatus = this.status;

        if (this.status === Status.COMPLETE) {
            this.status = prev;
        } else {
            this.status = Status.COMPLETE;
        }
    }

    public getDueDate() {
        return this.dueDate;
    }

    // status getter and setter
    // dueDate gettter and setter
}

export interface ITaskService {
    getAll(ownerId: string, query?: Query): ITask[];
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

