import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- aggiunto
import { QuoteTableComponent } from '../../components/quote-table/quote-table.component';
import { PreventivoService } from '../../services/preventivo.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Preventivo } from '../../models/preventivo';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { SuggestionListComponent } from '../../components/suggestion-list/suggestion-list.component';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule, AsyncPipe, FormsModule,
    QuoteTableComponent, SuggestionListComponent,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule,
    MatSelectModule, MatIconModule
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent implements OnInit {
  preventivo$!: Observable<Preventivo>;
  titolo = '';
  ditta = '';
  cliente = '';

  constructor(
    private prevSrv: PreventivoService,
    private pdf: PdfExportService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.preventivo$ = this.prevSrv.preventivo$;
    this.preventivo$.subscribe(p => this.titolo = p.titolo);
  }

  // ---- toolbar azioni ----
  setTitolo(val: string) { this.prevSrv.setTitolo(val); }
  nuovo() {
    this.prevSrv.clear();
    this.snack.open('Nuovo preventivo', 'OK', { duration: 1500 });
  }
  salva() {
    const id = this.prevSrv.save();
    this.snack.open('Preventivo salvato', 'OK', { duration: 1500 });
    return id;
  }
  esporta(p: Preventivo) { this.pdf.export(p); }

  // ---- stanze ----
  setStanza(id: string) { this.prevSrv.setStanzaAttiva(id); }
  nuovaStanza() {
    const nome = prompt('Nome della nuova stanza', 'Soggiorno');
    if (nome !== null) this.prevSrv.addStanza(nome);
  }
  rinominaStanza(id: string, nomeAttuale: string) {
    const nome = prompt('Rinomina stanza', nomeAttuale);
    if (nome !== null) this.prevSrv.rinominaStanza(id, nome);
  }
  eliminaStanza(id: string) {
    if (confirm('Eliminare la stanza? Le righe al suo interno verranno rimosse.')) {
      this.prevSrv.eliminaStanza(id);
    }
  }
  getNomeStanza(p: Preventivo): string {
    const stanza = p.stanze.find(s => s.id === p.activeStanzaId);
    return stanza?.nome || '';
  }
  setDitta(val: string) {
  this.ditta = val;
  this.prevSrv.setDitta(val);
}

setCliente(val: string) {
  this.cliente = val;
  this.prevSrv.setCliente(val);
}

}
