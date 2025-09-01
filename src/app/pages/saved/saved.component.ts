import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreventivoService } from '../../services/preventivo.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './saved.component.html',
  styleUrl: './saved.component.css'
})
export class SavedComponent implements OnInit {
  items: any[] = [];

  constructor(private prevSrv: PreventivoService, private router: Router) {}

  ngOnInit() {
    this.items = this.prevSrv.listSaved();
  }

  apri(id: string) {
    if (this.prevSrv.load(id)) this.router.navigateByUrl('/');
  }

  elimina(id: string) {
    this.prevSrv.delete(id);
    this.items = this.prevSrv.listSaved();
  }
}
