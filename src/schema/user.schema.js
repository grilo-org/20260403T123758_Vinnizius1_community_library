import { z } from "zod";
// Zod é uma biblioteca de validação de esquemas robusta, declarativa para JavaScript e TypeScript.
// Ele permite definir esquemas de validação para objetos, arrays, strings, números e outros tipos de dados.
// Com o Zod, você pode criar regras de validação personalizadas e
// garantir que os dados recebidos do cliente estejam no formato esperado
// sem ONERAR o Banco de Dados.

// São estes os dados que aceitarei do meu cliente
const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must have at least 3 characters")
    .max(20),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must have at least 6 characters"),
  avatar: z.string().url("Invalid URL").optional(),
});

// Não exportamos como default porque queremos exatamente este nome (userSchema)
export { userSchema };
