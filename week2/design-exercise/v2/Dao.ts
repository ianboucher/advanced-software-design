export type Filter = {
    field: string
    comparator(val: unknown): boolean
}

export type Sort = {
    field: string
    comparator(a: unknown, b: unknown): number
}

export type Query = {
    filter?: Filter
    sort?: Sort
}

export interface IDao<T> {
    getAll(query: Query): T[];
    get(id: string): T;
    save(item: T): void;
    delete(id: string): void;
    nextId(): string;
}

export class Dao<T> implements IDao<T> {
    getAll(query: Query): T[] {
        return []
    };
    get(id: string): T {
        return
    };
    save(item: T): void {

    };
    update(item: T): void {

    };
    delete(id: string): void {

    };
    nextId(): string {
        return '';
    };
}