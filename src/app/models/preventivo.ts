import { RigaPreventivo } from './riga-preventivo';
import { Stanza } from './stanza';

export interface Preventivo {
  id: string;
  titolo: string;

  stanze: Stanza[];         // <— NUOVO: elenco stanze
  activeStanzaId: string;   // <— NUOVO: stanza selezionata

  ditta: string;
  cliente: string;

  righe: RigaPreventivo[];
  totale: number;

  createdAt: string;
  updatedAt: string;
}
