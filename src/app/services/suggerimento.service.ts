import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Suggerimento } from '../models/suggerimento';
import { v4 as uuid } from 'uuid';

@Injectable({ providedIn: 'root' })
export class SuggerimentiService {
  private readonly defaults: Suggerimento[] = [
    { id: 'punto-luce', descrizione: 'Punto luce', prezzoUnitario: 35, quantitaDefault: 1 },
    { id: 'punto-presa', descrizione: 'Punto presa', prezzoUnitario: 40, quantitaDefault: 1 },
    { id: 'deviazione',  descrizione: 'Punto Deviato',  prezzoUnitario: 50, quantitaDefault: 1 },
    { id: 'int-bip',     descrizione: 'Punto bipolare', prezzoUnitario: 45, quantitaDefault: 1 },
    { id: 'quadro',      descrizione: 'Quadro elettrico modulare', prezzoUnitario: 180, quantitaDefault: 1 },
  ];

  private readonly _suggerimenti = new BehaviorSubject<Suggerimento[]>([...this.defaults]);
  suggerimenti$ = this._suggerimenti.asObservable();

  getAll(): Suggerimento[] {
    return this._suggerimenti.value;
  }

  add(descrizione: string, prezzoUnitario: number, quantitaDefault = 1) {
    const nuovo: Suggerimento = { id: uuid(), descrizione, prezzoUnitario, quantitaDefault };
    this._suggerimenti.next([...this._suggerimenti.value, nuovo]);
  }

  update(id: string, changes: Partial<Suggerimento>) {
    this._suggerimenti.next(
      this._suggerimenti.value.map(s =>
        s.id === id ? { ...s, ...changes } : s
      )
    );
  }

  remove(id: string) {
    this._suggerimenti.next(this._suggerimenti.value.filter(s => s.id !== id));
  }

  reset() {
    this._suggerimenti.next([...this.defaults]);
  }
}
