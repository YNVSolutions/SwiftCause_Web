// Shared CSV export utility
import { AlertType } from '../ui/AlertDialog';

export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  customHeaders?: string[],
  onAlert?: (message: string, type: AlertType) => void
) => {
  if (data.length === 0) {
    if (onAlert) {
      onAlert("No data to export.", "warning");
    } else {
      alert("No data to export.");
    }
    return;
  }

  // Use custom headers if provided, otherwise use object keys
  const headers = customHeaders || Object.keys(data[0]);
  const headerRow = headers.join(',');
  
  const csvContent = data.map(row => 
    headers.map(header => {
      const value = row[header];
      const stringValue = String(value || '');
      // Escape quotes and wrap in quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');

  const csv = `${headerRow}\n${csvContent}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};