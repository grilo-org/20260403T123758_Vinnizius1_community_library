import { Router } from "express";
import userController from "../controllers/user.controllers.js";
import { loginController } from "../controllers/auth.controllers.js";
import {
  validate,
  validateNumericId,
} from "../middlewares/validation.middlewares.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { userSchema } from "../schema/user.schema.js";

const router = Router();

// ============ ROTAS PÚBLICAS (sem autenticação) ============
// Qualquer cliente pode acessar estas rotas sem apresentar um token JWT.

// POST /users — Cadastro de novo usuário
// Fluxo: validate(Zod) → createUserController → Service → Repository
// Não preciso passar 'req' e 'res' aqui, pois o Express os injeta automaticamente.
router.post(
  "/users",
  validate(userSchema),
  userController.createUserController,
);

// POST /auth/login — Autenticação de usuário existente
// Fluxo: loginController → authService → Repository (busca com senha para bcrypt.compare)
// Retorna: { user: {...}, token: "eyJ..." }
router.post("/auth/login", loginController);

// ============ ROTAS PROTEGIDAS (autenticação obrigatória) ============
// O authMiddleware é aplicado a TODAS as rotas declaradas abaixo dele.
// Ele valida o token JWT do header "Authorization: Bearer <token>".
// Se válido, injeta req.userId e chama next(). Se inválido, retorna 401.
router.use(authMiddleware);

// GET /users — Listagem de todos os usuários
// Fluxo: authMiddleware → findAllUsersController → Service → Repository
router.get("/users", userController.findAllUsersController);

// GET /users/:id — Busca de usuário por ID
// ':id' é um parâmetro de rota acessível via 'req.params.id'
// validateNumericId garante que o ID é um inteiro positivo ANTES de tocar no banco.
router.get(
  "/users/:id",
  validateNumericId,
  userController.findUserByIdController,
);

// PATCH /users/:id — Atualização parcial de usuário
// Usamos PATCH (e não PUT) pois atualizamos apenas os campos enviados, não o recurso inteiro.
// userSchema.partial() torna todos os campos opcionais — ideal para updates parciais.
// Ex: enviar apenas { avatar: "nova_url" } sem precisar mandar username e email.
router.patch(
  "/users/:id",
  validateNumericId,
  validate(userSchema.partial()),
  userController.updateUserController,
);

// DELETE /users/:id — Exclusão de usuário
// validateNumericId previne queries desnecessárias no banco com IDs inválidos (ex: "abc", "-1").
router.delete(
  "/users/:id",
  validateNumericId,
  userController.deleteUserController,
);

export default router;
