import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
