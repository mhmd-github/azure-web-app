const express = require('express');
const { CosmosClient } = require('@azure/cosmos');

const app = express();
const port = process.env.PORT || 8080;

// Reads connection string safely from Azure Environment Variables
const connectionString = process.env.COSMOS_CONNECTION_STRING;

app.get('/', async (req, res) => {
    if (!connectionString) {
        return res.send('<h1>Server Running!</h1><p>Database connection string is missing in App Settings.</p>');
    }

    try {
        const client = new CosmosClient(connectionString);
        // Connect to database and retrieve server status
        const { resources: databases } = await client.databases.readAll().fetchAll();
        
        res.send(`
            <div style="font-family: Arial; padding: 40px; text-align: center;">
                <h1 style="color: #0078d4;">Connected to Azure Database! 🚀</h1>
                <p>Successfully queried Azure Cosmos DB.</p>
                <p><strong>Total Databases Found:</strong> ${databases.length}</p>
            </div>
        `);
    } catch (error) {
        res.send(`<h1>Database Connection Failed</h1><p>${error.message}</p>`);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
