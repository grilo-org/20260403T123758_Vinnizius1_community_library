// O Garçom da autenticação. Sem lógica, só orquestra:

import authService from "../service/auth.service.js";

// Adicionamos o parâmetro 'next' para passar erros adiante
export async function loginController(req, res, next) {
  try {
    const result = await authService.loginService(req.body);

    // 200 OK: Login realizado com sucesso (não é 201, pois não criamos recurso)
    return res.status(200).json(result);
  } catch (error) {
    // Passa o erro para o Middleware Global (errorHandler)
    next(error);
  }
}
