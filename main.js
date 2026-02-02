/**
 * FlowState - Electron Main Process
 * Creates an always-on-top floating widget for focus tracking
 */

const { app, BrowserWindow, ipcMain, Tray, Menu, screen } = require('electron');
const path = require('path');

let mainWindow = null;
let widgetWindow = null;
let tray = null;

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
}

app.on('second-instance', () => {
    if (widgetWindow) {
        widgetWindow.show();
        widgetWindow.focus();
    }
});

app.whenReady().then(() => {
    createWidgetWindow();
    createTray();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWidgetWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function createWidgetWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    widgetWindow = new BrowserWindow({
        width: 280,
        height: 560,
        x: width - 300,
        y: 20,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    
    widgetWindow.loadFile('widget.html');
    
    // Keep always on top even when other apps go fullscreen
    widgetWindow.setAlwaysOnTop(true, 'floating', 1);
    widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    
    // Handle window drag from renderer
    ipcMain.on('window-move', (event, { x, y }) => {
        if (widgetWindow) {
            widgetWindow.setPosition(x, y);
        }
    });
    
    // Handle window minimize
    ipcMain.on('minimize-widget', () => {
        if (widgetWindow) {
            widgetWindow.hide();
        }
    });
    
    // Handle window close
    ipcMain.on('close-widget', () => {
        app.quit();
    });
    
    // Handle show main window
    ipcMain.on('show-main', () => {
        createMainWindow();
    });
}

function createMainWindow() {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        return;
    }
    
    mainWindow = new BrowserWindow({
        width: 500,
        height: 800,
        frame: true,
        transparent: false,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    
    mainWindow.loadFile('index.html');
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    // Create a simple tray icon (you can replace with actual icon file)
    tray = new Tray(createTrayIcon());
    
    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Show Widget', 
            click: () => {
                if (widgetWindow) {
                    widgetWindow.show();
                    widgetWindow.focus();
                }
            }
        },
        { 
            label: 'Open Full App', 
            click: () => createMainWindow()
        },
        { type: 'separator' },
        { 
            label: 'Quit', 
            click: () => app.quit()
        }
    ]);
    
    tray.setToolTip('FlowState - Focus Timer');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
        if (widgetWindow) {
            if (widgetWindow.isVisible()) {
                widgetWindow.focus();
            } else {
                widgetWindow.show();
            }
        }
    });
}

// Create a simple tray icon programmatically
function createTrayIcon() {
    const { nativeImage } = require('electron');
    
    // Create a 16x16 icon
    const size = 16;
    const canvas = Buffer.alloc(size * size * 4);
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const idx = (y * size + x) * 4;
            const cx = x - size / 2;
            const cy = y - size / 2;
            const dist = Math.sqrt(cx * cx + cy * cy);
            
            if (dist < size / 2 - 1) {
                // Purple color
                canvas[idx] = 99;      // R
                canvas[idx + 1] = 102; // G
                canvas[idx + 2] = 241; // B
                canvas[idx + 3] = 255; // A
            } else {
                canvas[idx + 3] = 0; // Transparent
            }
        }
    }
    
    return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}
