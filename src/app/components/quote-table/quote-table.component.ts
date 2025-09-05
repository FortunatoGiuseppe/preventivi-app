import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe, CurrencyPipe } from '@angular/common';
import { PreventivoService } from '../../services/preventivo.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { Preventivo } from '../../models/preventivo';
import { RigaPreventivo } from '../../models/riga-preventivo';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quote-table',
  standalone: true,
  imports: [CommonModule, AsyncPipe, CurrencyPipe, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './quote-table.component.html',
  styleUrl: './quote-table.component.css'
})
export class QuoteTableComponent implements OnInit {
  preventivo$!: Observable<Preventivo>;
  constructor(private prevSrv: PreventivoService) {}

  ngOnInit() { this.preventivo$ = this.prevSrv.preventivo$; }

  righeByStanza(righe: RigaPreventivo[], stanzaId: string) {
    return righe.filter(r => r.stanzaId === stanzaId);
  }
  subtotale(righe: RigaPreventivo[]) {
    return righe.reduce((a, r) => a + (r.quantita * r.prezzoUnitario), 0);
  }

  updateQty(r: RigaPreventivo, qty: number) {
    this.prevSrv.updateRiga({ ...r, quantita: qty });
  }
  updatePrice(r: RigaPreventivo, price: number) {
    this.prevSrv.updateRiga({ ...r, prezzoUnitario: price });
  }
  remove(id: string) { this.prevSrv.removeRiga(id); }

  updateRiga(riga: RigaPreventivo) {
  this.prevSrv.updateRiga(riga);
}
}
