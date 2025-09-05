import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { Preventivo } from '../models/preventivo';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  export(preventivo: Preventivo) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;

    // Intestazione
    doc.setFontSize(12);
    if (preventivo.ditta) doc.text(`Ditta: ${preventivo.ditta}`, margin, 40);
    if (preventivo.cliente) doc.text(`Cliente: ${preventivo.cliente}`, doc.internal.pageSize.getWidth() / 2, 40);

    // Titolo e date
    let y = 80;
    doc.setFontSize(16);
    doc.text(`Preventivo: ${preventivo.titolo}`, margin, y);
    y += 20;
    doc.setFontSize(10);
    doc.text(`Creato: ${new Date(preventivo.createdAt).toLocaleString()}`, margin, y);
    y += 15;
    doc.text(`Aggiornato: ${new Date(preventivo.updatedAt).toLocaleString()}`, margin, y);
    y += 25;

    // Stanze e righe
    for (const stanza of preventivo.stanze) {
      const righe = preventivo.righe.filter(r => r.stanzaId === stanza.id);
      if (!righe.length) continue;

      doc.setFontSize(13);
      doc.text(stanza.nome, margin, y);
      y += 8;

      for (const r of righe) {
        // Riga principale
        const head = [['Descrizione', 'Q.tà', 'Prezzo €', 'Totale €']];
        const body: RowInput[] = [[
          r.descrizione,
          String(r.quantita),
          r.prezzoUnitario.toFixed(2),
          (r.quantita * r.prezzoUnitario).toFixed(2),
        ]];

        autoTable(doc, {
          head, body,
          startY: y,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [33, 150, 243] },
          columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
        });

        // Note sotto la riga
        if (r.note) {
          const finalY = (doc as any).lastAutoTable.finalY || y;
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(`Note: ${r.note}`, margin, finalY + 12, { maxWidth: 500 });
          y = finalY + 25; // spazio dopo la nota
        } else {
          const finalY = (doc as any).lastAutoTable.finalY || y;
          y = finalY + 10;
        }

        if (y > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          y = margin;
        }
      }

      // Subtotale stanza
      const subtot = righe.reduce((a, r) => a + (r.quantita * r.prezzoUnitario), 0);
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Subtotale ${stanza.nome}: € ${subtot.toFixed(2)}`, margin, y);
      y += 20;
    }

    // Totale complessivo
    doc.setFontSize(14);
    doc.text(`Totale preventivo: € ${preventivo.totale.toFixed(2)}`, margin, y);

    doc.save(`preventivo-${preventivo.titolo.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  }
}
