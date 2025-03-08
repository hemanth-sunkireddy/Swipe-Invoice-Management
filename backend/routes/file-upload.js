const express = require('express');
const multer = require('multer');
const router = express.Router();
require('dotenv').config();

const { model } = require('../config/genAI');
const { extractInvoice } = require('../helpers/invoiceExtractor');
const { insertInvoice, updateProduct, updateCustomer } = require('../services/dbUpdate');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { fileName, fileType, fileSize } = req.body;
    const fileBuffer = req.file.buffer;
    const mimeType = fileType === 'application/pdf' ? 'application/pdf' : fileType;

    const result = await extractInvoice(model, fileBuffer, mimeType);
    let summary = JSON.stringify(result, null, 2);

    const products = summary.items || [];
    const customer = summary.customer_name ? {
      customer_name: summary.customer_name,
      customer_gst: summary.customer_gst,
      place_of_supply: summary.place_of_supply
    } : {};

    const fileData = {
      fileName,
      fileType,
      fileSize,
      summary,
      fileBuffer: fileBuffer.toString('base64'),
      uploadedAt: new Date(),
    };

    await insertInvoice(fileData);

    const productUpdates = await Promise.all(products.map(updateProduct));
    const customerStatus = await updateCustomer(customer);
    console.log(productUpdates)
    console.log(customerStatus)
    res.json({
      message: 'File upload and processing successful',
      summary,
      productUpdates,
      customerStatus
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
