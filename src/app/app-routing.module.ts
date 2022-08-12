import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DanceDesignerComponent } from './components/dance-designer/dance-designer.component';

const routes: Routes = [
  { path: 'dance-designer', component: DanceDesignerComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
