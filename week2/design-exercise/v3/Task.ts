import { Filter, IDao, Query } from "./Dao";

export enum Status {
    NEW = 'New',
    INPROGRESS = "In Progress",
    REVIEW = "Under Review",
    BLOCKED = "Blocked",
    COMPLETE = 'Complete'
}

export enum Visibility {
    PUBLIC = 'Public',
    PRIVATE = "Private",
}

export interface ITaskReadonly { 
    id: string;
    ownerId: string;
    name: string;
    isComplete(): boolean;
    getStatus?(): Status;
    getDueDate?(): Date;
    getVisibility?(): Visibility
}

export interface ITask extends ITaskReadonly { 
    toggleComplete(): void;
    setStatus?(status: Status): void;
    setDueDate?(date: Date): void;
    setVisibility?(visibility: Visibility): void; 
}

export interface ITaskPublic extends ITaskReadonly {
    getVisibility(): Visibility.PUBLIC;
}

export type TaskProps = {
    id: string;
    ownerId: string;
    name: string;
    status?: Status;
    dueDate?: number;
    visibility?: Visibility
}

export class ReadonlyTask implements ITaskReadonly {
    public readonly id: string;
    public ownerId: string;
    public name: string;
    protected status: Status;
    protected dueDate: Date | null;
    protected visibility: Visibility;
    
    constructor(props: TaskProps) {
        this.id = props.id;
        this.ownerId = props.ownerId;
        this.name = props.name;
        this.status = props.status ?? Status.NEW;
        this.dueDate = props.dueDate ? new Date(props.dueDate) : null;
        this.visibility = props.visibility ?? Visibility.PUBLIC;
    }

    public isComplete(): boolean {
        return
    }

    public getStatus(): Status {
        return;
    }

    public getDueDate(): Date | null {
        return;
    }

    public getVisibility(): Visibility {
        return;
    }
}

export class Task extends ReadonlyTask implements ITask {
    private prevStatus: Status;
    
    constructor(props: TaskProps) {
        super(props);
        this.prevStatus = props.status;
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

    // status getter and setter
    // dueDate gettter and setter
    // visibility getter and setter
}

