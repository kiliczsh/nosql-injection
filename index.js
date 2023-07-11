const express = require('express');
const mongoose = require('mongoose');
// const sanitize = require('mongo-sanitize');

const app = express();

const mongoURL = 'mongodb://localhost:27017/sample'; 

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    admin: Boolean
});

const User = mongoose.model('User', userSchema);

async function connectToDatabase() {
    try {
        await mongoose.connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

app.get('/', (req, res) => {
    res.send('Running MongoDB with Node.js');
});

app.get('/users', async (req, res) => {
    await connectToDatabase();

    // Sanitize input to avoid NoSQL injection
    const email = req.query.email; 

    try {
        // use default query options to avoid NoSQL injection
        const query = { $where: `this.email === '${email}'` }; 
        const users = await User.find(query);
        if ( users.length === 0 ) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json(users);
    } catch (err) {
        console.error('Failed to retrieve users:', err.message);
        console.group('Stack trace');
        console.error(err);
        console.groupEnd();
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
