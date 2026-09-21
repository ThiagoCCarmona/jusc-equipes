import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Person, Team, Event } from '../types';

export function exportTeamsToPDF(teams: Team[], people: Person[], event?: Event | null): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const peopleMap = new Map<string, Person>(people.map(p => [p.id, p]));
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Top banner bar (Dark & Gold)
  doc.setFillColor(15, 17, 23);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFillColor(255, 199, 0); // JUSC Gold
  doc.rect(0, 28, 210, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 199, 0);
  doc.text('JUSC - JOVENS UNIDOS SEGUINDO CRISTO', 14, 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  const eventLabel = event?.name ? `${event.name}` : 'Relatório Oficial de Equipes e Funções';
  doc.text(eventLabel, 14, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  const subInfo = [event?.date, event?.location].filter(Boolean).join(' • ') || 'Escala de Trabalho e Funções';
  doc.text(subInfo, 14, 25);

  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text(`Gerado em: ${dateStr}`, 196, 21, { align: 'right' });

  // Summary Metrics
  let totalRoles = 0;
  let totalSpots = 0;
  let allocatedSpots = 0;

  teams.forEach(t => {
    t.roles.forEach(r => {
      totalRoles++;
      totalSpots += r.maxSpots || 0;
      allocatedSpots += r.assignedPersonIds.length;
    });
  });

  const openSpots = Math.max(0, totalSpots - allocatedSpots);

  let currentY = 36;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 45);
  doc.text(
    `Resumo Geral:  ${teams.length} Equipes  |  ${totalRoles} Funções  |  ${allocatedSpots} Vagas Ocupadas  |  ${openSpots} Vagas Abertas  |  ${people.length} Pessoas`,
    14,
    currentY
  );

  currentY += 6;

  teams.forEach((team) => {
    if (currentY > 245) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(245, 246, 250);
    doc.roundedRect(14, currentY, 182, 14, 2, 2, 'F');

    doc.setFillColor(255, 199, 0);
    doc.rect(14, currentY, 3, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(18, 20, 28);
    doc.text(team.name.toUpperCase(), 20, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 95, 105);
    const descLines = doc.splitTextToSize(team.description || 'Sem descrição cadastrada.', 170);
    doc.text(descLines[0], 20, currentY + 11);

    currentY += 16;

    const tableBody = team.roles.map((role) => {
      const assignedNames = role.assignedPersonIds
        .map(id => {
          const p = peopleMap.get(id);
          return p ? `${p.name} (${p.type} • P${p.priority})` : 'Desconhecido';
        })
        .join('\n') || 'Nenhum integrante alocado';

      const maxText = role.maxSpots ? `${role.assignedPersonIds.length}/${role.maxSpots}` : `${role.assignedPersonIds.length} (livre)`;

      return [
        role.title,
        role.description || '-',
        maxText,
        assignedNames,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Função', 'Descrição da Função / Atribuições', 'Vagas', 'Integrantes Alocados']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [24, 27, 36],
        textColor: [255, 199, 0],
        fontSize: 8.5,
        fontStyle: 'bold',
        cellPadding: 2.5,
      },
      styles: {
        fontSize: 8,
        textColor: [40, 40, 45],
        cellPadding: 2.5,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 62 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 60 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `JUSC - Jovens Unidos Seguindo Cristo  •  Página ${doc.getNumberOfPages()}`,
          105,
          290,
          { align: 'center' }
        );
      },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY;
    currentY = (finalY || currentY) + 8;
  });

  doc.save(`JUSC_Escala_Equipes_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportTeamsToExcel(teams: Team[], people: Person[], event?: Event | null): void {
  const peopleMap = new Map<string, Person>(people.map(p => [p.id, p]));

  const rowsEquipes: Array<Record<string, unknown>> = [];
  teams.forEach(t => {
    t.roles.forEach(r => {
      if (r.assignedPersonIds.length === 0) {
        rowsEquipes.push({
          'Evento': event?.name || 'Geral',
          'Equipe': t.name,
          'Descrição da Equipe': t.description,
          'Função': r.title,
          'Descrição da Função': r.description,
          'Vagas Ocupadas': 0,
          'Total Vagas': r.maxSpots || 'Ilimitado',
          'Nome do Integrante': '(Vaga aberta / Sem alocação)',
          'Categoria': '-',
          'Prioridade': '-',
          'Telefone': '-',
        });
      } else {
        r.assignedPersonIds.forEach(pid => {
          const p = peopleMap.get(pid);
          rowsEquipes.push({
            'Evento': event?.name || 'Geral',
            'Equipe': t.name,
            'Descrição da Equipe': t.description,
            'Função': r.title,
            'Descrição da Função': r.description,
            'Vagas Ocupadas': r.assignedPersonIds.length,
            'Total Vagas': r.maxSpots || 'Ilimitado',
            'Nome do Integrante': p ? p.name : 'Desconhecido',
            'Categoria': p ? p.type : '-',
            'Prioridade': p !== undefined ? `P${p.priority}` : '-',
            'Telefone': p?.phone || '-',
          });
        });
      }
    });
  });

  let totalRoles = 0;
  let totalSpots = 0;
  let filledSpots = 0;
  teams.forEach(t => {
    t.roles.forEach(r => {
      totalRoles++;
      totalSpots += r.maxSpots || 0;
      filledSpots += r.assignedPersonIds.length;
    });
  });

  const rowsResumo = [
    { 'Métrica': 'Evento', 'Valor': event?.name || 'Geral' },
    { 'Métrica': 'Data / Período', 'Valor': event?.date || '-' },
    { 'Métrica': 'Local', 'Valor': event?.location || '-' },
    { 'Métrica': 'Total de Equipes', 'Valor': teams.length },
    { 'Métrica': 'Total de Funções', 'Valor': totalRoles },
    { 'Métrica': 'Total de Vagas Cadastradas', 'Valor': totalSpots },
    { 'Métrica': 'Vagas Ocupadas', 'Valor': filledSpots },
    { 'Métrica': 'Vagas Abertas Restantes', 'Valor': Math.max(0, totalSpots - filledSpots) },
    { 'Métrica': 'Total de Pessoas Cadastradas', 'Valor': people.length },
    { 'Métrica': 'Data do Relatório', 'Valor': new Date().toLocaleString('pt-BR') },
  ];

  const workbook = XLSX.utils.book_new();
  const wsEquipes = XLSX.utils.json_to_sheet(rowsEquipes);
  const wsResumo = XLSX.utils.json_to_sheet(rowsResumo);

  XLSX.utils.book_append_sheet(workbook, wsEquipes, 'Equipes e Funções');
  XLSX.utils.book_append_sheet(workbook, wsResumo, 'Resumo Geral');

  const filePrefix = event?.name ? `JUSC_${event.name.replace(/[^a-zA-Z0-9]/g, '_')}` : 'JUSC_Equipes';
  XLSX.writeFile(workbook, `${filePrefix}_Planilha_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Dedicated People Report in PDF
export function exportPeopleToPDF(people: Person[], teams: Team[], event?: Event | null): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Top banner bar
  doc.setFillColor(15, 17, 23);
  doc.rect(0, 0, 297, 26, 'F');

  doc.setFillColor(255, 199, 0);
  doc.rect(0, 26, 297, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 199, 0);
  doc.text('JUSC - BANCO DE PESSOAS E INTEGRANTES', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 225);
  const eventSub = event ? `Alocações referentes ao evento: ${event.name}` : 'Relação Geral de Voluntários, Jovens, Tios e Coordenação';
  doc.text(eventSub, 14, 20);

  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text(`Gerado em: ${dateStr}`, 283, 20, { align: 'right' });

  // Map person allocations
  const personAllocations = new Map<string, Array<{ teamName: string; roleName: string }>>();
  teams.forEach(t => {
    t.roles.forEach(r => {
      r.assignedPersonIds.forEach(pid => {
        const list = personAllocations.get(pid) || [];
        list.push({ teamName: t.name, roleName: r.title });
        personAllocations.set(pid, list);
      });
    });
  });

  const tableBody = people.map(p => {
    const allocs = personAllocations.get(p.id) || [];
    const statusText = allocs.length > 0 ? 'Alocado' : 'Livre';
    const allocsText = allocs.length > 0
      ? allocs.map(a => `${a.teamName} › ${a.roleName}`).join('\n')
      : '-';

    const priorityLabel = `P${p.priority} (${p.priority === 3 ? 'Alta' : p.priority === 2 ? 'Média' : p.priority === 1 ? 'Baixa' : 'Padrão'})`;

    return [
      p.name,
      p.type,
      priorityLabel,
      p.phone || '-',
      statusText,
      allocsText,
      p.notes || '-',
    ];
  });

  autoTable(doc, {
    startY: 34,
    head: [['Nome Completo', 'Categoria', 'Prioridade', 'Telefone / WhatsApp', 'Status', 'Alocação (Equipe › Função)', 'Observações / Habilidades']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [24, 27, 36],
      textColor: [255, 199, 0],
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 3,
    },
    styles: {
      fontSize: 8,
      textColor: [40, 40, 45],
      cellPadding: 2.5,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 28 },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 32 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 65 },
      6: { cellWidth: 55 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: () => {
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `JUSC - Jovens Unidos Seguindo Cristo  •  Relatório de Pessoas  •  Página ${doc.getNumberOfPages()}`,
        148,
        202,
        { align: 'center' }
      );
    },
  });

  doc.save(`JUSC_Relatorio_Pessoas_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Dedicated People Report in Excel
export function exportPeopleToExcel(people: Person[], teams: Team[], event?: Event | null): void {
  const personAllocations = new Map<string, Array<{ teamName: string; roleName: string }>>();
  teams.forEach(t => {
    t.roles.forEach(r => {
      r.assignedPersonIds.forEach(pid => {
        const list = personAllocations.get(pid) || [];
        list.push({ teamName: t.name, roleName: r.title });
        personAllocations.set(pid, list);
      });
    });
  });

  const rows = people.map(p => {
    const allocs = personAllocations.get(p.id) || [];
    return {
      'Nome Completo': p.name,
      'Categoria': p.type,
      'Prioridade': p.priority,
      'Nível Prioridade': p.priority === 3 ? 'Alta' : p.priority === 2 ? 'Média' : p.priority === 1 ? 'Baixa' : 'Padrão',
      'Telefone / WhatsApp': p.phone || '-',
      'Status': allocs.length > 0 ? 'Alocado' : 'Livre / Disponível',
      'Quantidade de Funções': allocs.length,
      'Equipe(s)': allocs.map(a => a.teamName).join('; ') || 'Nenhuma',
      'Função(ões)': allocs.map(a => a.roleName).join('; ') || 'Nenhuma',
      'Observações / Habilidades': p.notes || '-',
      'Data de Cadastro': p.createdAt || '-',
    };
  });

  // Priority Summary
  const prioritySummary = [
    { 'Prioridade': 'Evento de Referência', 'Quantidade': event?.name || 'Geral' },
    { 'Prioridade': 'Prioridade 3 (Alta)', 'Quantidade': people.filter(p => p.priority === 3).length },
    { 'Prioridade': 'Prioridade 2 (Média)', 'Quantidade': people.filter(p => p.priority === 2).length },
    { 'Prioridade': 'Prioridade 1 (Baixa)', 'Quantidade': people.filter(p => p.priority === 1).length },
    { 'Prioridade': 'Prioridade 0 (Padrão)', 'Quantidade': people.filter(p => p.priority === 0).length },
    { 'Prioridade': 'Total de Pessoas', 'Quantidade': people.length },
    { 'Prioridade': 'Total Alocados', 'Quantidade': people.filter(p => (personAllocations.get(p.id)?.length || 0) > 0).length },
    { 'Prioridade': 'Total Livres', 'Quantidade': people.filter(p => (personAllocations.get(p.id)?.length || 0) === 0).length },
  ];

  const workbook = XLSX.utils.book_new();
  const wsPessoas = XLSX.utils.json_to_sheet(rows);
  const wsResumo = XLSX.utils.json_to_sheet(prioritySummary);

  XLSX.utils.book_append_sheet(workbook, wsPessoas, 'Banco de Pessoas');
  XLSX.utils.book_append_sheet(workbook, wsResumo, 'Resumo Geral');

  const filePrefix = event?.name ? `JUSC_Pessoas_${event.name.replace(/[^a-zA-Z0-9]/g, '_')}` : 'JUSC_Relatorio_Pessoas';
  XLSX.writeFile(workbook, `${filePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
