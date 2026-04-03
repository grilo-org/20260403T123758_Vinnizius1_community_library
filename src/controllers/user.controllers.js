/**
 * Este arquivo define o controller para a criação de usuários.
 *
 * A função `createUserController` é responsável por receber os dados do novo usuário
 * a partir do corpo da requisição (request body), passá-los para a camada de serviço
 * (`userService`) que fará a lógica de criação, e então enviar uma resposta
 * ao cliente com o resultado da operação.
 */
import userService from "../service/user.services.js";
import { AppError } from "../errors/AppError.js";
import { parsePhoneNumberWithError } from "libphonenumber-js";
/**
 * Helper function para sanitizar e logar erros de forma segura
 * Remove PII (emails, telefones, credenciais) e loga apenas campos não-sensíveis
 * @param {Error} error - O objeto de erro a ser logado
 * @param {Object} logger - Logger opcional (ex: processLogger). Usa console.error como fallback
 * @returns {void}
 */
function safeLogError(error, logger = null) {
  // Sanitizador: redacta dados sensíveis (emails, telefones, tokens, credenciais)
  const sanitize = (str) => {
    let s = String(str);

    // Redactar emails
    s = s.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, "[email redacted]");

    // Redactar números de telefone usando libphonenumber-js com fallback
    // Regex que captura: +55 11 9 1234-5678, (11) 91234-5678, +1 555 123 4567, etc
    const phoneRegex =
      /(?:\+\d{1,3}[\s\-]?)?(?:\(?\d{1,4}\)?[\s\-]?)?(?:9[\s\-]?)?\d{3,4}[\s\-]?\d{3,4}/g;
    s = s.replace(phoneRegex, (match) => {
      try {
        // Tenta parse com país padrão BR
        const parsed = parsePhoneNumberWithError(match, "BR");
        if (parsed && parsed.isValid && parsed.isValid()) {
          return "[phone redacted]";
        } else {
          return match;
        }
      } catch (e) {
        // Se falhar com BR, tenta sem país (E.164 format)
        try {
          const parsed = parsePhoneNumberWithError(match);
          if (parsed && parsed.isValid && parsed.isValid()) {
            return "[phone redacted]";
          } else {
            return match;
          }
        } catch (e2) {
          // Se ambas falhas, não é um telefone válido, manter original
          return match;
        }
      }
    });

    // Redactar credenciais
    s = s.replace(
      /(password|secret|token|apikey|key|authorization|bearer)\s*[:=]\s*[^\s,}]*/gi,
      "$1=[redacted]",
    );

    // Redactar connection strings (MongoDB, PostgreSQL, etc)
    s = s.replace(/mongodb:\/\/[^\s]*/gi, "mongodb://[redacted]");
    s = s.replace(/postgres:\/\/[^\s]*/gi, "postgres://[redacted]");

    return s.slice(0, 150); // Limite a 150 caracteres
  };

  // Extrair apenas campos não-sensíveis para logging estruturado
  let safeLogs = {
    errorType: "Unknown",
    errorMessage: "[internal error — message redacted]",
    errorCode: null,
    stackFrames: [],
  };

  if (error instanceof Error) {
    safeLogs.errorType = sanitize(error.name); // Ex: TypeError, ReferenceError, ValidationError
    safeLogs.errorMessage = sanitize(error.message);
    safeLogs.errorCode = error.code || null; // Ex: ENOENT, ECONNREFUSED (DB connection errors)

    // Sanitizar stack traces (remover primeira linha, sanitizar dados sensíveis)
    if (error.stack) {
      safeLogs.stackFrames = error.stack
        .split("\n")
        .slice(1) // Remove a primeira linha que contém error.name + error.message
        .map((line) => sanitize(line))
        .filter((line) => line.trim()); // Remove linhas vazias
    }
  } else {
    // Para non-Error throws: criar resumo seguro
    safeLogs.errorType = typeof error;
    safeLogs.errorMessage = sanitize(error);
  }

  // Usar logger fornecido ou fallback para console.error
  if (logger) {
    logger.error(safeLogs);
  } else {
    console.error(safeLogs);
  }
}

async function createUserController(req, res) {
  // Este controller recebe os dados do usuário do corpo da requisição (req.body),
  // chama o serviço responsável pela criação do usuário e retorna uma resposta apropriada.
  const newUser = req.body;

  try {
    const createdUser = await userService.createUserService(newUser);
    // O service retorna o usuário criado (já sem a senha),
    // e o controller é responsável por enviar a resposta HTTP, ou seja,
    // formata a resposta final para o cliente.
    // Defensivamente, removemos campos sensíveis antes de retornar
    const safeUser = {
      id: createdUser.id,
      username: createdUser.username,
      email: createdUser.email,
      avatar: createdUser.avatar,
    };
    return res.status(201).json({
      message: "Usuário criado com sucesso!",
      user: safeUser,
    });
  } catch (error) {
    // Verifica se o erro é uma instância da nossa classe personalizada AppError
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // Para qualquer outro erro desconhecido (banco de dados, bugs), loga e retornamos 500 e uma mensagem genérica
    safeLogError(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

/**
 * Controller para listar todos os usuários.
 * Recebe os parâmetros de paginação (limit e offset) via query string,
 * chama o serviço para obter os usuários, e retorna a resposta ao cliente.
 * Defensivamente, remove o campo de senha antes de enviar a resposta, mesmo que o serviço já faça isso,
 * para garantir que dados sensíveis nunca vazem.
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 * @returns {Promise<Response>} - Resposta HTTP com a lista de usuários ou mensagem de erro
 */
async function findAllUsersController(req, res) {
  const { limit = 10, offset = 0 } = req.query;

  try {
    const users = await userService.findAllUsersService(
      Number(limit),
      Number(offset),
    );
    const safeUsers = users.map(({ password, ...safeUser }) => safeUser);
    return res.status(200).json({ users: safeUsers });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    safeLogError(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
/**
 * Controller para encontrar um usuário por ID.
 * Recebe o ID do usuário via parâmetro de rota, chama o serviço para obter o usuário, e retorna a resposta ao cliente.
 * Defensivamente, remove o campo de senha antes de enviar a resposta, mesmo que o serviço já faça isso,
 * para garantir que dados sensíveis nunca vazem.
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 * @returns {Promise<Response>} - Resposta HTTP com o usuário encontrado ou mensagem de erro
 */
async function findUserByIdController(req, res) {
  // o 'id' vem do parâmetro da requisição, definido na rota como '/users/:id'
  const { id } = req.params;

  // DENTRO DO 'TRY' colocamos tarefas assíncronas que podem falhar, como chamadas a serviços ou banco de dados.
  try {
    const user = await userService.findUserByIdService(id);
    // The service already throws a 404 AppError if the user is not found.
    // The catch block below will handle it.

    const { password, ...safeUser } = user;
    return res.status(200).json({ user: safeUser });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    safeLogError(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

/**
 * Controller para atualizar um usuário.
 * Recebe o ID via parâmetros e os dados a serem alterados via corpo da requisição.
 * Utiliza o método .partial() do Zod na rota para permitir atualizações parciais.
 */
async function updateUserController(req, res) {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // O middleware 'validateNumericId' já converteu e validou o ID
    const updatedUser = await userService.updateUserService(id, updateData);

    // Defensivamente, removemos campos sensíveis antes de retornar
    const { password, ...safeUser } = updatedUser;

    return res.status(200).json({
      message: "Usuário atualizado com sucesso!",
      user: safeUser,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    safeLogError(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

/**
 * Controller para excluir um usuário.
 */
async function deleteUserController(req, res) {
  const { id } = req.params;

  try {
    // O middleware 'validateNumericId' já converteu e validou o ID
    await userService.deleteUserService(id);
    // Para DELETE, é comum retornar 204 No Content com corpo vazio, mas 200 com mensagem é mais explícito.
    return res.status(200).json({ message: "Usuário excluído com sucesso!" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    safeLogError(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export default {
  createUserController,
  findAllUsersController,
  findUserByIdController,
  updateUserController,
  deleteUserController,
};
