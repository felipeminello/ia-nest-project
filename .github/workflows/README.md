# Configuração do GitHub Actions - CI/CD Pipeline

Este documento descreve como configurar o pipeline de CI/CD para o projeto nest-modular-monolith.

## 📋 Visão Geral do Pipeline

O pipeline possui 4 jobs principais:

1. **Lint** - Verifica qualidade do código com ESLint
2. **Test** - Executa testes unitários com cobertura mínima de 80%
3. **Build** - Compila a aplicação gerando artefatos
4. **Deploy** - Realiza deploy via SSH para o servidor remoto

### Fluxo de Execução

```
┌─────────┐     ┌─────────┐
│  Lint   │     │  Test   │  ← Executam em paralelo
└────┬────┘     └────┬────┘
     │               │
     └───────┬───────┘
             ▼
        ┌─────────┐
        │  Build  │
        └────┬────┘
             ▼
        ┌─────────┐
        │ Deploy  │  ← Apenas em push para main
        └─────────┘
```

## 🔧 Configuração Necessária

### Secrets do GitHub

Você precisa configurar os seguintes secrets no repositório GitHub:

1. Acesse: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

2. Adicione os seguintes secrets:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `SSH_PRIVATE_KEY` | Chave SSH privada para acesso ao servidor | Conteúdo do arquivo `~/.ssh/id_rsa` |
| `SSH_HOST` | Endereço IP ou domínio do servidor | `192.168.1.100` ou `server.example.com` |
| `SSH_USER` | Usuário SSH para conexão | `deploy` ou `ubuntu` |
| `DEPLOY_PATH` | Caminho no servidor onde será feito o deploy | `/var/www/nest-monolith` |

### Como gerar a chave SSH

Se você ainda não tem uma chave SSH configurada:

```bash
# Gerar chave SSH (no seu computador local)
ssh-keygen -t rsa -b 4096 -C "github-actions@deploy"

# Copiar chave pública para o servidor
ssh-copy-id -i ~/.ssh/id_rsa.pub usuario@servidor

# Copiar chave privada (adicionar como secret SSH_PRIVATE_KEY)
cat ~/.ssh/id_rsa
```

## 📊 Cobertura de Testes

O pipeline requer **mínimo de 80% de cobertura** nos testes unitários. Configure o Jest para gerar o relatório correto:

Verifique se o `jest.config.js` ou `package.json` possui:

```json
{
  "jest": {
    "coverageReporters": ["json-summary", "text", "lcov"],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## 🚀 Triggers do Workflow

O pipeline é executado automaticamente quando:

- **Push** para branches `main` ou `develop`
- **Pull Request** para branches `main` ou `develop`

### Deploy em Produção

O job de **deploy** só executa quando:
- Push para branch `main` (não em PRs ou outras branches)
- Todos os jobs anteriores (lint, test, build) passarem com sucesso

## 📦 Artefatos Gerados

O pipeline gera e armazena os seguintes artefatos por 7 dias:

1. **coverage-report** - Relatórios de cobertura de testes
2. **build-artifacts** - Aplicação compilada (pasta dist/)

## 🔄 Processo de Deploy

O deploy realiza as seguintes etapas:

1. **Backup** - Cria backup da versão atual em `backups/backup-YYYYMMDD-HHMMSS`
2. **Upload** - Copia novos arquivos para o servidor
3. **Instalação** - Executa `npm ci --production` no servidor
4. **Restart** - Reinicia a aplicação com PM2
5. **Verificação** - Confirma que a aplicação está rodando
6. **Rollback** - Em caso de falha, restaura o backup anterior

## 🛠️ Configuração do Servidor

No servidor remoto, você precisa:

### 1. Instalar Node.js e PM2

```bash
# Instalar Node.js 24.x
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para iniciar no boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

### 2. Criar estrutura de diretórios

```bash
# Criar diretório para a aplicação
sudo mkdir -p /var/www/nest-monolith
sudo chown $USER:$USER /var/www/nest-monolith
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` no servidor:

```bash
nano /var/www/nest-monolith/.env
```

Adicione as variáveis necessárias para sua aplicação.

## 🧪 Testando Localmente

Para testar os comandos antes do deploy:

```bash
# Lint
npm run lint

# Testes com cobertura
npm run test:cov

# Build
npm run build

# Verificar cobertura
cat coverage/coverage-summary.json | jq '.total.lines.pct'
```

## 📝 Logs e Monitoramento

### Ver logs do PM2 no servidor

```bash
# Ver lista de processos
pm2 list

# Ver logs da aplicação
pm2 logs nest-monolith

# Monitorar em tempo real
pm2 monit
```

### Ver logs do GitHub Actions

1. Acesse a aba `Actions` no repositório
2. Selecione o workflow executado
3. Clique no job específico para ver os logs detalhados

## 🔐 Segurança

⚠️ **Importante**:
- Nunca commite chaves SSH ou secrets no código
- Use apenas GitHub Secrets para dados sensíveis
- Mantenha as permissões do servidor restritas
- Revise regularmente os acessos SSH

## 🐛 Troubleshooting

### Erro: Coverage abaixo de 80%

```bash
# Execute localmente para identificar áreas sem cobertura
npm run test:cov

# Veja o relatório HTML
open coverage/lcov-report/index.html
```

### Erro: Falha na conexão SSH

```bash
# Testar conexão SSH localmente
ssh -i ~/.ssh/id_rsa usuario@servidor

# Verificar se a chave pública está no servidor
cat ~/.ssh/authorized_keys
```

### Erro: PM2 não encontrado

```bash
# No servidor, instalar PM2 globalmente
sudo npm install -g pm2
```

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [NestJS Deployment](https://docs.nestjs.com/faq/serverless)
