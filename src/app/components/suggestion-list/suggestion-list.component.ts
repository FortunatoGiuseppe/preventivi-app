import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreventivoService } from '../../services/preventivo.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Suggerimento } from '../../models/suggerimento';
import { Observable } from 'rxjs';
import { SuggerimentiService } from '../../services/suggerimento.service';

@Component({
  selector: 'app-suggestion-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './suggestion-list.component.html',
  styleUrl: './suggestion-list.component.css'
})
export class SuggestionListComponent implements OnInit {
  suggerimenti$!: Observable<Suggerimento[]>;
  qty: Record<string, number> = {};

  // campi per nuovo suggerimento
  nuovaDescrizione = '';
  nuovoPrezzo = 0;

  constructor(
    private suggSrv: SuggerimentiService,
    private prevSrv: PreventivoService
  ) {}

  ngOnInit() {
    this.suggerimenti$ = this.suggSrv.suggerimenti$;
  }

  // --- azioni preventivo ---
  updateQty(id: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const val = input.valueAsNumber || 1;
    this.qty = { ...this.qty, [id]: val };
  }

  add(id: string, s: Suggerimento) {
    const q = Number(this.qty[id] ?? s.quantitaDefault) || s.quantitaDefault;
    this.prevSrv.addRiga(s.descrizione, q, s.prezzoUnitario);
  }

  // --- gestione suggerimenti ---
  aggiungi() {
    if (!this.nuovaDescrizione || this.nuovoPrezzo <= 0) return;
    this.suggSrv.add(this.nuovaDescrizione, this.nuovoPrezzo);
    this.nuovaDescrizione = '';
    this.nuovoPrezzo = 0;
  }

  modifica(s: Suggerimento) {
    this.suggSrv.update(s.id, { 
      descrizione: s.descrizione, 
      prezzoUnitario: s.prezzoUnitario 
    });
  }

  elimina(id: string) {
    this.suggSrv.remove(id);
  }
}