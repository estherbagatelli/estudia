import { BaseRepository } from "./base.repository";
import type { Task } from "@/types/models";

class TasksRepository extends BaseRepository<"tasks"> {
  constructor() {
    super("tasks");
  }

  /** Active tasks, newest first (matches the previous localStorage behaviour). */
  listForUser(userId: string): Promise<Task[]> {
    return this.list(userId, { orderBy: "created_at", ascending: false });
  }
}

export const tasksRepository = new TasksRepository();
