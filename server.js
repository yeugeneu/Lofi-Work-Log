require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const PORT = process.env.PORT || 3000;

// SSL Certificate options
const options = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

let access_token = null;
let refresh_token = null;

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

// --- Spotify Auth Endpoints ---

app.get('/login', (req, res) => {
  const scope = 'streaming user-read-email user-read-private user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri
    }));
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      }
    });

    access_token = response.data.access_token;
    refresh_token = response.data.refresh_token;
    res.redirect('/');
  } catch (error) {
    console.error('Error exchanging code for token:', error.response ? error.response.data : error.message);
    res.status(500).send('Authentication Error');
  }
});

app.get('/auth/token', (req, res) => {
  res.json({ access_token });
});

app.get('/auth/refresh_token', async (req, res) => {
  if (!refresh_token) {
    return res.status(400).json({ error: 'No refresh token available' });
  }
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      }
    });

    access_token = response.data.access_token;
    res.json({ access_token });
  } catch (error) {
    console.error('Error refreshing token:', error.response ? error.response.data : error.message);
    res.status(500).send('Refresh Token Error');
  }
});

// --- End Spotify Auth Endpoints ---

// Start the server over HTTPS
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
