import { AppError } from "../errors/AppError.js";

/**
 * Middleware global de tratamento de erros.
 * Intercepta qualquer erro lançado (next(err)) e formata a resposta.
 */
export function errorHandler(error, req, res, _next) {
  // Log do erro para debug (pode ser melhorado com bibliotecas de log como Winston/Pino)
  console.error({ message: error.message, stack: error.stack });

  // Se for um erro conhecido da nossa aplicação (regra de negócio)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  // Erro inesperado (banco fora do ar, bug no código, etc.)
  return res.status(500).json({ message: "Erro interno do servidor." });
}
