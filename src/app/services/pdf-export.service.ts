import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { Preventivo } from '../models/preventivo';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  export(preventivo: Preventivo) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;

    doc.setFontSize(16);
    doc.text(`Preventivo: ${preventivo.titolo}`, margin, 40);
    doc.setFontSize(10);
    doc.text(`Creato: ${new Date(preventivo.createdAt).toLocaleString()}`, margin, 60);
    doc.text(`Aggiornato: ${new Date(preventivo.updatedAt).toLocaleString()}`, margin, 75);

    let y = 100;

    // Sezioni per stanza
    for (const stanza of preventivo.stanze) {
      const righe = preventivo.righe.filter(r => r.stanzaId === stanza.id);
      if (!righe.length) continue;

      doc.setFontSize(13);
      doc.text(stanza.nome, margin, y);
      y += 8;

      const head = [['Descrizione', 'Q.tà', 'Prezzo €', 'Totale €']];
      const body: RowInput[] = righe.map(r => ([
        r.descrizione,
        String(r.quantita),
        r.prezzoUnitario.toFixed(2),
        (r.quantita * r.prezzoUnitario).toFixed(2),
      ]));

      autoTable(doc, {
        head, body,
        startY: y,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [33, 150, 243] },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
      });

      const finalY = (doc as any).lastAutoTable.finalY || y;
      const subtot = righe.reduce((a, r) => a + (r.quantita * r.prezzoUnitario), 0);
      doc.setFontSize(12);
      doc.text(`Subtotale ${stanza.nome}: € ${subtot.toFixed(2)}`, margin, finalY + 20);

      y = finalY + 40;
      if (y > doc.internal.pageSize.getHeight() - 120) {
        doc.addPage(); y = margin;
      }
    }

    // Totale complessivo
    doc.setFontSize(14);
    doc.text(`Totale preventivo: € ${preventivo.totale.toFixed(2)}`, margin, y);

    doc.save(`preventivo-${preventivo.titolo.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  }
}
