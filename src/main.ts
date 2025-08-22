import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

interface AppConfig {
  windowBounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
  isMaximized: boolean;
  theme: "light" | "dark";
}

class BeaconMain {
  private mainWindow: BrowserWindow | null = null;
  private configPath: string;
  private dataPath: string;

  constructor() {
    // Configura caminhos para armazenamento de dados
    this.configPath = path.join(app.getPath("userData"), "config.json");
    this.dataPath = path.join(app.getPath("userData"), "data");

    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    // Aguarda o app estar pronto
    await app.whenReady();

    // Cria diretório de dados se não existir
    await this.ensureDataDirectory();

    // Cria janela principal
    await this.createMainWindow();

    // Configura menu da aplicação
    this.createApplicationMenu();

    // Configura handlers IPC
    this.setupIpcHandlers();

    // Eventos da aplicação
    this.setupAppEvents();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await mkdir(this.dataPath, { recursive: true });
    } catch (error) {
      console.error("Erro ao criar diretório de dados:", error);
    }
  }

  private async loadConfig(): Promise<AppConfig> {
    const defaultConfig: AppConfig = {
      windowBounds: { width: 1200, height: 800 },
      isMaximized: false,
      theme: "light",
    };

    try {
      const configData = await readFile(this.configPath, "utf8");
      return { ...defaultConfig, ...JSON.parse(configData) };
    } catch (error) {
      return defaultConfig;
    }
  }

  private async saveConfig(config: AppConfig): Promise<void> {
    try {
      await writeFile(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
  }

  private async createMainWindow(): Promise<void> {
    const config = await this.loadConfig();

    this.mainWindow = new BrowserWindow({
      width: config.windowBounds.width,
      height: config.windowBounds.height,
      x: config.windowBounds.x,
      y: config.windowBounds.y,
      minWidth: 800,
      minHeight: 600,
      show: false,
      titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "preload.js"),
        webSecurity: true,
      },
      icon: this.getAppIcon(),
    });

    // Restaura estado maximizado
    if (config.isMaximized) {
      this.mainWindow.maximize();
    }

    // Carrega a interface
    if (process.env.NODE_ENV === "development") {
      await this.mainWindow.loadURL("http://localhost:3000");
      this.mainWindow.webContents.openDevTools();
    } else {
      await this.mainWindow.loadFile(
        path.join(__dirname, "../renderer/index.html")
      );
    }

    // Eventos da janela
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow?.show();

      // Define tema inicial
      this.mainWindow?.webContents.send("set-theme", config.theme);
    });

    this.mainWindow.on("close", async () => {
      if (this.mainWindow) {
        const bounds = this.mainWindow.getBounds();
        const isMaximized = this.mainWindow.isMaximized();

        await this.saveConfig({
          windowBounds: bounds,
          isMaximized,
          theme: config.theme,
        });
      }
    });

    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });

    // Previne navegação externa
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });
  }

  private getAppIcon(): string {
    const iconName =
      process.platform === "win32"
        ? "icon.ico"
        : process.platform === "darwin"
        ? "icon.icns"
        : "icon.png";
    return path.join(__dirname, "../assets", iconName);
  }

  private createApplicationMenu(): void {
    const template: any[] = [];

    // Menu para macOS
    if (process.platform === "darwin") {
      template.push({
        label: app.getName(),
        submenu: [
          { role: "about", label: `Sobre ${app.getName()}` },
          { type: "separator" },
          { role: "services", label: "Serviços" },
          { type: "separator" },
          { role: "hide", label: `Ocultar ${app.getName()}` },
          { role: "hideothers", label: "Ocultar Outros" },
          { role: "unhide", label: "Mostrar Todos" },
          { type: "separator" },
          { role: "quit", label: `Sair do ${app.getName()}` },
        ],
      });
    }

    // Menu Arquivo
    template.push({
      label: "Arquivo",
      submenu: [
        {
          label: "Nova Página",
          accelerator: "CmdOrCtrl+N",
          click: () => this.mainWindow?.webContents.send("new-page"),
        },
        {
          label: "Salvar",
          accelerator: "CmdOrCtrl+S",
          click: () => this.mainWindow?.webContents.send("save-content"),
        },
        { type: "separator" },
        {
          label: "Exportar...",
          submenu: [
            {
              label: "Exportar como HTML",
              click: () => this.exportData("html"),
            },
            {
              label: "Exportar como JSON",
              click: () => this.exportData("json"),
            },
          ],
        },
        {
          label: "Importar...",
          click: () => this.importData(),
        },
        { type: "separator" },
        process.platform !== "darwin" ? { role: "quit", label: "Sair" } : null,
      ].filter(Boolean),
    });

    // Menu Editar
    template.push({
      label: "Editar",
      submenu: [
        { role: "undo", label: "Desfazer" },
        { role: "redo", label: "Refazer" },
        { type: "separator" },
        { role: "cut", label: "Cortar" },
        { role: "copy", label: "Copiar" },
        { role: "paste", label: "Colar" },
        { role: "selectall", label: "Selecionar Tudo" },
      ],
    });

    // Menu Formatar
    template.push({
      label: "Formatar",
      submenu: [
        {
          label: "Negrito",
          accelerator: "CmdOrCtrl+B",
          click: () => this.mainWindow?.webContents.send("format-text", "bold"),
        },
        {
          label: "Itálico",
          accelerator: "CmdOrCtrl+I",
          click: () =>
            this.mainWindow?.webContents.send("format-text", "italic"),
        },
        {
          label: "Sublinhado",
          accelerator: "CmdOrCtrl+U",
          click: () =>
            this.mainWindow?.webContents.send("format-text", "underline"),
        },
        { type: "separator" },
        {
          label: "Cabeçalho 1",
          accelerator: "CmdOrCtrl+1",
          click: () => this.mainWindow?.webContents.send("add-heading", 1),
        },
        {
          label: "Cabeçalho 2",
          accelerator: "CmdOrCtrl+2",
          click: () => this.mainWindow?.webContents.send("add-heading", 2),
        },
        {
          label: "Cabeçalho 3",
          accelerator: "CmdOrCtrl+3",
          click: () => this.mainWindow?.webContents.send("add-heading", 3),
        },
      ],
    });

    // Menu Visualizar
    template.push({
      label: "Visualizar",
      submenu: [
        {
          label: "Alternar Tema",
          accelerator: "CmdOrCtrl+Shift+T",
          click: () => this.mainWindow?.webContents.send("toggle-theme"),
        },
        { type: "separator" },
        { role: "reload", label: "Recarregar" },
        { role: "forceReload", label: "Recarregar Forçado" },
        { role: "toggleDevTools", label: "Ferramentas do Desenvolvedor" },
        { type: "separator" },
        { role: "resetZoom", label: "Zoom Padrão" },
        { role: "zoomIn", label: "Aumentar Zoom" },
        { role: "zoomOut", label: "Diminuir Zoom" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Tela Cheia" },
      ],
    });

    // Menu Ajuda
    template.push({
      label: "Ajuda",
      submenu: [
        {
          label: "Sobre",
          click: () => this.showAboutDialog(),
        },
        {
          label: "Atalhos de Teclado",
          click: () => this.showKeyboardShortcuts(),
        },
      ],
    });

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupIpcHandlers(): void {
    // Salvar dados da aplicação
    ipcMain.handle("save-app-data", async (event, data) => {
      try {
        const filePath = path.join(this.dataPath, "app-data.json");
        await writeFile(filePath, JSON.stringify(data, null, 2));
        return { success: true };
      } catch (error) {
        console.error("Erro ao salvar dados:", error);
        return { success: false, error: error.message };
      }
    });

    // Carregar dados da aplicação
    ipcMain.handle("load-app-data", async () => {
      try {
        const filePath = path.join(this.dataPath, "app-data.json");
        const data = await readFile(filePath, "utf8");
        return { success: true, data: JSON.parse(data) };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Mostrar diálogo de salvar arquivo
    ipcMain.handle("show-save-dialog", async (event, options) => {
      if (!this.mainWindow) return { canceled: true };

      const result = await dialog.showSaveDialog(this.mainWindow, options);
      return result;
    });

    // Mostrar diálogo de abrir arquivo
    ipcMain.handle("show-open-dialog", async (event, options) => {
      if (!this.mainWindow) return { canceled: true };

      const result = await dialog.showOpenDialog(this.mainWindow, options);
      return result;
    });

    // Salvar arquivo
    ipcMain.handle("save-file", async (event, filePath, content) => {
      try {
        await writeFile(filePath, content);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Ler arquivo
    ipcMain.handle("read-file", async (event, filePath) => {
      try {
        const content = await readFile(filePath, "utf8");
        return { success: true, content };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }

  private setupAppEvents(): void {
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("activate", async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createMainWindow();
      }
    });

    // Previne múltiplas instâncias
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
    } else {
      app.on("second-instance", () => {
        if (this.mainWindow) {
          if (this.mainWindow.isMinimized()) this.mainWindow.restore();
          this.mainWindow.focus();
        }
      });
    }
  }

  private async exportData(format: "html" | "json"): Promise<void> {
    if (!this.mainWindow) return;

    const { canceled, filePath } = await dialog.showSaveDialog(
      this.mainWindow,
      {
        title: "Exportar dados",
        defaultPath: `Beacon-export.${format}`,
        filters: [
          {
            name: format.toUpperCase(),
            extensions: [format],
          },
        ],
      }
    );

    if (!canceled && filePath) {
      this.mainWindow.webContents.send("export-data", { format, filePath });
    }
  }

  private async importData(): Promise<void> {
    if (!this.mainWindow) return;

    const { canceled, filePaths } = await dialog.showOpenDialog(
      this.mainWindow,
      {
        title: "Importar dados",
        filters: [
          { name: "JSON", extensions: ["json"] },
          { name: "HTML", extensions: ["html", "htm"] },
          { name: "Todos os arquivos", extensions: ["*"] },
        ],
        properties: ["openFile"],
      }
    );

    if (!canceled && filePaths.length > 0) {
      this.mainWindow.webContents.send("import-data", filePaths[0]);
    }
  }

  private showAboutDialog(): void {
    if (!this.mainWindow) return;

    dialog.showMessageBox(this.mainWindow, {
      type: "info",
      title: "Sobre Beacon",
      message: "Beacon",
      detail: `Versão 1.0.0\n\nUm aplicativo de produtividade moderno e funcional.\n\nDesenvolvido com Electron e TypeScript.`,
      buttons: ["OK"],
    });
  }

  private showKeyboardShortcuts(): void {
    if (!this.mainWindow) return;

    dialog.showMessageBox(this.mainWindow, {
      type: "info",
      title: "Atalhos de Teclado",
      message: "Atalhos Disponíveis",
      detail: [
        "Ctrl+N - Nova Página",
        "Ctrl+S - Salvar",
        "Ctrl+B - Negrito",
        "Ctrl+I - Itálico",
        "Ctrl+U - Sublinhado",
        "Ctrl+1/2/3 - Cabeçalhos",
        "Ctrl+Shift+T - Alternar Tema",
        "F11 - Tela Cheia",
      ].join("\n"),
      buttons: ["OK"],
    });
  }
}

// Inicializa a aplicação
new BeaconMain();
