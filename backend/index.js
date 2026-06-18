const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root123',
  database: process.env.DB_NAME || 'mydb',
}

let db

async function connectDB() {
  // MySQL start hone mein time lagta hai — retry karo
  for (let i = 0; i < 10; i++) {
    try {
      db = await mysql.createConnection(dbConfig)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS todos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          text VARCHAR(255) NOT NULL,
          done BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('Database connected!')
      return
    } catch (err) {
      console.log(`DB not ready, retrying... (${i + 1}/10)`)
      await new Promise(r => setTimeout(r, 3000))
    }
  }
  process.exit(1)
}

// GET all todos
app.get('/api/todos', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM todos ORDER BY created_at DESC')
  res.json(rows)
})

// POST new todo
app.post('/api/todos', async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'Text required' })
  const [result] = await db.execute('INSERT INTO todos (text) VALUES (?)', [text])
  res.json({ id: result.insertId, text, done: false })
})

// PUT toggle done
app.put('/api/todos/:id', async (req, res) => {
  const { done } = req.body
  await db.execute('UPDATE todos SET done = ? WHERE id = ?', [done, req.params.id])
  res.json({ success: true })
})

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  await db.execute('DELETE FROM todos WHERE id = ?', [req.params.id])
  res.json({ success: true })
})

connectDB().then(() => {
  app.listen(5000, () => console.log('Backend running on port 5000'))
})
