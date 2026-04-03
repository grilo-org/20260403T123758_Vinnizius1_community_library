/**
 * Classe padronizada para erros de regra de negócio da aplicação.
 * Permite definir uma mensagem e um código de status HTTP (padrão 400).
 */

// Conteúdo:
// export class AppError: Exportação nomeada da classe AppError, que estende a classe nativa Error do JavaScript.
// extends Error: Indica que AppError é uma subclasse de Error, herdando suas propriedades e métodos.
// constructor(message, statusCode = 400): O construtor da classe recebe uma mensagem de erro e um código de status HTTP, com valor padrão de 400 (Bad Request).
// super(message): Chama o construtor da classe pai (Error) para inicializar a mensagem de erro.
// this.statusCode = statusCode: Armazena o código de status HTTP na instância do erro para uso posterior.
// this.name = this.constructor.name: Define o nome da classe dinamicamente, facilitando a identificação do tipo de erro em logs e tratamento de erros.
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    // Faz com que o erro seja identificado como "AppError" em vez de "Error" nos logs e tratamento de erros.
    this.name = this.constructor.name;
  }
}
