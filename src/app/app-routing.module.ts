import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home.module').then(m => m.HomePageModule),
  },
  {
    path: 'task',
    loadChildren: () =>
      import('./pages/task/task.module').then(m => m.TaskPageModule),
  },
  {
    path: 'task/:id',
    loadChildren: () =>
      import('./pages/task-detail/task-detail.module').then(m => m.TaskDetailPageModule),
  },

  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
