import { Query, IDao } from "./Dao";
import { IService, IServiceReadonly } from "./Service";
import { ITaskList } from "./TaskList";
import { IFriend, IListUser, User } from "./User";

export class FriendService implements IServiceReadonly<IFriend> {

    private dao: IDao<IFriend>;

    constructor(dao: IDao<IFriend>) {
        this.dao = dao;
    }

    getAll(ownerId: string | null, query?: Query): IFriend[] {
        return this.dao.getAll(query);
    };

    get(id: string): IFriend {
        return this.dao.get(id);
    };
}

type IFriendService = IServiceReadonly<IFriend>
type Services = {
    listService: IService<ITaskList>
    friendService: IServiceReadonly<IFriend>
}

export class UserService implements IService<IListUser> {

    private dao: IDao<IListUser>;
    private listService: IService<ITaskList>
    private friendService: IFriendService

    constructor(dao: IDao<IListUser>, services: Services) {
        this.dao = dao;
        this.listService = services.listService;
        this.friendService = services.friendService;
    }

    public getAll(ownerId: string | null, query?: Query): IListUser[] {
        return this.dao.getAll(query);
    };

    public get(id: string): IListUser {
        return this.dao.get(id);
    };
    
    public create(name: string): IListUser {
        const props = { id: this.dao.nextId(), name: name } 
        const services = { listService: this.listService, friendService: this.friendService };
        const user = new User(props, services);
        this.dao.save(user);
        return user;
    };

    public save(user: IListUser): void {
        this.dao.save(user)
    };

    public delete(id: string): void { 
        this.dao.delete(id);
    };
}