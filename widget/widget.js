/**
 * Express server to serve the static 'widget' directory.
 * This is for local development/demo of the Pingbash Chat Widget.
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the 'widget' directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for any unknown routes (for SPA/demo)
// Use a regular expression instead of '*' to avoid path-to-regexp error
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Widget server running at http://localhost:${PORT}`);
});
