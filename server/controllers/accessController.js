const db = require('../db');

const logAccess = (req, res) => {
  const { userId, username } = req.body;
  
  if (!userId || !username) {
    return res.status(400).json({ error: 'userId and username are required' });
  }

  // Ensure user exists (INSERT OR IGNORE for SQLite)
  db.run(`INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)`, [userId, username], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Upsert logic for SQLite (ON CONFLICT DO UPDATE)
    const query = `
      INSERT INTO daily_access_logs (user_id, access_date, first_access_time, last_access_time, visit_count)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
      ON CONFLICT(user_id, access_date) DO UPDATE SET
        last_access_time = CURRENT_TIMESTAMP,
        visit_count = daily_access_logs.visit_count + 1
    `;

    db.run(query, [userId, today], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to log access' });
      }
      res.json({ message: 'Access logged successfully' });
    });
  });
};

module.exports = { logAccess };
