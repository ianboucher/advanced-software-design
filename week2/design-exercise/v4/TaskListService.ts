import { IDao, Filter } from "./Dao";
import { ITaskService } from "./TaskService";
import { TaskList } from "./TaskList";
import { IService } from "./Service";

export class TaskListService implements IService<TaskList> {
    private dao: IDao<TaskList>;
    private taskService: ITaskService;

    constructor(dao: IDao<TaskList>, taskService: ITaskService) {
        this.dao = dao;
        this.taskService = taskService;
    }

    public getAll(ownerId: string): TaskList[] {
        const filter: Filter = { field: ownerId, comparator: (a: string) => a === ownerId }; 

        return this.dao.getAll({filter});
    }

    public get(id: string): TaskList {
        return this.dao.get(id)
    }

    public create(name: string, ownerId?: string): TaskList {
        const listProps = {
            id: this.dao.nextId(),
            name: name,
            ownerId: ownerId ?? "",
        };
        const list = new TaskList(listProps, this.taskService);
        this.dao.save(list);
        return list; 
    }

    public save(taskList: TaskList): void {
        this.dao.save(taskList);
    }

    public delete(id: string): void {

    }
}