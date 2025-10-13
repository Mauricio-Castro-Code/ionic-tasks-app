import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../models/task.model';

const STORAGE_KEY = 'tasks_v1';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private _tasks$ = new BehaviorSubject<Task[]>(this.load());
  readonly tasks$ = this._tasks$.asObservable();

  // ====== Public API ======
  all(): Task[] { return this._tasks$.value; }

  getById(id: string): Task | undefined {
    return this._tasks$.value.find(t => t.id === id);
  }

  create(data: { title: string; description?: string; dueDate?: string }): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: this.uid(),
      title: data.title.trim(),
      description: data.description?.trim(),
      dueDate: data.dueDate || undefined,
      done: false,
      createdAt: now,
      updatedAt: now,
    };
    const next = [task, ...this._tasks$.value];
    this.commit(next);
    return task;
  }

  update(id: string, changes: Partial<Omit<Task,'id'|'createdAt'>>): Task | undefined {
    const next = this._tasks$.value.map(t => {
      if (t.id !== id) return t;
      const updated: Task = { ...t, ...changes, updatedAt: new Date().toISOString() };
      return updated;
    });
    this.commit(next);
    return this.getById(id);
  }

  toggleDone(id: string, done: boolean): void {
    this.update(id, { done });
  }

  remove(id: string): void {
    const next = this._tasks$.value.filter(t => t.id !== id);
    this.commit(next);
  }

  clearAll(): void {
    this.commit([]);
  }

  // ====== Internals ======
  private commit(next: Task[]) {
    this._tasks$.next(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage', e);
    }
  }

  private load(): Task[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: Task[] = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private uid(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
}
