import { Query, IDao, Filter } from "./Dao";
import { ITask, Task } from "./Task";

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