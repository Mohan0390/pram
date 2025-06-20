// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');
// const xml2js = require('xml2js');
// const path = require('path');

// const app = express();
// const port = process.env.PORT || 3399;

// app.use(cors());
// app.use(express.static(path.join(__dirname, '../client/dist')));

// // SAP OData URL and credentials
// const SAP_URL = "https://my421534-api.s4hana.cloud.sap/sap/opu/odata/sap/YY1_CUSTOMERINVOICE_CDS/YY1_CustomerInvoice";
// const AUTH = {
//     SAP_USERNAME: "APIBTPDEV",
//     SAP_PASSWORD: "czzdA9zFAzeyXXXtFUchUYvSGtap~NQPvTKPJnqh"
// };

// // Basic Authentication header
// const authHeader = 'Basic ' + Buffer.from(`${AUTH.SAP_USERNAME}:${AUTH.SAP_PASSWORD}`).toString('base64');

// // API endpoint for QR Data
// app.get('/QR', async (req, res) => {
//     const { CompanyCode, FiscalYear, AccountingDocument } = req.query;

//     if (!CompanyCode || !FiscalYear || !AccountingDocument) {
//         return res.status(400).json({ error: 'Missing required query parameters.' });
//     }

//     const filter = `CompanyCode eq '${CompanyCode}' and FiscalYear eq '${FiscalYear}' and AccountingDocument eq '${AccountingDocument}'`;
//     const url = `${SAP_URL}?$filter=${encodeURIComponent(filter)}`;

//     try {
//         const response = await axios.get(url, {
//             headers: { 'Authorization': authHeader, 'Accept': 'application/xml' }
//         });

//         xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
//             if (err) {
//                 return res.status(500).json({ error: 'Failed to parse XML.' });
//             }

//             const entries = result['feed']?.['entry'];
//             if (!entries) {
//                 return res.status(404).json({ error: 'No matching invoice found.' });
//             }

//             const entry = Array.isArray(entries) ? entries[0] : entries;
//             const properties = entry?.content?.['m:properties'];

//             res.json(properties);
//         });
//     } catch (error) {
//         console.error('SAP OData Fetch Error:', error.message);
//         res.status(500).json({ error: 'Error fetching data from SAP OData' });
//     }
// });

// app.use(express.static(path.join(__dirname, '../client/dist')));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/dist/index.html'));
// });

// app.listen(port, () => {
//     console.log(`✅ Server running at http://localhost:${port}`);
// });


const express = require('express');
const axios = require('axios');
const cors = require('cors');
const xml2js = require('xml2js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3399;

app.use(cors());
app.use(express.static(path.join(__dirname, '../client/dist')));

// SAP OData config
const SAP_URL = "https://my421534-api.s4hana.cloud.sap/sap/opu/odata/sap/YY1_CUSTOMERINVOICE_CDS/YY1_CustomerInvoice";
const AUTH = {
    SAP_USERNAME: "APIBTPDEV",
    SAP_PASSWORD: "czzdA9zFAzeyXXXtFUchUYvSGtap~NQPvTKPJnqh"
};

const authHeader = 'Basic ' + Buffer.from(`${AUTH.SAP_USERNAME}:${AUTH.SAP_PASSWORD}`).toString('base64');

// API Endpoint
app.get('/QR', async (req, res) => {
    const { CompanyCode, FiscalYear, AccountingDocument } = req.query;

    if (!CompanyCode || !FiscalYear || !AccountingDocument) {
        return res.status(400).json({ error: 'Missing required query parameters.' });
    }

    const filter = `CompanyCode eq '${CompanyCode}' and FiscalYear eq '${FiscalYear}' and AccountingDocument eq '${AccountingDocument}'`;
    const url = `${SAP_URL}?$filter=${encodeURIComponent(filter)}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/xml'
            }
        });

        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'XML parse failed.' });
            }

            console.log('Raw SAP Response:', JSON.stringify(result)); // 👈 Important Debugging log

            const entries = result['feed']?.['entry'];
            if (!entries) {
                return res.status(404).json({ error: 'No matching invoice found!' });
            }

            const entry = Array.isArray(entries) ? entries[0] : entries;
            const properties = entry?.content?.['m:properties'];

            res.json(properties);
        });

    } catch (error) {
        console.error('SAP OData Error:', error.message);
        console.error('Full SAP Error:', error.response?.data); // 👈 See SAP error message
        res.status(500).json({ error: 'SAP OData fetch failed.' });
    }
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});


app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
