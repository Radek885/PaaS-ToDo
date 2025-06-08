const express = require("express");
const cors = require("cors");
const allowedOrigins = ["https://paas-todo-frontend.onrender.com"];

const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
}));

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("DATABASE_URL:", process.env.DATABASE_URL);

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        due_date DATE NOT NULL,
        done BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tabela 'posts' gotowa.");
  } catch (err) {
    console.error("Błąd podczas tworzenia tabeli:", err);
    process.exit(1); // zakończ, jeśli nie możesz stworzyć tabeli
  }
})();

// API TODO
app.get("/todos", async (req, res) => {
  const result = await pool.query("SELECT * FROM todos ORDER BY due_date");
  res.json(result.rows);
});

app.post("/todos", async (req, res) => {
  const { title, content, due_date } = req.body;
  const result = await pool.query(
    "INSERT INTO todos (title, content, due_date) VALUES ($1, $2, $3) RETURNING *",
    [title, content, due_date]
  );
  res.status(201).json(result.rows[0]);
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, due_date, done } = req.body;
  const result = await pool.query(
    "UPDATE todos SET title=$1, content=$2, due_date=$3, done=$4 WHERE id=$5 RETURNING *",
    [title, content, due_date, done, id]
  );
  res.json(result.rows[0]);
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM todos WHERE id = $1", [id]);
  res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});


const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Backend dziala!
    </section>
  </body>
</html>
`
