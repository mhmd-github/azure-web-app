const express = require('express');
const { CosmosClient } = require('@azure/cosmos');

const app = express();
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 8080;

const connectionString = process.env.COSMOS_CONNECTION_STRING;

app.get('/', async (req, res) => {
    if (!connectionString) {
        return res.send('<h1>Error</h1><p>COSMOS_CONNECTION_STRING is missing in App Settings.</p>');
    }

    try {
        const client = new CosmosClient(connectionString);
        const container = client.database('AppDatabase').container('Items');
        
        // Fetch all items from Cosmos DB
        const { resources: items } = await container.items.readAll().fetchAll();

        // Build simple HTML list of items
        const itemListHtml = items.map(i => `<li><strong>${i.name}</strong> (${i.category})</li>`).join('');

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Azure DB Live Test</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; background: #f0f4f8; }
                    .card { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                    h1 { color: #0078d4; }
                    input, button { padding: 10px; margin: 5px 0; width: 100%; box-sizing: border-box; }
                    button { background: #0078d4; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; }
                    ul { text-align: left; background: #eef2f5; padding: 20px 30px; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Azure Cosmos DB Connected! 🚀</h1>
                    <p>Add a new entry to save it directly into Azure:</p>
                    <form action="/add" method="POST">
                        <input type="text" name="itemName" placeholder="Item name (e.g. Test Server 1)" required />
                        <input type="text" name="category" placeholder="Category (e.g. Infrastructure)" required />
                        <button type="submit">Save to Azure Database</button>
                    </form>
                    <h2>Database Items (${items.length}):</h2>
                    <ul>${itemListHtml || '<li>No items yet. Add one above!</li>'}</ul>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        res.send(`<h1>Database Error</h1><p>${error.message}</p>`);
    }
});

// POST endpoint to save user input into Cosmos DB
app.post('/add', async (req, res) => {
    try {
        const client = new CosmosClient(connectionString);
        const container = client.database('AppDatabase').container('Items');
        await container.items.create({
            name: req.body.itemName,
            category: req.body.category
        });
        res.redirect('/');
    } catch (error) {
        res.send(`<h1>Failed to Save Item</h1><p>${error.message}</p>`);
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
