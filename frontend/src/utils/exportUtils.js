import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exports data to an Excel file (.xlsx)
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file to be downloaded
 * @param {string} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, fileName = 'report', sheetName = 'Data') => {
    if (!data || data.length === 0) {
        console.error("No data provided for export");
        return;
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert JSON data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate the Excel file as a buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob from the buffer
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // Save the file using file-saver
    saveAs(blob, `${fileName}_${new Date().getTime()}.xlsx`);
};

/**
 * Specifically for Super Admin reports with formatted timestamps or status
 * @param {Array} data 
 * @param {string} type 
 */
export const exportSAReport = (data, type = 'General_Report') => {
    // We can add some pre-processing here if needed (e.g., formatting dates)
    exportToExcel(data, `Wapixo_SA_${type}`);
};

/**
 * Exports data to a PDF file (.pdf)
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file
 * @param {string} title - Title on the PDF
 * @param {Array} columns - Optional column mapping [{ header: 'Name', dataKey: 'name' }]
 */
export const exportToPDF = (data, fileName = 'report', title = 'Report', columns = null) => {
    if (!data || data.length === 0) {
        console.error("No data provided for export");
        return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(184, 92, 92); // Primary color
    doc.text(title, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Table
    let tableData = data;
    let tableHeaders = [];
    
    if (columns) {
        tableHeaders = [columns.map(c => c.header)];
        tableData = data.map(row => columns.map(c => row[c.dataKey]));
    } else {
        // Auto-generate from keys
        const keys = Object.keys(data[0]);
        tableHeaders = [keys.map(k => k.charAt(0).toUpperCase() + k.slice(1))];
        tableData = data.map(row => keys.map(k => row[k]));
    }

    autoTable(doc, {
        startY: 35,
        head: tableHeaders,
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [184, 92, 92], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        margin: { top: 35 }
    });

    doc.save(`${fileName}_${new Date().getTime()}.pdf`);
};
