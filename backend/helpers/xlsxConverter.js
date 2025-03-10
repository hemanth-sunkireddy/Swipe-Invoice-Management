const xlsx = require('xlsx');

// Helper function to trim leading and trailing spaces from a string
const trimString = (str) => {
  if (typeof str === 'string') {
    return str.trim();
  }
  return str;
};

const convertXlsxToCsv = (fileBuffer) => {
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error('No sheets found in the uploaded XLSX file.');
  }

  // Convert sheet to JSON and filter out empty rows
  const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: null });

  // Format each row by trimming spaces from every cell and ensure it's valid JSON
  const formattedData = jsonData.map(row => {
    // Trim spaces from each value in the row dynamically (no predefined fields)
    const trimmedRow = Object.keys(row).reduce((acc, key) => {
      acc[key] = trimString(row[key]);
      return acc;
    }, {});

    return trimmedRow;
  });

  // Filter out rows with only empty values
  const nonEmptyRows = formattedData.filter(row => 
    Object.values(row).some(cell => cell !== null && cell !== "")
  );

  if (nonEmptyRows.length === 0) {
    throw new Error('The uploaded XLSX file contains only empty rows.');
  }

  // Convert filtered and formatted data back to CSV
  const filteredSheet = xlsx.utils.json_to_sheet(nonEmptyRows);
  const csvData = xlsx.utils.sheet_to_csv(filteredSheet);

  // Encode the CSV data as base64
  const base64Data = Buffer.from(csvData, 'utf-8').toString('base64');
  // console.log(base64Data);
  // console.log(csvData);
  return { csvData, base64Data };
};

module.exports = { convertXlsxToCsv };
