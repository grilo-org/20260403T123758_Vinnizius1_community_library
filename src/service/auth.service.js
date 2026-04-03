// O Chef de Cozinha da autenticação. Ele aplica as regras de negócio do login:

import bcrypt from "bcrypt";
import { generateJWT } from "../utils/jwt.utils.js";
import userRepositories from "../repositories/user.repositories.js";
import { AppError } from "../errors/AppError.js";

/**
 * REGRA DE SEGURANÇA CRÍTICA: Mensagem genérica proposital.
 * Nunca diga se foi o e-mail ou a senha que está errado.
 * Se um atacante sabe que o e-mail existe, ele só precisa quebrar a senha.
 */
const INVALID_CREDENTIALS_MSG = "E-mail ou senha inválidos.";

// Hash dummy para evitar "Timing Attacks".
// Garante que o bcrypt sempre tenha trabalho a fazer, equalizando o tempo de resposta.
// Hash fixo pré-computado para comparação constante. Nunca corresponde a credenciais reais.
const DUMMY_HASH =
  "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJ204sNihdk";

async function loginService({ email, password }) {
  // 1. BUSCA: Precisamos do hash da senha para comparar — usamos a função de auth
  const user = await userRepositories.findUserByEmailForAuthRepository(email);

  // 2. SEGURANÇA (TIMING ATTACK): Executamos a comparação SEMPRE.
  // Se o usuário não existir, comparamos contra o DUMMY_HASH.
  // O uso do operador `user?.password` previne erro se user for undefined.
  const passwordMatch = await bcrypt.compare(
    password,
    user?.password ?? DUMMY_HASH,
  );

  // 3. REGRA DE NEGÓCIO: Se usuário não existe OU senha não bate, erro genérico.
  if (!user || !passwordMatch) {
    throw new AppError(INVALID_CREDENTIALS_MSG, 401);
  }

  // 4. TOKEN: Credenciais válidas — gera o crachá digital
  const token = generateJWT(user.id);

  // 5. RESPOSTA: Retorna dados públicos + token (sem a senha!)
  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token };
}

export default { loginService };
