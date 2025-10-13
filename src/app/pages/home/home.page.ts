import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task.model';
import { map } from 'rxjs/operators';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import {
  AlertController,
  ToastController,
  SegmentChangeEventDetail,
  IonItemSliding,            // 👈 usa IonItemSliding (no HTMLIonItemSlidingElement)
} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage {
  private filter$ = new BehaviorSubject<'all'|'pending'|'done'>('all');
  tasks$!: Observable<Task[]>;

  // 👇 NUEVO: contadores reactivos
  counts$ = this.tasks.tasks$.pipe(
    map(list => ({
      all: list.length,
      pending: list.filter(t => !t.done).length,
      done: list.filter(t =>  t.done).length,
    }))
  );

  constructor(
    private tasks: TaskService,
    private router: Router,
    // si ya tienes Toast/Alert aquí, déjalos
  ) {
    this.tasks$ = combineLatest([this.tasks.tasks$, this.filter$]).pipe(
      map(([list, f]) => {
        let filtered = list;
        if (f === 'pending') filtered = list.filter(t => !t.done);
        if (f === 'done')    filtered = list.filter(t =>  t.done);
        return [...filtered].sort(
          (a,b) => Number(a.done) - Number(b.done) || b.updatedAt.localeCompare(a.updatedAt)
        );
      })
    );
  }
  onToggleChange(t: Task, ev: CustomEvent) {
    const checked = (ev.detail as any).checked as boolean;
    this.tasks.toggleDone(t.id, checked);
  }

  async removeFast(t: Task, sliding?: IonItemSliding) {
    try { await sliding?.close(); } catch {}
    this.tasks.remove(t.id);
    await this.toast('Tarea eliminada');
  }
  toast(arg0: string) {
    throw new Error('Method not implemented.');
  }


  goCreate() { this.router.navigateByUrl('/task'); }
  open(task: Task) { this.router.navigateByUrl(`/task/${task.id}`); }

  // <-- Aquí la opción 1: recibimos el evento completo y resolvemos el valor
  setFilter(ev: CustomEvent<SegmentChangeEventDetail>) {
    const v = (ev.detail.value ?? 'all') as 'all' | 'pending' | 'done';
    this.filter$.next(v);
  }

  // (opcional) si te marca tipado en el checkbox, usa CustomEvent y lee .detail.checked
  toggle(t: Task, ev: CustomEvent) {
    const checked = (ev.detail as any).checked as boolean;
    this.tasks.toggleDone(t.id, checked);
  }

  trackById(_: number, t: Task) { return t.id; }
}
