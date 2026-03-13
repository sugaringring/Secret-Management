require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || "6.1.1";
const FLAG = process.env.FLAG || "FLAG{f4k3_fl4g_f0r_t3st1ng}";

app.use(express.json());
app.use(express.static('public')); // Serve the frontend

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send('Access Denied: No Token Provided!');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid Token');
        req.user = user;
        next();
    });
}

// Middleware to authorize Admin
function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access Denied: Admins Only');
    }
    next();
}

// Public Route: Get API Version
app.get('/api/version', (req, res) => {
    res.json({ version: VERSION });
});

// Public Route: Login to get a token
app.post('/login', (req, res) => {
    // Mock user (in real app, verify from DB)
    const username = req.body.username;
    if (!username) return res.status(400).send('Username required');

    if (!username) return res.status(400).send('Username required');

    const user = { name: username, role: 'user' };

    // Generate Token
    const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken });
});

// Protected API Route
app.get('/api/secure', authenticateToken, (req, res) => {
    res.send(`<p><b>Status:</b> Online</p><p><b>Version:</b> ${VERSION} Secure</p><p><b>User:</b> ${req.user.name}</p>`);
});

// Admin Route
app.get('/admin', authenticateToken, authorizeAdmin, (req, res) => {
    res.send(`<h1>Admin Panel</h1><p>Welcome to School, Admin!</p><p><b>Flag:</b> ${FLAG}</p>`);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});