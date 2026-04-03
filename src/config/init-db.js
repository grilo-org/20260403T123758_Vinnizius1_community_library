import db from "./database.js";

/**
 * Script de inicialização das tabelas do banco de dados.
 * Diferente de um script CLI, aqui não fechamos a conexão (db.end)
 * pois o servidor continuará usando-a.
 */
async function initDb() {
  try {
    console.log("⏳ Verificando integridade das tabelas...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT
      )
    `);

    console.log("✅ Tabela 'users' pronta para uso!");
  } catch (error) {
    console.error("❌ Erro fatal ao inicializar banco de dados:", error);
    // Em produção, se o banco não subir, a aplicação deve parar.
    throw error;
  }
}

export default initDb;
