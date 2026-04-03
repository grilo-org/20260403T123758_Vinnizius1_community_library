import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";

/**
 * Gera um token JWT assinado com o ID do usuário.
 * @param {number} userId - ID do usuário autenticado
 * @returns {string} - Token JWT assinado
 */
export function generateJWT(userId) {
  // Se a variável de ambiente JWT_SECRET não estiver configurada, lançamos um erro.
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }
  // O payload é o que fica "dentro" do token.
  // NUNCA coloque senha, hash ou dados sensíveis aqui.
  // O payload pode ser lido por qualquer pessoa que tenha o token.
  return jwt.sign(
    { userId }, // Payload: o que queremos guardar no token
    process.env.JWT_SECRET, // Secret: chave para assinar (só o servidor sabe)
    { expiresIn: "7d" }, // Opções: token expira em 7 dias
  );
}
/**
 * Verifica e decodifica um token JWT.
 * @param {string} token - Token JWT a verificar
 * @returns {Object} - Payload decodificado ({ userId, iat, exp })
 */
export function verifyJWT(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Se o token for inválido ou expirado, jwt.verify lança um erro.
    // Traduzimos para AppError para manter o padrão da aplicação.
    // Log original error for debugging (avoid exposing to client)
    console.debug("JWT verification failed:", err.name, err.message);
    throw new AppError("Token inválido ou expirado.", 401);
  }
}
