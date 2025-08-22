import "./styles/app.css";
import { BeaconApp } from "./app/BeaconApp";

// Interface global do Electron
declare global {
  interface Window {
    electronAPI: {
      saveAppData: (data: any) => Promise<{ success: boolean; error?: string }>;
      loadAppData: () => Promise<{
        success: boolean;
        data?: any;
        error?: string;
      }>;
      showSaveDialog: (options: any) => Promise<any>;
      showOpenDialog: (options: any) => Promise<any>;
      saveFile: (
        filePath: string,
        content: string
      ) => Promise<{ success: boolean; error?: string }>;
      readFile: (
        filePath: string
      ) => Promise<{ success: boolean; content?: string; error?: string }>;
      onNewPage: (callback: () => void) => void;
      onSaveContent: (callback: () => void) => void;
      onFormatText: (callback: (command: string) => void) => void;
      onAddHeading: (callback: (level: number) => void) => void;
      onToggleTheme: (callback: () => void) => void;
      onSetTheme: (callback: (theme: string) => void) => void;
      onExportData: (
        callback: (data: { format: string; filePath: string }) => void
      ) => void;
      onImportData: (callback: (filePath: string) => void) => void;
      platform: string;
      versions: {
        node: string;
        chrome: string;
        electron: string;
      };
    };
  }
}

// Aguarda o DOM estar pronto
document.addEventListener("DOMContentLoaded", () => {
  // Inicializa aplicação principal
  const app = new BeaconApp();

  // Configura listeners dos eventos do menu
  if (window.electronAPI) {
    setupElectronMenuHandlers(app);
  }

  // Configura atalhos de teclado globais
  setupGlobalKeyboardShortcuts(app);

  // Exibe informações de debug no console (apenas em desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    console.log("Beacon iniciado!");
    console.log("Plataforma:", window.electronAPI?.platform);
    console.log("Versões:", window.electronAPI?.versions);
  }
});

/**
 * Configura handlers para eventos vindos do menu principal
 */
function setupElectronMenuHandlers(app: BeaconApp): void {
  const electronAPI = window.electronAPI;

  // Nova página via menu
  electronAPI.onNewPage(() => {
    app.openNewPageModal();
  });

  // Salvar via menu
  electronAPI.onSaveContent(() => {
    app.saveCurrentPageContent();
    app.saveToStorage();
  });

  // Formatação de texto via menu
  electronAPI.onFormatText((command: string) => {
    app.formatText(command);
  });

  // Adicionar cabeçalho via menu
  electronAPI.onAddHeading((level: number) => {
    app.addHeading(level);
  });

  // Alternar tema via menu
  electronAPI.onToggleTheme(() => {
    app.toggleTheme();
  });

  // Definir tema inicial
  electronAPI.onSetTheme((theme: string) => {
    app.setTheme(theme as "light" | "dark");
  });

  // Exportar dados
  electronAPI.onExportData(
    async (data: { format: string; filePath: string }) => {
      await app.exportData(data.format as "html" | "json", data.filePath);
    }
  );

  // Importar dados
  electronAPI.onImportData(async (filePath: string) => {
    await app.importData(filePath);
  });
}

/**
 * Configura atalhos de teclado globais
 */
function setupGlobalKeyboardShortcuts(app: BeaconApp): void {
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;

    // Previne comportamentos padrão para atalhos personalizados
    if (isCtrlOrCmd) {
      switch (event.key.toLowerCase()) {
        case "n":
          if (!event.shiftKey) {
            event.preventDefault();
            app.openNewPageModal();
          }
          break;

        case "s":
          event.preventDefault();
          app.saveCurrentPageContent();
          app.saveToStorage();
          break;

        case "b":
          if (app.isEditorFocused()) {
            event.preventDefault();
            app.formatText("bold");
          }
          break;

        case "i":
          if (app.isEditorFocused()) {
            event.preventDefault();
            app.formatText("italic");
          }
          break;

        case "u":
          if (app.isEditorFocused()) {
            event.preventDefault();
            app.formatText("underline");
          }
          break;

        case "1":
        case "2":
        case "3":
          if (app.isEditorFocused()) {
            event.preventDefault();
            const level = parseInt(event.key);
            app.addHeading(level);
          }
          break;

        case "t":
          if (event.shiftKey) {
            event.preventDefault();
            app.toggleTheme();
          }
          break;
      }
    }

    // Atalho F11 para tela cheia (tratado pelo Electron)
    if (event.key === "F11") {
      event.preventDefault();
    }

    // Atalho ESC para fechar modais
    if (event.key === "Escape") {
      app.closeAllModals();
    }
  });

  // Auto-save periódico
  setInterval(() => {
    app.saveCurrentPageContent();
    app.saveToStorage();
  }, 30000); // A cada 30 segundos

  // Salva antes de sair
  window.addEventListener("beforeunload", () => {
    app.saveCurrentPageContent();
    app.saveToStorage();
  });
}
