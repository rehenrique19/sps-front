# SPS Test Frontend

Interface React.js moderna e responsiva para o sistema de gerenciamento de usuários.

## 🚀 Inicialização Rápida

### Pré-requisitos
- **Node.js 22.18.0** (recomendado)
- npm ou yarn
- Backend rodando em `http://localhost:3001`

### Instalação
```bash
# Instalar dependências
npm install

# Instalar browsers para testes E2E (opcional)
npx playwright install

# Iniciar em desenvolvimento
npm start
```

**Aplicação disponível em**: `http://localhost:3000`

## 🧪 Executar Testes

### Testes Unitários
```bash
# Executar todos os testes unitários
npm test -- --watchAll=false

# Testes com cobertura
npm run test:coverage

# Testes em modo watch (desenvolvimento)
npm test
```

### Testes End-to-End
```bash
# Instalar browsers (primeira vez)
npx playwright install

# Executar testes E2E
npm run test:e2e

# Executar com interface gráfica
npm run test:e2e:ui
```

### Status dos Testes
- **Unitários**: 29 passed, 36 failed (necessitam ajustes)
- **Cobertura**: 33.95% statements (meta: 60%)
- **E2E**: 21 testes (requer setup do Playwright)

## 📊 Estrutura de Testes

```
src/__tests__/
├── components/          # Testes de componentes
│   ├── Layout.test.js
│   └── ProtectedRoute.test.js
├── contexts/            # Testes de contextos
│   └── AuthContext.test.js
├── dto/                 # Testes de DTOs
│   ├── LoginDTO.test.js
│   └── UserDTO.test.js
├── pages/               # Testes de páginas
│   ├── SignIn.test.js
│   ├── Users.test.js
│   └── UserView.test.js
└── services/            # Testes de serviços
    ├── ApiService.test.js
    └── UserService.test.js

e2e/                     # Testes end-to-end
├── auth.spec.js         # Fluxos de autenticação
├── navigation.spec.js   # Navegação e rotas
└── users.spec.js        # Gerenciamento de usuários
```

## 🔧 Scripts Disponíveis

```bash
npm start              # Servidor de desenvolvimento
npm run build          # Build de produção
npm test               # Testes unitários (watch mode)
npm run test:coverage  # Testes com cobertura
npm run test:e2e       # Testes end-to-end
npm run test:e2e:ui    # E2E com interface gráfica
```

## 🛠️ Configuração de Desenvolvimento

### Variáveis de Ambiente
Criar arquivo `.env` na raiz:
```bash
REACT_APP_SERVER_URL=http://localhost:3001
REACT_APP_DEBUG=false

# Para desenvolvimento (opcional)
REACT_APP_DEV_EMAIL=
REACT_APP_DEV_PASSWORD=

# Para testes
REACT_APP_TEST_PASSWORD=1234
REACT_APP_TEST_WRONG_PASSWORD=wrong
```

### Configuração do Jest
```json
{
  "collectCoverageFrom": [
    "src/**/*.{js,jsx}",
    "!src/index.js",
    "!src/utils/urlProtection.js",
    "!src/utils/devToolsProtection.js"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 60,
      "functions": 60,
      "lines": 60,
      "statements": 60
    }
  }
}
```

## 🔐 Recursos de Segurança

### Proteções Implementadas
- **JWT Token Management**: Armazenamento e renovação automática
- **Route Protection**: Rotas protegidas por autenticação
- **CSRF Protection**: Headers de segurança em requests
- **URL Masking**: Ocultação de URLs sensíveis em desenvolvimento
- **DevTools Protection**: Proteção contra inspeção em desenvolvimento

### Sanitização
- **Log Injection Prevention**: Logs sanitizados
- **Input Validation**: DTOs com validação
- **XSS Protection**: Sanitização de dados de entrada

## 🎨 Componentes Principais

### Páginas
- **SignIn**: Tela de login com validação
- **Users**: Lista de usuários com CRUD
- **UserForm**: Formulário de criação/edição
- **UserView**: Visualização detalhada do usuário

### Componentes
- **Layout**: Layout principal com navegação
- **ProtectedRoute**: Proteção de rotas
- **UserMenu**: Menu do usuário logado
- **SideNav**: Navegação lateral

### Contextos
- **AuthContext**: Gerenciamento de autenticação
- **ThemeContext**: Alternância de tema claro/escuro

## 📱 Responsividade

- **Mobile First**: Design adaptável
- **Breakpoints**: Suporte a diferentes tamanhos de tela
- **Touch Friendly**: Interface otimizada para touch
- **Acessibilidade**: Componentes acessíveis

## 🚀 Build e Deploy

### Build de Produção
```bash
# Gerar build otimizado
npm run build

# Arquivos gerados em build/
# Servir com servidor web estático
```

### Variáveis de Produção
```bash
REACT_APP_SERVER_URL=https://api.seudominio.com
NODE_ENV=production
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Testes Falhando
```bash
# Limpar cache do Jest
npm test -- --clearCache

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

#### E2E Não Funcionam
```bash
# Instalar browsers
npx playwright install

# Verificar se backend está rodando
curl http://localhost:3001/health
```

#### Erro de CORS
```bash
# Verificar variável de ambiente
echo $REACT_APP_SERVER_URL

# Verificar se backend permite origem
```

## 📈 Melhorias Futuras

### Testes
- [ ] Corrigir testes unitários falhando
- [ ] Aumentar cobertura para 80%+
- [ ] Implementar testes de acessibilidade
- [ ] Adicionar testes de performance

### Funcionalidades
- [ ] Internacionalização (i18n)
- [ ] PWA (Progressive Web App)
- [ ] Lazy loading de componentes
- [ ] Cache de dados offline

### Segurança
- [ ] Content Security Policy
- [ ] Subresource Integrity
- [ ] Implementar HTTPS obrigatório
- [ ] Auditoria de dependências

---

**Versão**: 0.1.0  
**Node.js**: 22.18.0  
**React**: 18.2.0  
**Status**: ✅ Funcional, 🔧 Testes em ajuste