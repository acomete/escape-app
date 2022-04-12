const { app, BrowserWindow, Menu, MenuItem } = require('electron')
const path = require('path')
const Mousetrap = require('mousetrap');
const usbDetect = require('usb-detection');

const serialNumber = '00015214122921193202'

let win

const createWindow = () => {
    win = new BrowserWindow({
        width: 1000,
        height: 500,
        frame: false,
        fullscreen: true,
        alwaysOnTop: true,
        closable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    usbDetect.find()
        .then((devices) => {
            detected = devices.find(device => device.serialNumber === serialNumber)

            if (!detected) {
                win.loadFile('views/auth.html')
            } else {
                win.loadFile('views/restarting.html')
            }
        })

    window.webContents.on("before-input-event", (event, input) => {
        console.log(input)
                if (input.code === 'F4' && input.alt)
                    event.preventDefault();
            });

    Mousetrap.bind(['command+k', 'ctrl+k'], () => {
        console.log('quit')
        app.quit()
    });

    win.maximize()
}

const menu = new Menu()
menu.append(new MenuItem({
    label: 'Electron',
    submenu: [{
        role: 'help',
        accelerator: process.platform === 'Alt+F4',
        click: () => { console.log('Electron rocks!') }
    }]
}))

Menu.setApplicationMenu(menu)

app.whenReady().then(() => {
    createWindow()
    usbDetect.startMonitoring();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    usbDetect.on('add', (device) => {
        console.log(device);
        if (device.serialNumber === serialNumber) {
            win.loadFile('views/restarting.html')
        }
    });

    usbDetect.on('remove', (device) => {
        console.log(device);
        if (device.serialNumber === serialNumber) {
            win.loadFile('views/auth.html')
        }
    });
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
