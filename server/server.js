const express = require('express');
const cors = require('cors');

const accessRoutes = require('./routes/access');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/access', accessRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SQLite Access Log Server running on port ${PORT}`);
});
