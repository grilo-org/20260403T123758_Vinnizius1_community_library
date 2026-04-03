import pg from "pg";
import "dotenv/config";
// "dotenv/config" é uma prática comum para carregar variáveis de ambiente do arquivo .env,
// mantendo as credenciais do banco seguras e fora do código-fonte.
// É o que chamamos de importação por efeito colateral (side-effect import):
// você não está importando um valor para usar depois,
// está importando um script para que ele seja executado imediatamente.

const { Pool } = pg;
// Desestruturando o Pool do módulo 'pg' para criar um pool de conexões.
// Com o Pool, o driver 'pg' gerencia automaticamente as conexões,
// reutilizando-as para melhorar a performance da aplicação.

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Teste de conexão inicial
db.connect()
  .then(() => {
    console.log("✅ Conectado ao PostgreSQL com sucesso!");
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no Postgres:", err.stack);
  });

export default db;
