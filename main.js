const electron = require('electron')
const path = require('path')
const fs = require('fs')

const app = electron.app
const BrowserWindow = electron.BrowserWindow

if (!app) {
    console.error('Electron app is undefined. Make sure you run with: npx electron .')
    process.exit(1)
}

// Disable GPU acceleration on Windows to avoid some rendering issues (optional)
if (typeof app.disableHardwareAcceleration === 'function') {
    app.disableHardwareAcceleration()
}

function createWindow() {
    const iconPath = path.join(__dirname, 'images', 'icon-512.png')
    const iconExists = fs.existsSync(iconPath)

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        autoHideMenuBar: true,
        ...(iconExists && { icon: iconPath })
    })

    win.loadFile('index.html')

    // Only open DevTools when debugging (set FLIPIT_DEBUG=1)
    if (process.env.FLIPIT_DEBUG === '1') {
        win.webContents.openDevTools()
    }
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
