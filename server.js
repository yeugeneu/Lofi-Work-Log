const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (your HTML file)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle form submissions
app.post('/save-accomplishment', (req, res) => {
  const newAccomplishment = req.body;

  // Read the existing accomplishments
  fs.readFile('./data/accomplishments.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Parse the existing data and add the new accomplishment
    const accomplishments = JSON.parse(data || '[]');
    accomplishments.push(newAccomplishment);

    // Write the updated data back to the file
    fs.writeFile('./data/accomplishments.json', JSON.stringify(accomplishments, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json({ message: 'Accomplishment saved successfully' });
    });
  });
});

app.get('/accomplishments', (req, res) => {
  fs.readFile('./data/accomplishments.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Send the accomplishments data as JSON
    res.json(JSON.parse(data || '[]'));
  });
});
// Endpoint to clear accomplishments
app.post('/clear-accomplishments', (req, res) => {
  // Write an empty array to the file
  fs.writeFile('./data/accomplishments.json', '[]', (err) => {
    if (err) {
      console.error('Error clearing accomplishments:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ message: 'Accomplishments cleared successfully' });
  });
});

// Endpoint to delete a specific accomplishment
app.post('/delete-accomplishment', (req, res) => {
  const indexToDelete = req.body.index;

  fs.readFile('./data/accomplishments.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    let accomplishments = JSON.parse(data || '[]');

    // Check if the index is valid
    if (indexToDelete < 0 || indexToDelete >= accomplishments.length) {
      return res.status(400).json({ error: 'Invalid index' });
    }

    // Remove the accomplishment at the specified index
    accomplishments.splice(indexToDelete, 1);

    // Write the updated data back to the file
    fs.writeFile('./data/accomplishments.json', JSON.stringify(accomplishments, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json({ message: 'Accomplishment deleted successfully' });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});