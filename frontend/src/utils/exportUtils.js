import jsPDF from 'jspdf';
import 'jspdf-autotable';

const sanitizeFileName = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const createDownloadLink = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sanitizeFileName(filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up memory
};

export const exportToJSON = (result, referenceFile, currentFile) => {
  const filename = `${referenceFile || 'reference'}_vs_${currentFile || 'current'}.json`;
  const exportData = {
    metadata: {
      referenceFile,
      currentFile,
      exportDate: new Date().toISOString(),
      version: '1.0'
    },
    ...result
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  });
  
  createDownloadLink(blob, filename);
};

export const exportToCSV = (result, referenceFile, currentFile) => {
  const headers = ['Type', 'Message', 'Expected', 'Actual', 'Position', 'Actual Position'];
  
  const rows = result.errors.map(e => [
    e.type || '',
    `"${(e.message || '').replace(/"/g, '""')}"`,
    e.expected || '',
    e.actual || '',
    e.position || '',
    e.actualPosition || ''
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const filename = `${referenceFile || 'reference'}_vs_${currentFile || 'current'}.csv`;
  
  createDownloadLink(blob, filename);
};

export const exportToPDF = (result, referenceFile, currentFile) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text('Report Verification Results', 14, 20);
  
  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Reference File: ${referenceFile}`, 14, 32);
  doc.text(`Current File: ${currentFile}`, 14, 38);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 44);
  
  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text('Summary', 14, 55);
  
  doc.autoTable({
    startY: 60,
    head: [['Metric', 'Value']],
    body: Object.entries(result.summary).map(([key, value]) => [
      key.replace(/([A-Z])/g, ' $1').trim(),
      value.toString()
    ]),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 10 }
  });
  
  // Errors Section (if any)
  if (result.errors && result.errors.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(239, 68, 68); // Red color
    doc.text(`Issues Found (${result.errors.length})`, 14, doc.lastAutoTable.finalY + 10);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Type', 'Message', 'Details']],
      body: result.errors.map(e => [
        e.type || 'N/A',
        e.message || 'N/A',
        `Expected: ${e.expected || 'N/A'}, Actual: ${e.actual || 'N/A'}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        2: { cellWidth: 80 }
      }
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94); // Green color
    doc.text('✓ All columns match perfectly!', 14, doc.lastAutoTable.finalY + 15);
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  const filename = `${referenceFile}_vs_${currentFile}.pdf`;
  doc.save(sanitizeFileName(filename));
};


