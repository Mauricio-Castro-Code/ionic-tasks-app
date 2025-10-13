import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-task',
  templateUrl: './task.page.html',
  styleUrls: ['./task.page.scss'],
  standalone: false,
})
export class TaskPage {
  // Campos no nulos en el form
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    dueDate: [''],
  });

  constructor(
    private fb: FormBuilder,
    private tasks: TaskService,
    private nav: NavController,
    private toasts: ToastController
  ) {}

  async save() {
    if (this.form.invalid) return;

    const { title, description, dueDate } = this.form.getRawValue();

    this.tasks.create({
      title,
      description: description || undefined,
      dueDate: dueDate || undefined,
    });

    // Aviso rápido
    (await this.toasts.create({ message: 'Tarea creada', duration: 900 })).present();

    // Limpia el formulario para la próxima vez (opcional)
    this.form.reset({ title: '', description: '', dueDate: '' });

    // Ir directo a Home y resetear la pila de navegación
    this.nav.navigateRoot(['/home']);
    // Si prefieres solo volver una pantalla:
    // this.nav.back();
  }
}
