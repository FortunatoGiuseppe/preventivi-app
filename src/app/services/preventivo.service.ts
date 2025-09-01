import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preventivo } from '../models/preventivo';
import { RigaPreventivo } from '../models/riga-preventivo';
import { Stanza } from '../models/stanza';
import { StorageService } from './storage.service';

type SavedIndexItem = { id: string; titolo: string; updatedAt: string; totale: number };

@Injectable({ providedIn: 'root' })
export class PreventivoService {
  private readonly INDEX_KEY = 'preventivi:index';

  private _preventivo$ = new BehaviorSubject<Preventivo>(this.createBlank());
  preventivo$ = this._preventivo$.asObservable();

  constructor(private storage: StorageService) {}

  // ====== Stato base ======
  private createBlank(): Preventivo {
    const now = new Date().toISOString();
    const stanzaDefault: Stanza = { id: crypto.randomUUID(), nome: 'Generale' };
    return {
      id: crypto.randomUUID(),
      titolo: 'Nuovo preventivo',
      stanze: [stanzaDefault],
      activeStanzaId: stanzaDefault.id,
      righe: [],
      totale: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  private next(p: Preventivo) {
    p.updatedAt = new Date().toISOString();
    p.totale = this.calcolaTotale(p.righe);
    this._preventivo$.next({ ...p });
  }

  // ====== Stanze ======
  addStanza(nome: string) {
    const p = { ...this._preventivo$.value };
    const nuova: Stanza = { id: crypto.randomUUID(), nome: nome.trim() || `Stanza ${p.stanze.length + 1}` };
    p.stanze = [...p.stanze, nuova];
    p.activeStanzaId = nuova.id;
    this.next(p);
  }

  setStanzaAttiva(id: string) {
    const p = { ...this._preventivo$.value };
    if (!p.stanze.find(s => s.id === id)) return;
    p.activeStanzaId = id;
    this.next(p);
  }

  rinominaStanza(id: string, nome: string) {
    const p = { ...this._preventivo$.value };
    p.stanze = p.stanze.map(s => s.id === id ? { ...s, nome: nome.trim() || s.nome } : s);
    this.next(p);
  }

  eliminaStanza(id: string) {
    const p = { ...this._preventivo$.value };
    if (p.stanze.length <= 1) return; // almeno una stanza
    p.stanze = p.stanze.filter(s => s.id !== id);
    p.righe = p.righe.filter(r => r.stanzaId !== id);
    if (p.activeStanzaId === id) p.activeStanzaId = p.stanze[0].id;
    this.next(p);
  }

  getNomeStanza(id: string): string {
    const s = this._preventivo$.value.stanze.find(x => x.id === id);
    return s ? s.nome : '';
  }

  // ====== Titolo ======
  setTitolo(titolo: string) {
    const p = { ...this._preventivo$.value, titolo };
    this.next(p);
  }

  // ====== Righe ======
  addRiga(descrizione: string, quantita: number, prezzoUnitario: number, stanzaId?: string) {
    const p = { ...this._preventivo$.value };
    const sid = stanzaId || p.activeStanzaId || (p.stanze[0]?.id);
    if (!sid) return;

    const riga: RigaPreventivo = {
      id: crypto.randomUUID(),
      stanzaId: sid,
      descrizione,
      quantita,
      prezzoUnitario,
      totale: this.round2(quantita * prezzoUnitario)
    };
    p.righe = [...p.righe, riga];
    this.next(p);
  }

  updateRiga(riga: RigaPreventivo) {
    const p = { ...this._preventivo$.value };
    p.righe = p.righe.map(r => r.id === riga.id ? ({
      ...riga,
      totale: this.round2(riga.quantita * riga.prezzoUnitario)
    }) : r);
    this.next(p);
  }

  removeRiga(id: string) {
    const p = { ...this._preventivo$.value };
    p.righe = p.righe.filter(r => r.id !== id);
    this.next(p);
  }

  clear() { this._preventivo$.next(this.createBlank()); }

  // ====== Persistenza (LocalStorage) ======
  listSaved(): SavedIndexItem[] {
    return this.storage.get<SavedIndexItem[]>(this.INDEX_KEY) ?? [];
  }

  save(): string {
    const p = this._preventivo$.value;
    const key = `preventivo:${p.id}`;
    const toSave = { ...p, updatedAt: new Date().toISOString() };
    this.storage.set(key, toSave);

    const idx = this.listSaved().filter(x => x.id !== p.id);
    idx.push({ id: p.id, titolo: p.titolo, updatedAt: toSave.updatedAt, totale: toSave.totale });
    this.storage.set(this.INDEX_KEY, idx.sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)));
    this._preventivo$.next(toSave);
    return p.id;
  }

  load(id: string): boolean {
    const key = `preventivo:${id}`;
    const p = this.storage.get<Preventivo>(key);
    if (!p) return false;
    this._preventivo$.next(p);
    return true;
  }

  delete(id: string) {
    const key = `preventivo:${id}`;
    this.storage.remove(key);
    const idx = this.listSaved().filter(x => x.id !== id);
    this.storage.set(this.INDEX_KEY, idx);
    if (this._preventivo$.value.id === id) this.clear();
  }

  // ====== Helpers ======
  totaleStanza(stanzaId: string): number {
    return this.round2(this._preventivo$.value.righe
      .filter(r => r.stanzaId === stanzaId)
      .reduce((a, r) => a + r.totale, 0));
  }
  private calcolaTotale(righe: RigaPreventivo[]): number {
    return this.round2(righe.reduce((acc, r) => acc + (r.quantita * r.prezzoUnitario), 0));
  }
  private round2(n: number) { return Math.round(n * 100) / 100; }
}
