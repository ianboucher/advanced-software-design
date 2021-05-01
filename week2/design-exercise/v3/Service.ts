import { Query } from "./Dao";

export interface IServiceReadonly<T> {
    getAll(ownerId: string | null, query?: Query): T[];
    get(id: string): T;
}

export interface IService<T> extends IServiceReadonly<T> {
    create(name: string): T;
    save(task: T): void;
    delete(id: string): void;
}