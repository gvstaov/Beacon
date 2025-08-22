// Interfaces para tipagem de dados
interface PageData {
  id: string;
  title: string;
  icon: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AppData {
  pages: PageData[];
  currentPageId: string;
  theme: "light" | "dark";
  version: string;
}

/**
 * Classe principal da aplicação Beacon
 * Gerencia todas as funcionalidades do editor e armazenamento
 */
export class BeaconApp {
  private data: AppData;
  private currentPage: PageData | null = null;
  private autoSaveInterval: number | null = null;

  constructor() {
    this.data = this.getDefaultData();
    this.initializeApp();
  }

  /**
   * Retorna dados padrão da aplicação
   */
  private getDefaultData(): AppData {
    return {
      pages: [
        {
          id: "welcome",
          title: "Bem-vindo ao Beacon",
          icon: "📄",
          content: this.getWelcomeContent(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      currentPageId: "welcome",
      theme: "light",
      version: "1.0.0",
    };
  }

  /**
   * Conteúdo padrão da página de boas-vindas
   */
  private getWelcomeContent(): string {
    return `
      <div class="block">
        <div class="block-handle">⋮⋮</div>
        <div class="block-content">
          Bem-vindo ao seu novo aplicativo de produtividade! 
        </div>
      </div>
      
      <div class="block">
        <div class="block-handle">⋮⋮</div>
        <div class="block-content heading-2">
          Recursos principais:
        </div>
      </div>
      
      <div class="block">
        <div class="block-handle">⋮⋮</div>
        <div class="block-content todo-item">
          <div class="todo-checkbox" onclick="app.toggleTodo(this)"></div>
          <div>Armazenamento local seguro</div>
        </div>
      </div>
      
      <div class="block">
        <div class="block-handle">⋮⋮</div>
        <div class="block-content todo-item">
          <div class="todo-checkbox" onclick="app.toggleTodo(this)"></div>
          <div>Interface moderna e intuitiva</div>
        </div>
      </div>
      
      <div class="block">
        <div class="block-handle">⋮⋮</div>
        <div class="block-content todo-item">
          <div class="todo-checkbox checked" onclick="app.toggleTodo(this)"></div>
          <div>Tema claro e escuro</div>
        </div>
      </div>
      
      <div class="block">
        <div class="block-handle">⋮⋮</div>
        <div class="block-content">
          Comece criando uma nova página ou editando esta. Todos os seus dados são salvos automaticamente.
        </div>
      </div>
    `;
  }

  /**
   * Inicializa a aplicação
   */
  private async initializeApp(): Promise<void> {
    try {
      // Carrega dados salvos ou usa dados padrão
      await this.loadFromStorage();

      // Aplica tema
      this.applyTheme();

      // Renderiza interface
      this.renderPagesList();
      this.loadCurrentPage();

      // Configura auto-save
      this.setupAutoSave();

      console.log("Aplicação inicializada com sucesso");
    } catch (error) {
      console.error("Erro ao inicializar aplicação:", error);
    }
  }

  /**
   * Carrega dados do armazenamento (Electron ou localStorage)
   */
  private async loadFromStorage(): Promise<void> {
    try {
      if (window.electronAPI) {
        // Usa armazenamento do Electron
        const result = await window.electronAPI.loadAppData();
        if (result.success && result.data) {
          this.data = this.migrateData(result.data);
          this.restoreDates();
        }
      } else {
        // Fallback para localStorage (desenvolvimento)
        const stored = localStorage.getItem("Beacon-data");
        if (stored) {
          this.data = this.migrateData(JSON.parse(stored));
          this.restoreDates();
        }
      }

      // Define página atual
      this.currentPage =
        this.data.pages.find((p) => p.id === this.data.currentPageId) ||
        this.data.pages[0];
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  /**
   * Migra dados de versões anteriores se necessário
   */
  private migrateData(data: any): AppData {
    // Adiciona campos que podem estar ausentes em versões antigas
    if (!data.version) {
      data.version = "1.0.0";
    }

    if (!data.theme) {
      data.theme = "light";
    }

    // Garante que todas as páginas tenham campos necessários
    data.pages = data.pages.map((page: any) => ({
      id: page.id,
      title: page.title || "Página sem título",
      icon: page.icon || "📄",
      content: page.content || "",
      createdAt: page.createdAt ? new Date(page.createdAt) : new Date(),
      updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date(),
    }));

    return data;
  }

  /**
   * Restaura objetos Date a partir de strings
   */
  private restoreDates(): void {
    this.data.pages.forEach((page) => {
      if (typeof page.createdAt === "string") {
        page.createdAt = new Date(page.createdAt);
      }
      if (typeof page.updatedAt === "string") {
        page.updatedAt = new Date(page.updatedAt);
      }
    });
  }

  /**
   * Salva dados no armazenamento
   */
  public async saveToStorage(): Promise<void> {
    try {
      if (window.electronAPI) {
        // Usa armazenamento seguro do Electron
        const result = await window.electronAPI.saveAppData(this.data);
        if (!result.success) {
          console.error("Erro ao salvar no Electron:", result.error);
        }
      } else {
        // Fallback para localStorage
        localStorage.setItem("Beacon-data", JSON.stringify(this.data));
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  }

  /**
   * Configura auto-save automático
   */
  private setupAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = window.setInterval(() => {
      this.saveCurrentPageContent();
      this.saveToStorage();
    }, 15000); // Auto-save a cada 15 segundos
  }

  /**
   * Aplica tema selecionado ao documento
   */
  public applyTheme(): void {
    document.documentElement.setAttribute("data-theme", this.data.theme);
  }

  /**
   * Alterna entre tema claro e escuro
   */
  public toggleTheme(): void {
    this.data.theme = this.data.theme === "light" ? "dark" : "light";
    this.applyTheme();
    this.saveToStorage();
  }

  /**
   * Define tema específico
   */
  public setTheme(theme: "light" | "dark"): void {
    this.data.theme = theme;
    this.applyTheme();
  }

  /**
   * Renderiza lista de páginas na sidebar
   */
  public renderPagesList(): void {
    const pagesList = document.getElementById("pagesList");
    if (!pagesList) return;

    pagesList.innerHTML = "";

    this.data.pages.forEach((page, index) => {
      const pageElement = document.createElement("div");
      pageElement.className = "page-item";
      pageElement.innerHTML = `${page.icon} ${page.title}`;
      pageElement.onclick = () => this.selectPage(index);

      if (page.id === this.data.currentPageId) {
        pageElement.classList.add("active");
      }

      pagesList.appendChild(pageElement);
    });
  }

  /**
   * Seleciona uma página específica
   */
  public selectPage(index: number): void {
    if (index >= 0 && index < this.data.pages.length) {
      this.saveCurrentPageContent();
      this.currentPage = this.data.pages[index];
      this.data.currentPageId = this.currentPage.id;
      this.loadCurrentPage();
      this.renderPagesList();
    }
  }

  /**
   * Carrega conteúdo da página atual na interface
   */
  private loadCurrentPage(): void {
    if (!this.currentPage) return;

    const titleInput = document.querySelector(
      ".page-title"
    ) as HTMLInputElement;
    const editor = document.getElementById("editor");

    if (titleInput) {
      titleInput.value = this.currentPage.title;
    }

    if (editor) {
      editor.innerHTML = this.currentPage.content;
    }
  }

  /**
   * Salva conteúdo atual da página
   */
  public saveCurrentPageContent(): void {
    if (!this.currentPage) return;

    const editor = document.getElementById("editor");
    const titleInput = document.querySelector(
      ".page-title"
    ) as HTMLInputElement;

    if (editor) {
      this.currentPage.content = editor.innerHTML;
      this.currentPage.updatedAt = new Date();
    }

    if (titleInput && titleInput.value !== this.currentPage.title) {
      this.currentPage.title = titleInput.value || "Página sem título";
      this.renderPagesList(); // Atualiza sidebar com novo título
    }
  }

  /**
   * Cria nova página
   */
  public createNewPage(title: string, icon: string = "📄"): void {
    const newPage: PageData = {
      id: Date.now().toString(),
      title: title || "Nova Página",
      icon: icon || "📄",
      content:
        '<div class="block"><div class="block-handle">⋮⋮</div><div class="block-content">Comece a escrever...</div></div>',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.data.pages.push(newPage);
    this.currentPage = newPage;
    this.data.currentPageId = newPage.id;

    this.renderPagesList();
    this.loadCurrentPage();
    this.saveToStorage();

    // Foca no editor da nova página
    setTimeout(() => {
      const editor = document.getElementById("editor");
      if (editor) {
        editor.focus();
      }
    }, 100);
  }

  /**
   * Atualiza título da página atual
   */
  public updateCurrentPageTitle(title: string): void {
    if (this.currentPage) {
      this.currentPage.title = title || "Página sem título";
      this.currentPage.updatedAt = new Date();
      this.renderPagesList();
    }
  }

  /**
   * Formatação de texto no editor
   */
  public formatText(command: string): void {
    if (this.isEditorFocused()) {
      document.execCommand(command, false, "");
      this.saveCurrentPageContent();
    }
  }

  /**
   * Adiciona cabeçalho no editor
   */
  public addHeading(level: number): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const headingClass = `heading-${level}`;

      const headingDiv = document.createElement("div");
      headingDiv.className = "block";
      headingDiv.innerHTML = `
        <div class="block-handle">⋮⋮</div>
        <div class="block-content ${headingClass}" contenteditable="true">Cabeçalho ${level}</div>
      `;

      try {
        range.insertNode(headingDiv);
        this.saveCurrentPageContent();
      } catch (error) {
        console.error("Erro ao adicionar cabeçalho:", error);
      }
    }
  }

  /**
   * Adiciona item de todo/tarefa
   */
  public addTodoItem(): void {
    const editor = document.getElementById("editor");
    if (editor) {
      const todoDiv = document.createElement("div");
      todoDiv.className = "block";
      todoDiv.innerHTML = `
        <div class="block-handle">⋮⋮</div>
        <div class="block-content todo-item">
          <div class="todo-checkbox" onclick="window.app.toggleTodo(this)"></div>
          <div contenteditable="true">Nova tarefa</div>
        </div>
      `;
      editor.appendChild(todoDiv);
      this.saveCurrentPageContent();
    }
  }

  /**
   * Adiciona lista com marcadores
   */
  public addBulletList(): void {
    const editor = document.getElementById("editor");
    if (editor) {
      const bulletDiv = document.createElement("div");
      bulletDiv.className = "block";
      bulletDiv.innerHTML = `
        <div class="block-handle">⋮⋮</div>
        <div class="block-content bullet-item" contenteditable="true">Novo item da lista</div>
      `;
      editor.appendChild(bulletDiv);
      this.saveCurrentPageContent();
    }
  }

  /**
   * Alterna estado do checkbox de todo
   */
  public toggleTodo(checkbox: HTMLElement): void {
    checkbox.classList.toggle("checked");
    this.saveCurrentPageContent();
  }

  /**
   * Verifica se o editor está focado
   */
  public isEditorFocused(): boolean {
    const editor = document.getElementById("editor");
    return !!(
      editor === document.activeElement ||
      (editor && editor.contains(document.activeElement))
    );
  }

  /**
   * Abre modal de nova página
   */
  public openNewPageModal(): void {
    const modal = document.getElementById("newPageModal");
    if (modal) {
      modal.classList.add("active");

      // Foca no campo de título
      const titleInput = document.getElementById(
        "pageTitle"
      ) as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
      }
    }
  }

  /**
   * Fecha todos os modais abertos
   */
  public closeAllModals(): void {
    const modals = document.querySelectorAll(".modal.active");
    modals.forEach((modal) => {
      modal.classList.remove("active");
    });

    // Limpa campos dos modais
    this.clearModalFields();
  }

  /**
   * Limpa campos dos modais
   */
  private clearModalFields(): void {
    const titleInput = document.getElementById("pageTitle") as HTMLInputElement;
    const iconInput = document.getElementById("pageIcon") as HTMLInputElement;

    if (titleInput) titleInput.value = "";
    if (iconInput) iconInput.value = "";
  }

  /**
   * Exporta dados da aplicação
   */
  public async exportData(
    format: "html" | "json",
    filePath: string
  ): Promise<void> {
    try {
      let content = "";

      if (format === "json") {
        content = JSON.stringify(this.data, null, 2);
      } else if (format === "html") {
        content = this.generateHTMLExport();
      }

      if (window.electronAPI) {
        const result = await window.electronAPI.saveFile(filePath, content);
        if (result.success) {
          console.log("Dados exportados com sucesso");
        } else {
          console.error("Erro ao exportar:", result.error);
        }
      }
    } catch (error) {
      console.error("Erro na exportação:", error);
    }
  }

  /**
   * Gera HTML completo para exportação
   */
  private generateHTMLExport(): string {
    const pages = this.data.pages
      .map(
        (page) => `
      <section class="page">
        <h1>${page.icon} ${page.title}</h1>
        <div class="page-content">
          ${page.content}
        </div>
        <footer>
          <small>Criado: ${page.createdAt.toLocaleDateString("pt-BR")}</small>
          <small>Atualizado: ${page.updatedAt.toLocaleDateString(
            "pt-BR"
          )}</small>
        </footer>
      </section>
    `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Exportação Beacon</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; }
          .page { margin-bottom: 40px; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
          .page h1 { margin-top: 0; }
          .heading-1 { font-size: 32px; font-weight: 700; margin: 20px 0 10px 0; }
          .heading-2 { font-size: 24px; font-weight: 600; margin: 16px 0 8px 0; }
          .heading-3 { font-size: 20px; font-weight: 600; margin: 12px 0 6px 0; }
          .todo-item { display: flex; align-items: flex-start; gap: 8px; }
          .todo-checkbox { width: 16px; height: 16px; border: 2px solid #ccc; border-radius: 3px; }
          .todo-checkbox.checked { background: #2383e2; border-color: #2383e2; }
          .bullet-item::before { content: '•'; margin-right: 8px; }
        </style>
      </head>
      <body>
        <h1>Exportação Beacon</h1>
        <p>Exportado em: ${new Date().toLocaleString("pt-BR")}</p>
        ${pages}
      </body>
      </html>
    `;
  }

  /**
   * Importa dados de arquivo externo
   */
  public async importData(filePath: string): Promise<void> {
    try {
      if (!window.electronAPI) return;

      const result = await window.electronAPI.readFile(filePath);
      if (!result.success || !result.content) {
        console.error("Erro ao ler arquivo:", result.error);
        return;
      }

      const extension = filePath.toLowerCase().split(".").pop();

      if (extension === "json") {
        const importedData = JSON.parse(result.content);
        if (this.validateImportedData(importedData)) {
          // Confirma importação com o usuário
          const shouldImport = confirm(
            "Importar dados? Isso substituirá todos os dados atuais."
          );
          if (shouldImport) {
            this.data = this.migrateData(importedData);
            this.restoreDates();
            this.currentPage = this.data.pages[0];
            this.data.currentPageId = this.currentPage.id;

            this.applyTheme();
            this.renderPagesList();
            this.loadCurrentPage();
            await this.saveToStorage();

            console.log("Dados importados com sucesso");
          }
        }
      }
    } catch (error) {
      console.error("Erro na importação:", error);
      alert("Erro ao importar arquivo. Verifique se o formato está correto.");
    }
  }

  /**
   * Valida dados importados
   */
  private validateImportedData(data: any): boolean {
    return (
      data &&
      Array.isArray(data.pages) &&
      data.pages.length > 0 &&
      data.pages.every(
        (page: any) => page.id && page.title && typeof page.content === "string"
      )
    );
  }

  /**
   * Remove página atual (move para lixeira)
   */
  public deleteCurrentPage(): void {
    if (!this.currentPage || this.data.pages.length <= 1) {
      alert("Não é possível excluir a única página restante.");
      return;
    }

    const shouldDelete = confirm(
      `Tem certeza que deseja excluir "${this.currentPage.title}"?`
    );
    if (shouldDelete) {
      const currentIndex = this.data.pages.findIndex(
        (p) => p.id === this.currentPage?.id
      );
      this.data.pages.splice(currentIndex, 1);

      // Seleciona próxima página ou anterior
      const newIndex =
        currentIndex >= this.data.pages.length
          ? currentIndex - 1
          : currentIndex;
      this.currentPage = this.data.pages[newIndex];
      this.data.currentPageId = this.currentPage.id;

      this.renderPagesList();
      this.loadCurrentPage();
      this.saveToStorage();
    }
  }

  /**
   * Duplica página atual
   */
  public duplicateCurrentPage(): void {
    if (!this.currentPage) return;

    const duplicatedPage: PageData = {
      id: Date.now().toString(),
      title: `${this.currentPage.title} (Cópia)`,
      icon: this.currentPage.icon,
      content: this.currentPage.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.data.pages.push(duplicatedPage);
    this.currentPage = duplicatedPage;
    this.data.currentPageId = duplicatedPage.id;

    this.renderPagesList();
    this.loadCurrentPage();
    this.saveToStorage();
  }

  /**
   * Busca por texto nas páginas
   */
  public searchPages(query: string): PageData[] {
    if (!query.trim()) return this.data.pages;

    const searchTerm = query.toLowerCase();
    return this.data.pages.filter(
      (page) =>
        page.title.toLowerCase().includes(searchTerm) ||
        page.content.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Obtém estatísticas da aplicação
   */
  public getStats(): {
    pageCount: number;
    totalWords: number;
    totalCharacters: number;
  } {
    const pageCount = this.data.pages.length;
    let totalWords = 0;
    let totalCharacters = 0;

    this.data.pages.forEach((page) => {
      const textContent = page.content.replace(/<[^>]*>/g, "").trim();
      totalCharacters += textContent.length;
      totalWords += textContent
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
    });

    return { pageCount, totalWords, totalCharacters };
  }

  /**
   * Cleanup ao destruir instância
   */
  public destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    // Salva uma última vez
    this.saveCurrentPageContent();
    this.saveToStorage();
  }
}

// Torna a instância acessível globalmente para callbacks de UI
declare global {
  interface Window {
    app: BeaconApp;
  }
}
