import { contextBridge, ipcRenderer } from "electron";

// Interface para API exposta ao renderer
interface ElectronAPI {
  // Gerenciamento de dados
  saveAppData: (data: any) => Promise<{ success: boolean; error?: string }>;
  loadAppData: () => Promise<{ success: boolean; data?: any; error?: string }>;

  // Operações de arquivo
  showSaveDialog: (options: any) => Promise<any>;
  showOpenDialog: (options: any) => Promise<any>;
  saveFile: (
    filePath: string,
    content: string
  ) => Promise<{ success: boolean; error?: string }>;
  readFile: (
    filePath: string
  ) => Promise<{ success: boolean; content?: string; error?: string }>;

  // Eventos do menu
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

  // Utilidades
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
}

// API segura exposta para o renderer
const electronAPI: ElectronAPI = {
  // Gerenciamento de dados locais
  saveAppData: (data: any) => ipcRenderer.invoke("save-app-data", data),
  loadAppData: () => ipcRenderer.invoke("load-app-data"),

  // Operações de arquivo
  showSaveDialog: (options: any) =>
    ipcRenderer.invoke("show-save-dialog", options),
  showOpenDialog: (options: any) =>
    ipcRenderer.invoke("show-open-dialog", options),
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke("save-file", filePath, content),
  readFile: (filePath: string) => ipcRenderer.invoke("read-file", filePath),

  // Listeners para eventos do menu
  onNewPage: (callback: () => void) => {
    ipcRenderer.on("new-page", callback);
  },

  onSaveContent: (callback: () => void) => {
    ipcRenderer.on("save-content", callback);
  },

  onFormatText: (callback: (command: string) => void) => {
    ipcRenderer.on("format-text", (event, command) => callback(command));
  },

  onAddHeading: (callback: (level: number) => void) => {
    ipcRenderer.on("add-heading", (event, level) => callback(level));
  },

  onToggleTheme: (callback: () => void) => {
    ipcRenderer.on("toggle-theme", callback);
  },

  onSetTheme: (callback: (theme: string) => void) => {
    ipcRenderer.on("set-theme", (event, theme) => callback(theme));
  },

  onExportData: (
    callback: (data: { format: string; filePath: string }) => void
  ) => {
    ipcRenderer.on("export-data", (event, data) => callback(data));
  },

  onImportData: (callback: (filePath: string) => void) => {
    ipcRenderer.on("import-data", (event, filePath) => callback(filePath));
  },

  // Informações do sistema
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
};

// Expõe API para o contexto do renderer de forma segura
contextBridge.exposeInMainWorld("electronAPI", electronAPI);

// Configurações de segurança adicionais
window.addEventListener("DOMContentLoaded", () => {
  // Remove funcionalidades inseguras do contexto global
  delete (window as any).require;
  delete (window as any).exports;
  delete (window as any).module;

  // Adiciona classe CSS baseada na plataforma
  document.body.classList.add(`platform-${process.platform}`);

  // Configura título da janela
  document.title = "NotionClone";
});
