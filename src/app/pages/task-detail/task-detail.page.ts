import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController, ToastController, NavController } from '@ionic/angular';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  standalone:false,
})
export class TaskDetailPage implements OnInit {
  task?: Task;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    dueDate: [''],
    done: [false],
  });

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private tasks: TaskService,
    private alerts: AlertController,
    private toasts: ToastController,
    private nav: NavController
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.task = this.tasks.getById(id);
    if (!this.task) {
      this.nav.navigateRoot(['/home']);
      return;
    }
    this.form.patchValue(this.task);
  }

  async save() {
    if (!this.task || this.form.invalid) return;
    this.tasks.update(this.task.id, this.form.value as any);
    (await this.toasts.create({ message: 'Cambios guardados', duration: 900 })).present();
    this.nav.navigateRoot(['/home']); // volver a Home tras guardar
  }

  async remove() {
    const alert = await this.alerts.create({
      header: 'Eliminar',
      message: `¿Eliminar la tarea "<b>${this.task?.title}</b>"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            if (!this.task) return;
            this.tasks.remove(this.task.id);
            (await this.toasts.create({ message: 'Tarea eliminada', duration: 900 })).present();
            this.nav.navigateRoot(['/home']);
          },
        },
      ],
    });
    await alert.present();
  }
}
