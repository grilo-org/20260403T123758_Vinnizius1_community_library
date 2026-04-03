# 🚀 Próximos Passos (Roadmap de Evolução)

Este documento registra as melhorias técnicas sugeridas para elevar o nível deste projeto de "Júnior" para "Pleno", após a conclusão do CRUD básico.

## 1. Implementar um ORM (Prisma ou TypeORM)

**O que é:** Substituir os comandos SQL manuais (`INSERT INTO...`) por uma biblioteca que gerencia o banco usando objetos JavaScript.
**Por que fazer:**

- Evita erros de sintaxe SQL.
- Aumenta a produtividade (autocompletar do VS Code funciona com o banco).
- Facilita a manutenção se o banco mudar no futuro.
  **Desafio:** Reescrever a camada `repositories` usando **Prisma ORM**.

## 2. Docker Compose (Ambiente Completo)

**O que é:** Criar um arquivo `docker-compose.yml` que sobe não apenas o Banco de Dados, mas também a aplicação Node.js (API) juntos.
**Por que fazer:**

- Permite que qualquer desenvolvedor baixe seu projeto e rode com um único comando (`docker-compose up`).
- Elimina o problema de "na minha máquina funciona".
  **Desafio:** Configurar a API para esperar o banco estar pronto antes de iniciar.

## 3. Testes Automatizados (Jest)

**O que é:** Criar scripts que testam seu código automaticamente.
**Por que fazer:**

- Garante que uma alteração nova não quebrou uma funcionalidade antiga (Regressão).
- É o diferencial número 1 em entrevistas técnicas.
  **Desafio:** Criar testes unitários para o `user.services.js` (testar a lógica de e-mail duplicado sem precisar rodar o banco de verdade).

---

## 📚 Tópicos Extras (Futuro Distante)

- **Autenticação JWT:** Proteger as rotas para que apenas usuários logados possam criar/editar livros.
- **Paginação:** Como retornar apenas 10 usuários por vez em vez de listar 1000 de uma vez.
- **Postgres Full Text Search:** Melhorar a busca de livros usando recursos nativos do banco (alternativa ao Elasticsearch).
