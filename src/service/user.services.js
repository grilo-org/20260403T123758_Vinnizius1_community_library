/*
  A camada de serviço (service layer) é responsável por conter a lógica e REGRAS de negócio da aplicação.
  Ela atua como um intermediário entre a camada de controle (controllers) e a camada de acesso a dados (repositories).
  Essa separação de responsabilidades promove um código mais organizado, testável e de fácil manutenção.
  Aqui acontece a validação de dados, regras de negócio, e a orquestração das chamadas aos repositórios.
  Exemplo: o que acontece se tentarmos criar dois usuários com o mesmo e-mail? 
  O Postgres vai dar um erro de "Unique Constraint". 
  O seu Service deve saber capturar isso e enviar uma mensagem amigável para o usuário.

*/

import userRepositories from "../repositories/user.repositories.js";
import { AppError } from "../errors/AppError.js";
import bcrypt from "bcrypt";
import { generateJWT } from "../utils/jwt.utils.js";

/**
 * SERVIÇO DE CRIAÇÃO DE USUÁRIO
 * Aqui aplicamos as "Regras de Negócio" antes de tocar no banco.
 */
async function createUserService(newUser) {
  const { username, email, password, avatar } = newUser;

  // 1. VALIDAÇÃO BÁSICA: Já foi feita pelo Zod no middleware! O código aqui chega limpo.

  // 2. SEGURANÇA: Criptografar a senha (Hash)
  // O número 10 é o "custo" (salt rounds). Quanto maior, mais seguro e mais lento. 10 é o padrão de mercado.
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. ORQUESTRAÇÃO: Cria um novo objeto com a senha criptografada e manda para o banco
  /*
     DEFENSE IN DEPTH (Defesa em Profundidade):
     Em vez de usar o spread operator (...newUser), montamos o objeto manualmente.
     Isso garante que, mesmo que o validador (Zod) deixe passar campos extras por engano,
     apenas os dados que realmente queremos (username, email, password, avatar) cheguem ao banco.
  */
  const newUserWithHash = {
    username,
    email,
    password: passwordHash,
    avatar,
  };
  const createdUser =
    await userRepositories.createUserRepository(newUserWithHash);

  if (!createdUser) {
    throw new AppError("User could not be created.", 500);
  }

  // Gera o token com o ID do usuário recém-criado
  const token = generateJWT(createdUser.id);

  // Remove a senha (defesa extra) e retorna objeto imutável com o token
  const { password: _password, ...safeUser } = createdUser;

  return { ...safeUser, token };
}

/**
 * Serviço para listar todos os usuários.
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Array>} - Array de usuários
 */
async function findAllUsersService(limit, offset) {
  const users = await userRepositories.findAllUsersRepository(limit, offset);
  return users.map(({ password, ...safeUser }) => safeUser);
}

/**
 * Serviço para encontrar um usuário por ID.
 * @param {number} id - ID do usuário
 * @returns {Promise<Object>} - Usuário encontrado
 * @throws {AppError} - 404 se usuário não encontrado
 */
async function findUserByIdService(id) {
  const user = await userRepositories.findUserByIdRepository(id);
  if (!user) {
    throw new AppError("User not found.", 404);
  }
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Serviço para atualizar dados de um usuário.
 * @param {number} id - ID do usuário
 * @param {Object} userData - Objeto com campos a atualizar
 * @returns {Promise<Object>} - Usuário atualizado (sem senha)
 */
async function updateUserService(id, userData) {
  const { username, email, password, avatar } = userData;

  // Monta o objeto de atualização com apenas os campos permitidos (Defense in Depth).
  // Isso evita a mutação do objeto 'userData' original e garante que apenas campos válidos sejam passados.
  const updateData = {};
  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email;
  if (avatar !== undefined) updateData.avatar = avatar;

  // Se uma nova senha for fornecida, cria o hash dela.
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  // O repositório já lança um erro 400 se 'updateData' estiver vazio
  // e um erro 404 se o usuário não for encontrado.
  const updatedUser = await userRepositories.updateUserRepository(
    id,
    updateData,
  );

  // A linha abaixo é uma garantia final de que a senha não será retornada.
  const { password: _password, ...safeUser } = updatedUser;
  return safeUser;
}

/**
 * Serviço para excluir um usuário.
 * @param {number} id - ID do usuário
 */
async function deleteUserService(id) {
  // O repositório já trata o erro 404 se o ID não existir
  await userRepositories.deleteUserRepository(id);
}

export default {
  createUserService,
  findAllUsersService,
  findUserByIdService,
  updateUserService,
  deleteUserService,
};
