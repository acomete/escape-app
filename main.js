const { app, BrowserWindow, Menu, MenuItem, globalShortcut } = require('electron')
const path = require('path')
const usbDetect = require('usb-detection');

const serialNumber = 'E0D55EA574131661183410B9'

let win

const createWindow = () => {
  win = new BrowserWindow({
    width: 640,
    height: 360,
    fullscreen: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  usbDetect.find()
      .then((devices) => {
        detected = devices.find(device => device.serialNumber === serialNumber)

        if (!detected) {
          win.loadFile('views/failure.html')
        } else {
          restarting()
        }
      })

  win.webContents.on("before-input-event", (event, input) => {
    console.log(input)
    if (input.code === 'F4' && input.alt)
      event.preventDefault();
  });

  globalShortcut.register('Esc', () => {
    if (win.isFullScreen()) {
      win.setFullScreen(false)
    }
  })

  win.maximize()
}

const menu = new Menu()
menu.append(new MenuItem({
  label: 'Electron',
  submenu: [{
    role: 'help',
    accelerator: process.platform === 'Alt+F4',
    click: () => {
      console.log('Electron rocks!')
    }
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
        restarting()
    }
  });

  usbDetect.on('remove', (device) => {
    console.log(device);
    if (device.serialNumber === serialNumber) {
      win.loadFile('views/failure.html')
    }
  });
})

const restarting = () => {
  win.loadFile('views/restarting.html')

  setTimeout(() => {
    win.loadFile('views/restarted.html', {"extraHeaders" : "pragma: no-cache\n"})
  }, 4000)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
