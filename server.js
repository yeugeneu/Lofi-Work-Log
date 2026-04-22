const express = require('express');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup lowdb
const adapter = new FileSync(path.join(__dirname, 'data', 'accomplishments.json'));
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ accomplishments: [] }).write();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle form submissions
app.post('/save-accomplishment', (req, res) => {
  try {
    const newAccomplishment = req.body;
    
    // Input validation
    if (!newAccomplishment || typeof newAccomplishment.text !== 'string' || !newAccomplishment.text.trim()) {
      return res.status(400).json({ error: 'Invalid or missing accomplishment text' });
    }
    if (typeof newAccomplishment.time !== 'string' || !newAccomplishment.time.trim()) {
      return res.status(400).json({ error: 'Invalid or missing accomplishment time' });
    }

    // Save to lowdb
    db.get('accomplishments')
      .push(newAccomplishment)
      .write();
      
    res.json({ message: 'Accomplishment saved successfully' });
  } catch (err) {
    console.error('Error saving accomplishment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get all accomplishments
app.get('/accomplishments', (req, res) => {
  try {
    // If the old raw JSON was just an array, we might need to handle it.
    // Assuming the file is now structured with { accomplishments: [...] } 
    // due to defaults(), or if it was just an array, we need to adapt.
    // Let's ensure compatibility if the file already had an array instead of object.
    let data = db.getState();
    if (Array.isArray(data)) {
        // Migration from old array format
        db.setState({ accomplishments: data }).write();
    }
    
    const accomplishments = db.get('accomplishments').value() || [];
    res.json(accomplishments);
  } catch (err) {
    console.error('Error reading accomplishments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to clear accomplishments
app.post('/clear-accomplishments', (req, res) => {
  try {
    db.set('accomplishments', []).write();
    res.json({ message: 'Accomplishments cleared successfully' });
  } catch (err) {
    console.error('Error clearing accomplishments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to delete a specific accomplishment
app.post('/delete-accomplishment', (req, res) => {
  try {
    const indexToDelete = req.body.index;
    const accomplishments = db.get('accomplishments').value();

    if (indexToDelete < 0 || indexToDelete >= accomplishments.length) {
      return res.status(400).json({ error: 'Invalid index' });
    }

    // Remove by index and rewrite
    accomplishments.splice(indexToDelete, 1);
    db.set('accomplishments', accomplishments).write();
    
    res.json({ message: 'Accomplishment deleted successfully' });
  } catch (err) {
    console.error('Error deleting accomplishment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
