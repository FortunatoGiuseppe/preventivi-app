export interface RigaPreventivo {
  id: string;
  stanzaId: string;       // <— NUOVO: appartenenza alla stanza
  descrizione: string;
  quantita: number;
  prezzoUnitario: number; // Euro
  totale: number;         // quantita * prezzoUnitario (calcolato)
  note?: string;
  showNote?: boolean;
}
