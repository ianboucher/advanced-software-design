import { Filter } from "../v2/Dao";
import { Query } from "./Dao";
import { IService, IServiceReadonly } from "./Service";
import { ITaskList, ITaskListPublic } from "./TaskList";

export interface IUser {
    id: string;
    ownerId?: string;
    name: string;
}

export interface IReadOnlyUser<LIST, FRIEND> extends IUser {
    getLists(query?: Query): LIST[]
    getFriends?(query?: Query): FRIEND[]
}

export interface IListUser extends IReadOnlyUser<ITaskList, IFriend> {
    addList(taskList: ITaskList): void;
    getLists(query?: Query): ITaskList[]
    addFriend(friend: IUser): void;
    getFriends(query?: Query): IFriend[]
}

export interface IFriend extends IReadOnlyUser<ITaskListPublic, unknown> {
    getLists(query?: Query): ITaskListPublic[];
}

export type UserProps = {
    id: string;
    ownerId?: string;
    name: string;
    lists?: ITaskList[];
    friendIds?: string[];
}

type Services = {
    listService: IService<ITaskList>
    friendService: IServiceReadonly<IFriend>
}

export class User implements IListUser {
    public readonly id: string;
    public ownerId: string;
    public name: string;
    private lists: ITaskList[];
    private friendIds: string[];
    private listService: IService<ITaskList>;
    private friendService: IServiceReadonly<IFriend>;

    constructor(props: UserProps, services: Services) {    
        this.id = props.id;
        this.ownerId = props.id;
        this.name = props.name;
        this.lists = props.lists ?? [];
        this.friendIds = props.friendIds ?? [];
        this.listService = services.listService;
        this.friendService = services.friendService;
    }

    public addList(taskList: ITaskList): void {
        this.lists.push(taskList); 
    };

    public getLists(query?: Query): ITaskList[] {
        // if query === prev-query return this.lists;
        this.lists = this.listService.getAll(this.id, query);
        return this.lists;
    }

    public addFriend(user: IUser): void {
        this.friendIds.push(user.id);
    } 

    public getFriends(): IFriend[] {
        const fn = (val: string) => this.friendIds.includes(val); // incredibly inefficient;
        const filter: Filter = { field: "id", comparator: fn };
        return this.friendService.getAll(null, { filter });
    }
}

export class Friend implements IFriend {
    public readonly id: string;
    public ownerId: string;
    public name: string;
    private lists: ITaskListPublic[]
    private listService: IServiceReadonly<ITaskListPublic>

    constructor(props: UserProps, listService: IServiceReadonly<ITaskListPublic>) {
        this.id = props.id;
        this.ownerId = props.id;
        this.name = props.name;
        this.lists = listService.getAll(props.id);
        this.listService = listService;
    }

    getLists(query?: Query): ITaskListPublic[] {
        return this.listService.getAll(null, query)
    }
}

