# 🚀 AZELL v0.2.0 - The Stability Update

We are incredibly excited to launch **AZELL v0.2.0**. This release marks a significant milestone in our journey. This update fundamentally hardens the core application architecture, introducing a unified memory history system, massive UI/UX improvements to interacting with your cells, and deep integration with native OS capabilities. Let's explore what has been shipped.

---

## What's New
- **Global Undo/Redo Engine:** Experience flawless Ctrl+Z / Ctrl+Y across the entire application interface. Say goodbye to lost states.
- **Enhanced Cell Media:** Powerful new logic to handle Image and Markdown Diagram architectures deeply coupled with the native OS.

---

## 🏗️ Architecture & Infrastructure
- **Global History Manager:** Migrated the legacy application state into a global Command Pattern sequence. Modifications, soft deletions, and reordering actions now stack logically onto an agnostic History hook.
- **Persistence Management:** "Soft Deletions" were introduced to avoid jarring data-loss. Discarded cells map temporarily to a memory Trash Bin which is now strictly enforced and destroyed safely into the SQLite backend via intelligent Tauri Window Close hooks.
- **Tauri Privilege Escalation:** Enhanced our IPC ACL payloads inside Tauri (`default.json`). Enabled `process:allow-exit` bounds that completely sidestep previous WebView frozen-window bugs, and provided custom file-system binary scrapers to interact with native Desktop layers reliably.

## ✨ Features
- **Mermaid.js Integration:** Write complex sequence and flowchart diagrams in Markdown and instantly compile them into visually styled vector assets safely out of the standard Markdown bundle (Lazy Loaded). 
- **Image Binary Clipboard Copy:** Implemented a new Rust/Tauri binary bridge. Clicking "Copy Image" now unpacks raw `.png` streams directly into an agnostic RGBA OS memory array inside the Clipboard component, unlocking perfect copy-paste logic directly into MS Paint, Discord, and alternative local UI environments.

## 🎨 UI/UX Harmonization
- **Unified Custom Context Menus:** Eradicated fragmented contexts where Windows/GTK OS dialogues would overlap HTML components. Every node in Azell is now guarded by a 100% custom, unified React Portal wrapper. 
- **Native Aesthetic Rendering:** Built custom CSS pipelines using `color-mix()` matching Windows 11 Acrylic and GTK4 transparency blurs securely wrapped in floating `rgba()` overlays.
- **Cell UX Ordering Mechanics:** "Duplicate Cell" has been structurally fixed. Copies bypass strict backend appending rules and immutably slide directly below your cursor via real-time React virtual array slicing coupled with automatic targeted smooth-scrolling to snap the window directly into action.
- **Dictated Typing Ecosystem:** Keyboard Command interceptors and native DOM interactions were securely bypassed exclusively inside `<textarea>` and `contentEditable` tags resulting in perfect text-level browser-native spelling and modification scopes seamlessly co-existing alongside our global React structural undo engines.

---

## 🛠️ Technical Debt & Refactoring
- Removed legacy isolated `CellMenu` structural dropdowns.
- Cleaned redundant React state sync loops generating endless remount resets (saving native browser input stacks).
- Refactored frontend Git pipelines and automated release binary deployments matching the new stable Tauri ecosystem guidelines. 
- Strengthened fail-safe process kills when exiting standard desktop windows to ensure zombie-processes don't leak resources.


<br/>
<br/>
<br/>

# 🚀 AZELL v0.2.0 - A Atualização de Estabilidade (PT-BR)

Estamos extremamente empolgados em lançar o **AZELL v0.2.0**. Este lançamento marca um marco significativo em nossa jornada. Esta atualização fortalece fundamentalmente a arquitetura principal do aplicativo, introduzindo um sistema de histórico de memória unificado, melhorias massivas de UI/UX na interação com as suas células, e uma profunda integração com recursos nativos do Sistema Operacional. Vamos explorar o que chegou.

---

## O Que Há de Novo
- **Motor Global Undo/Redo:** Experimente Ctrl+Z / Ctrl+Y impecáveis por toda a interface do aplicativo. Diga adeus aos estados perdidos.
- **Mídias Aprimoradas:** Nova lógica poderosa para lidar com arquiteturas de Imagem e Diagramas Markdown profundamente acopladas com o OS nativo.

---

## 🏗️ Arquitetura & Infraestrutura
- **Global History Manager:** Migramos o estado legado da aplicação para uma sequência global em Padrão Command (Command Pattern). Modificações, exclusões lógicas (soft deletes) e ações de reordenação agora se acumulam logicamente em um Hook agnóstico de Histórico.
- **Gerenciamento de Persistência:** As "Exclusões Lógicas" foram introduzidas para evitar a perda brusca de dados. Células descartadas são mapeadas temporariamente para uma Lixeira na memória, que é então rigidamente aplicada e destruída de forma segura no backend SQLite por meio de ganchos inteligentes de Fechamento de Janela do Tauri.
- **Escalonamento de Privilégios Tauri:** Melhoramos as nossas permissões de IPC dentro do Tauri (`default.json`). Habilitamos os limites `process:allow-exit` que eliminam completamente bugs anteriores de travamento do WebView, e fornecemos aos escavadores de binários do sistema de arquivos permissão customizada para interagir confiavelmente com as camadas nativas de Desktop.

## ✨ Funcionalidades
- **Integração Mermaid.js:** Escreva diagramas de fluxo e sequência complexos em Markdown e compile-os instantaneamente em assets vetoriais visualmente estilizados, renderizados de forma segura fora do fluxo normal de Markdown (Lazy Loaded).
- **Cópia Binária de Imagens (Clipboard):** Implementamos uma nova ponte binária em Rust/Tauri. Clicar em "Copy Image" agora desempacota fluxos de dados crus `.png` diretamente para uma matriz de memória RGBA agnóstica do OS dentro do componente de Área de Transferência. Isso destrava perfeitamente a lógica de copiar-e-colar para programas como MS Paint, Discord ou outras UIs locais.

## 🎨 Harmonização de UI/UX
- **Menus de Contexto Customizados Unificados:** Erradicamos cenários fragmentados onde os menus esbranquiçados nativos do Windows/GTK sobrepunham componentes HTML. Todo o aplicativo é agora blindado por um Portal React 100% customizado e unificado.
- **Renderização Nativa e Estética:** Construimos pipelines CSS super modernas utilizando `color-mix()` para equivaler precisamente aos blurs de transparência do Acrylic do Windows 11 e do GTK4, inteligentemente envelopados por sobreposições flutuantes em `rgba()`.
- **Mecânicas de Ordem (Cell UX):** O comando "Duplicar Célula" foi consertado estruturalmente. Cópias ignoram as regras de inserção pura no backend e deslizam imutávelmente e perfeitamente para baixo do seu cursor através do fatiamento assíncrono virtual em tempo real do React. Além disso, adicionamos uma auto rolagem inteligente e suave focando exatamente para onde a duplicação pulou.
- **Ecossistema Ditatorial de Digitação:** Interceptadores de atalhos e interações nativas do DOM agora são ignorados exclusivamente caso você esteja ativamente focando tags `<textarea>` ou `contentEditable`. O resultado disso é que todo o sistema interno de Correção Ortográfica e Manipulação nativa de texto dos Browsers coexiste de forma transparente em conjunto com a nossa engrenagem global de Undo.

---

## 🛠️ Débito Técnico & Refatoração
- Removemos inteiramente o antigo componente legado `CellMenu` HTML de drop-down.
- Limpamos loops redundantes no estado do React que forçavam resets de remount infinitos (salvando as memórias nativas de inputs do browser).
- Refatoramos as rotinas do Git Frontend e automatizamos entregas e deploys, mantendo em dia as novas regras de integração contínua do ecosistema Tauri estável.
- Blindamos os "process kills" à prova de falhas ao engatilhar a saída das janelas de desktop para evitar que processos fantasmas vazem recursos (Zombies).
