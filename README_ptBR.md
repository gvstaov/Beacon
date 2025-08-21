# Beacon

Um aplicativo de produtividade moderno e completo, desenvolvido com Electron e TypeScript. Oferece armazenamento local, interface moderna, funcionalidades essenciais para organização e produtividade.

## Características Principais

- **Armazenamento Local Seguro** - Todos os dados ficam em seu computador
- **Interface Moderna** - UX/UI otimizada e responsiva
- **Performance Otimizada** - Construído com TypeScript e Webpack
- **App Nativo para Windows** - Aplicativo para desktop
- **Auto-save Inteligente** - Salva automaticamente suas alterações
- **Editor Rico** - Formatação de texto, listas, cabeçalhos
- **Sistema de Páginas** - Organize seu conteúdo em páginas
- **Import/Export** - Backup e migração de dados
- **Atalhos de Teclado** - Produtividade otimizada

## Tecnologias Utilizadas

- **Frontend:** TypeScript, HTML5, CSS3
- **Desktop:** Electron
- **Build:** Webpack
- **Packaging:** Electron Builder
- **Linting:** ESLint
- **Styling:** CSS Modules com variáveis CSS

## 📦 Pré-requisitos

- Node.js 16+
- npm ou yarn
- Git

## Instalação e Desenvolvimento

### 1. Clone o repositório

```bash
git clone https://github.com/gvstaov/Beacon.git
cd Beacon
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Estrutura do projeto

```
Beacon/
├── src/
│   ├── main.ts              # Processo principal do Electron
│   ├── preload.ts           # Script de preload seguro
│   └── renderer/            # Interface do usuário
│       ├── index.html       # Template principal
│       ├── index.ts         # Entrada da aplicação
│       ├── app/             # Lógica da aplicação
│       │   └── Beacon.ts
│       └── styles/          # Estilos CSS
│           └── app.css
├── assets/                  # Ícones e recursos
├── dist/                    # Arquivos compilados
├── release/                 # Executáveis gerados
├── package.json             # Configuração do projeto
├── tsconfig.json           # Configuração TypeScript
├── webpack.main.config.js  # Config Webpack (main)
└── webpack.renderer.config.js # Config Webpack (renderer)
```

## Scripts de Desenvolvimento

### Desenvolvimento

```bash
# Inicia em modo de desenvolvimento
npm run dev

# Apenas o processo principal
npm run dev:main

# Apenas o renderer
npm run dev:renderer
```

### Build

```bash
# Build completo
npm run build

# Build para produção
npm run build:prod

# Limpa arquivos de build
npm run clean
```

### Distribuição

```bash
# Cria executável (pasta)
npm run pack

# Cria instalador completo
npm run dist

# Windows específico
npm run dist:win

# macOS específico
npm run dist:mac

# Linux específico
npm run dist:linux
```

## Funcionalidades Detalhadas

### Editor de Texto Rico

- Formatação: **negrito**, _itálico_, <u>sublinhado</u>
- Cabeçalhos H1, H2, H3
- Listas com marcadores
- Lista de tarefas (todos) interativas
- Blocos organizados com handles visuais

### Sistema de Páginas

- Criação ilimitada de páginas
- Ícones personalizáveis (emojis)
- Navegação rápida via sidebar
- Títulos editáveis em tempo real

### Armazenamento e Backup

- **Armazenamento local seguro** via API do Electron
- Auto-save a cada 15 segundos
- Export para HTML e JSON
- Import de dados JSON
- Sem dependência de internet

### Temas e Customização

- Tema claro e escuro
- Transições suaves
- Interface responsiva
- Variáveis CSS para fácil customização

### Atalhos de Teclado

- `Ctrl+N` - Nova página
- `Ctrl+S` - Salvar
- `Ctrl+B` - Negrito
- `Ctrl+I` - Itálico
- `Ctrl+U` - Sublinhado
- `Ctrl+1/2/3` - Cabeçalhos
- `Ctrl+Shift+T` - Alternar tema
- `F11` - Tela cheia
- `Esc` - Fechar modais

## Segurança

- **Context Isolation** habilitado
- **Node Integration** desabilitado no renderer
- **Content Security Policy** implementada
- **Preload script** com API limitada e segura
- Dados armazenados apenas localmente

## Arquitetura

### Processo Principal (main.ts)

- Gerencia janela da aplicação
- Controla menu nativo
- Manipula arquivos do sistema
- Armazenamento seguro de dados

### Processo Renderer (renderer/)

- Interface do usuário
- Lógica da aplicação
- Editor de texto
- Gerenciamento de estado

### Comunicação IPC

- Canal seguro entre main e renderer
- APIs expostas via contextBridge
- Handlers para operações de arquivo

## Personalização de Temas

O sistema de temas usa variáveis CSS para fácil customização:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #37352f;
  --accent-color: #2383e2;
  /* ... outras variáveis */
}

[data-theme="dark"] {
  --bg-primary: #191919;
  --text-primary: #ffffff;
  /* ... override para tema escuro */
}
```

## Responsividade

- Layout adaptativo para diferentes tamanhos de tela
- Sidebar colapsível em mobile
- Toolbar otimizada para touch
- Fontes e espaçamentos escaláveis

## Debug e Logs

### Modo Desenvolvimento

```bash
# Habilita DevTools automaticamente
NODE_ENV=development npm run dev
```

### Logs da Aplicação

- Console do renderer para interface
- Console do main para sistema
- Logs de auto-save e operações de arquivo

## Builds de Distribuição

### Windows

- Formato NSIS (instalador)
- Formato Portable (executável único)
- Suporte x64 e x86

### macOS

- Formato DMG (imagem de disco)
- Formato ZIP (arquivo compactado)
- Suporte Intel e Apple Silicon

### Linux

- Formato AppImage (universal)
- Formato DEB (Debian/Ubuntu)
- Formato RPM (Red Hat/Fedora)

## Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de Código

- TypeScript strict mode habilitado
- ESLint configurado para consistência
- Comentários em português para funções principais
- Nomes de variáveis e funções em inglês

## 🐛 Problemas Conhecidos

### Windows

- Antivírus pode alertar sobre executável não assinado
- Primeira execução pode ser mais lenta

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙋 Suporte

- 📧 Email: gustavoavlis@icloud.com
- 🐛 Issues: [GitHub Issues](https://github.com/gvstaov/Beacon/issues)
- 📚 Wiki: [Documentação Completa](https://github.com/seu-usuario/Beacon/wiki)

---

**Beacon** - Sua produtividade, suas regras. 🚀
