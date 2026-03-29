# AZELL

**AZELL** is a high-performance, native desktop notebook application designed for fluid text organization, robust markdown editing, and seamless workspace management. It is built as a hybrid desktop app combining a snappy **React/TypeScript** frontend with a powerful **Rust (Tauri)** backend and local **SQLite** persistent storage.

---

## ⚡ Core Features

*   **Workspaces & Tabs Architecture**: Keep your thoughts organized. Create independent workspaces, each containing endless tabs for distinct contexts and projects.
*   **Block-Based Cell Editor**: AZELL uses a cell-based notebook approach.
    *   **Markdown Cells**: Full GFM (GitHub Flavored Markdown) support for rich text.
    *   **Image Cells**: Natively drag and drop, or paste from your clipboard. Images are securely stored in the app's internal filesystem (avoiding broken external links).
*   **Collapsible Sections**: Organizing long documents is effortless. Start a single-line cell with `# Title` and AZELL intelligently turns it into a collapsible section, hiding or showing all cells below it at the click of a button.
*   **Dynamic UX**: Resizable sidebar, clean modern dark-theme aesthetics, line-number tracking, sticky action buttons, and drag-to-reorder cell interfaces.
*   **Smart Undo/Redo Engine**: The app features a highly granular textual and structural history stack. Press `Ctrl+Z` while typing to undo individual keystrokes, or press it outside an edit block to undo structural layout actions (like deleting or moving entire cells).
*   **Offline-First & Lightning Fast**: No cloud latency, no loading spinners. Everything is saved locally via highly optimized SQLite queries bound directly via Tauri IPC.
*   **Auto-Update System**: Integrated Tauri updater automatically fetches and applies new releases, keeping the client seamlessly up to date.
*   **Import / Export Ecosystem**:
    *   **Export Workspace**: Consolidate your knowledge out of AZELL. Click export to generate a folder with standard `.md` files for every tab, and an `images/` directory containing all your physical image assets automatically converted to standard markdown tags.
    *   **Import Markdown**: Drag an `.md` file in to instantly generate a new Workspace + Tab. AZELL automatically parses double-newlines into native cells, processes image syntax `![alt](local_path)`, locates the system files, and ingests them natively.

---

## ⌨️ Keyboard Shortcuts

AZELL is designed for keyboard power-users. When **not actively typing inside a cell**, you can use the following shortcuts to manipulate your notebook structure:

| Action | Shortcut | Description |
| :--- | :--- | :--- |
| **Undo** | `Ctrl + Z` | Reverts the last structural or text edit. |
| **Redo** | `Ctrl + Shift + Z` | Repeats the last reverted action. |
| **Delete Cell** | `Ctrl + Shift + D` | Deletes the currently selected cell. |
| **Duplicate Cell**| `Ctrl + Shift + C` | Duplicates the selected cell exactly below it. |
| **Move Up** | `Alt + ↑` | Moves the selected cell up one position. |
| **Move Down** | `Alt + ↓` | Moves the selected cell down one position. |

*Inside a cell*, `Ctrl+Z` acts contextually to undo fine-grained typing blocks before falling back to structural changes.

---

## 🏗️ Technical Architecture

### Tech Stack
*   **Frontend**: React 19, TypeScript, Vite, CSS Modules (Custom Design System).
*   **Markdown Engine**: `react-markdown`, `remark-gfm`, `remark-breaks`.
*   **Backend**: Rust, Tauri v2.
*   **Database**: SQLite (`rusqlite`), executing raw SQL for maximum performance.
*   **Plugins**: `@tauri-apps/plugin-dialog` & `@tauri-apps/plugin-fs` (for OS-level File System access).

### Database Model
The application relies gracefully on an interconnected relational schema:
*   `workspaces (id, name, created_at)`
*   `tabs (id, workspace_id, title, created_at)`
*   `cells (id, tab_id, position, cell_type, content, ...)`
    *   *Type 0*: Markdown Text.
    *   *Type 1*: Image (Content stores internal OS URI mapping).

### Cell Virtualization
AZELL handles massive quantities of complex cells using `@tanstack/react-virtual` to recycle DOM elements out-of-view, maintaining 60FPS scrolling independently of doc size.

---

## 🚀 Getting Started for Developers

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Rust](https://www.rust-lang.org/tools/install)
*   Platform Build Dependencies (e.g., C++ Build Tools for Windows, or Xcode Command Line Tools for macOS).

### Installation & Development

1. Clone the repository and install npm dependencies:
   ```bash
   npm install
   ```

2. Run the development environment:
   ```bash
   npm run tauri dev
   ```
   *Note: On Windows PowerShell, you may need to ensure cargo is in your path:*
   ```powershell
   $env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run tauri dev
   ```

3. Build for Production:
   ```bash
   npm run tauri build
   ```
   
## Releases

Releases are automatically generated when a version tag is pushed.

Example:

```bash
git tag v0.1.0
git push origin v0.1.0
```

This will trigger the CI pipeline which builds the application for Windows and Linux and publishes the installers to GitHub Releases. For more details, see the [Release Guide](docs/release.md).

---


<br/>
<br/>
<br/>

# AZELL (Português)

**AZELL** é um aplicativo de anotações (notebook) nativo e de alta performance para desktop, projetado para organização fluida de textos, edição robusta de markdown e gerenciamento contínuo de espaços de trabalho. Foi construído como um aplicativo desktop híbrido, combinando um frontend rápido em **React/TypeScript** com um backend poderoso em **Rust (Tauri)** e armazenamento persistente local em **SQLite**.

---

## ⚡ Principais Funcionalidades

*   **Arquitetura de Workspaces & Tabs**: Mantenha seus pensamentos organizados. Crie espaços de trabalho (workspaces) independentes, cada um contendo infinitas abas (tabs) para contextos e projetos distintos.
*   **Editor Baseado em Células (Blocos)**: AZELL usa uma abordagem de notebook baseada em células.
    *   **Células Markdown**: Suporte completo a GFM (GitHub Flavored Markdown) para textos ricos.
    *   **Células de Imagem**: Arraste e solte nativamente, ou cole imagens diretamente da sua área de transferência. As imagens são armazenadas de forma segura no sistema de arquivos interno do aplicativo (evitando links externos quebrados).
*   **Seções Colapsáveis**: Organizar documentos longos é fácil. Inicie uma nova célula de linha única com `# Título` e o AZELL a transforma de forma inteligente em uma seção colapsável, ocultando ou exibindo todas as células abaixo dela com o clique de um botão.
*   **Experiência de Usuário (UX) Dinâmica**: Barra lateral redimensionável, estética moderna e limpa com tema escuro (Dark Theme), rastreamento de números de linha, botões de ação fixos e interfaces para reordenar células arrastando (drag-and-drop).
*   **Motor Inteligente de Desfazer/Refazer (Undo/Redo)**: O aplicativo possui uma pilha de histórico textual e estrutural altamente granular. Pressione `Ctrl+Z` enquanto digita para desfazer teclas individuais, ou pressione fora de um bloco de edição para desfazer ações de layout estrutural (como excluir ou mover células inteiras).
*   **Foco Offline e Ultra-Rápido**: Sem latência de nuvem, sem telas de carregamento. Tudo é salvo localmente por meio de consultas SQLite altamente otimizadas, conectadas diretamente via IPC do Tauri.
*   **Sistema de Atualização Automática**: O atualizador integrado busca e aplica novas versões de forma transparente, mantendo o cliente sempre atualizado.
*   **Ecossistema de Importação / Exportação**:
    *   **Exportar Workspace**: Consolide seu conhecimento fora do AZELL. Clique em exportar para gerar uma pasta com arquivos `.md` padrões para cada aba, além de um diretório `images/` contendo todos os seus assets físicos de imagem, convertidos automaticamente para tags markdown padrão.
    *   **Importar Markdown**: Arraste um arquivo `.md` para gerar instantaneamente um novo Workspace + Aba. O AZELL analisa automaticamente as quebras duplas de linha, converte em células nativas, processa a sintaxe de imagem `![alt](caminho_local)`, localiza os arquivos do sistema e os ingere nativamente no banco de dados.

---

## ⌨️ Atalhos de Teclado

O AZELL foi projetado para "power users" de teclado. Quando **não estiver digitando ativamente dentro de uma célula**, você pode usar os seguintes atalhos para manipular a estrutura do seu notebook:

| Ação | Atalho | Descrição |
| :--- | :--- | :--- |
| **Desfazer** | `Ctrl + Z` | Reverte a última edição estrutural ou de texto. |
| **Refazer** | `Ctrl + Shift + Z` | Repete a última ação revertida. |
| **Excluir Célula** | `Ctrl + Shift + D` | Exclui a célula selecionada no momento. |
| **Duplicar Célula**| `Ctrl + Shift + C` | Duplica a célula selecionada exatamente abaixo dela. |
| **Mover para Cima**| `Alt + ↑` | Move a célula selecionada uma posição para cima. |
| **Mover para Baixo**| `Alt + ↓` | Move a célula selecionada uma posição para baixo. |

*Dentro de uma célula*, o `Ctrl+Z` atua contextualmente para desfazer blocos finos de digitação antes de recorrer à alterações estruturais da página.

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico
*   **Frontend**: React 19, TypeScript, Vite, CSS Modules (Design System Customizado).
*   **Motor Markdown**: `react-markdown`, `remark-gfm`, `remark-breaks`.
*   **Backend**: Rust, Tauri v2.
*   **Banco de Dados**: SQLite (`rusqlite`), executando SQL cru para máxima performance.
*   **Plugins**: `@tauri-apps/plugin-dialog` & `@tauri-apps/plugin-fs` (para acesso ao Sistema de Arquivos no nível do SO).

### Modelo de Banco de Dados
O aplicativo depende graciosamente de um esquema relacional interconectado:
*   `workspaces (id, name, created_at)`
*   `tabs (id, workspace_id, title, created_at)`
*   `cells (id, tab_id, position, cell_type, content, ...)`
    *   *Tipo 0*: Texto Markdown.
    *   *Tipo 1*: Imagem (O Conteúdo armazena o mapeamento URI do SO Interno).

### Virtualização de Células
O AZELL lida com quantidades massivas de células complexas utilizando `@tanstack/react-virtual` para reciclar instâncias do DOM que estão fora da visão da tela, mantendo rolagem a 60FPS independentemente do tamanho do documento.

---

## 🚀 Começando (Para Desenvolvedores)

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (v18+)
*   [Rust](https://www.rust-lang.org/tools/install)
*   Dependências de Build da Plataforma (ex: C++ Build Tools para Windows, ou Xcode Command Line Tools para macOS).

### Instalação & Desenvolvimento

1. Clone o repositório e instale as dependências npm:
   ```bash
   npm install
   ```

2. Rode o ambiente de desenvolvimento local:
   ```bash
   npm run tauri dev
   ```
   *Nota: No Windows PowerShell, você pode precisar garantir que o cargo esteja no seu PATH:*
   ```powershell
   $env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run tauri dev
   ```

3. Build para Produção (Gerar o .exe/.dmg):
   ```bash
   npm run tauri build
   ```
   
## Lançamentos (Releases)

Os lançamentos são gerados automaticamente quando uma tag de versão é enviada.

Exemplo:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Isso ativará o pipeline de CI que compila o aplicativo para Windows e Linux e publica os instaladores no GitHub Releases. Para obter mais detalhes, consulte o [Guia de Lançamento](docs/release.md).

---

