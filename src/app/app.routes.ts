import { Routes } from '@angular/router';
import { EditorComponent } from './pages/editor/editor.component';
import { SavedComponent } from './pages/saved/saved.component';

export const routes: Routes = [
  { path: '', component: EditorComponent },
  { path: 'preventivi', component: SavedComponent },
  { path: '**', redirectTo: '' }
];
