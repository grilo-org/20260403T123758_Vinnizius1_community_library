# Usamos uma imagem leve do Node.js
FROM node:20-alpine

# Define a pasta de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependências primeiro (otimiza o cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia o restante do código do projeto
COPY . .

# Cria um usuário não-privilegiado e muda a propriedade dos arquivos
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /usr/src/app

# Muda para o usuário não-privilegiado
USER nodejs

# Expõe a porta que a aplicação usa
EXPOSE 3000

# Adiciona verificação de saúde (Healthcheck)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "index.js"]