const electron = require("electron");
// Module to control application life.
const {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  dialog,
  globalShortcut,
} = require("electron");
// Module to create native browser window.
//const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");
const fs = require("fs");
const os = require("os");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
var inFileName = "";

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "/../build/index.html"),
      protocol: "file:",
      slashes: true,
    });
  mainWindow.loadURL(startUrl);
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}
const template = [
  {
    label: "File",
    submenu: [
      {
        label: "Load PDF",
        accelerator: "CommandOrControl+O",
        click(item, focusedWindow) {
          if (focusedWindow) {
            return getFileFromUser(focusedWindow);
          }

          const newWindow = createWindow();

          newWindow.on("show", () => {
            getFileFromUser(newWindow);
          });
        },
      }, // “Save File” and “Export HTML” menus are defined here.
      {
        label: "Load Annotations",
        click(item, focusedWindow) {
          if (focusedWindow) {
            return getAnnotFromUser(focusedWindow);
          }

          const newWindow = createWindow();

          newWindow.on("show", () => {
            getAnnotFromUser(newWindow);
          });
        },
      },
      {
        label: "Save Annotations",
        click(item, focusedWindow) {
          if (focusedWindow) {
            return saveAnnotFromUser(focusedWindow);
          }

          const newWindow = createWindow();

          newWindow.on("show", () => {
            saveAnnotFromUser(newWindow);
          });
        },
      },
      // {
      //    label: 'Save Annotations',
      //    click(item, focusedWindow) {
      //      if (focusedWindow) {
      //        return saveFile(focusedWindow);
      //      }
      //
      //    },
      // },
      {
        label: "Load Schema",
        click(item, focusedWindow) {
          if (focusedWindow) {
            return getSchemaFileFromUser(focusedWindow);
          }

          const newWindow = createWindow();

          newWindow.on("show", () => {
            getSchemaFileFromUser(newWindow);
          });
        },
      }, // “Save File” and “Export HTML” menus are defined here.
      {
        label: "Save Schema",
        click(item, focusedWindow) {
          if (focusedWindow) {
            return saveSchemaFromUser(focusedWindow);
          }

          const newWindow = createWindow();

          newWindow.on("show", () => {
            saveSchemaFromUser(newWindow);
          });
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      {
        role: "undo",
      },
      {
        role: "redo",
      },
      {
        type: "separator",
      },
      {
        role: "cut",
      },
      {
        role: "copy",
      },
      {
        role: "paste",
      },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        role: "reload",
      },
      {
        role: "toggledevtools",
      },
      {
        type: "separator",
      },
      {
        role: "resetzoom",
      },
      {
        role: "zoomin",
      },
      {
        role: "zoomout",
      },
      {
        type: "separator",
      },
      {
        role: "togglefullscreen",
      },
    ],
  },

  {
    role: "window",
    submenu: [
      {
        role: "minimize",
      },
      {
        role: "close",
      },
    ],
  },

  {
    role: "help",
    submenu: [
      {
        label: "Documentation",
        click() {
          openHelpWindow();
        },
      },
    ],
  },
];

//replicate default macOS application menu
if (process.platform === "darwin") {
  const name = "EPAAT";
  template.unshift({
    label: name,
    submenu: [
      {
        label: `About ${name}`,
        role: "about",
      },
      { type: "separator" },
      {
        label: "Services",
        role: "services",
        submenu: [],
      },
      { type: "separator" },
      {
        label: `Hide ${name}`,
        accelerator: "Command+H",
        role: "hide",
      },
      {
        label: "Hide Others",
        accelerator: "Command+Alt+H",
        role: "hideothers",
      },
      {
        label: "Show All",
        role: "unhide",
      },
      { type: "separator" },
      {
        label: `Quit ${name}`,
        accelerator: "Command+Q",
        click() {
          app.quit();
        },
      },
    ],
  });
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  app.quit();
  // }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

async function getFileFromUser(targetWindow) {
  const filesAsync = dialog.showOpenDialog(targetWindow, {
    properties: ["openFile"],
    filters: [{ name: "PDF Documents", extensions: ["pdf"] }],
  });
  const files = await filesAsync;
  //console.log(files.filePaths);
  if (files) {
    openFile(targetWindow, files.filePaths[0]);
  }
}
async function getPDFPathFromUser(targetWindow) {
  const filesAsync = dialog.showOpenDialog(targetWindow, {
    properties: ["openFile"],
    filters: [{ name: "PDF Documents", extensions: ["pdf"] }],
  });
  const files = await filesAsync;
  //console.log(files.filePaths);
  if (files) {
    return files.filePaths[0];
  }
}
async function getAnnotFromUser(targetWindow) {
  const filesAsync = dialog.showOpenDialog(targetWindow, {
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  const files = await filesAsync;
  //console.log(files.filePaths);
  if (files) {
    openAnnotFile(targetWindow, files.filePaths[0]);
  }
}

async function saveAnnotFromUser(targetWindow) {
  const files = await dialog.showSaveDialog(targetWindow, {
    //Placeholder 1
    title: "Save",

    //Placeholder 2
    defaultPath: inFileName + ".json",

    //Placeholder 4
    buttonLabel: "Save Annot File",

    //Placeholder 3
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (files) {
    console.log(files);
    saveAnnotFile(targetWindow, files.filePath);
  }
}

async function saveSchemaFromUser(targetWindow) {
  const files = await dialog.showSaveDialog(targetWindow, {
    //Placeholder 1
    title: "Save",

    //Placeholder 2
    defaultPath: inFileName + "-schema.json",

    //Placeholder 4
    buttonLabel: "Save Schema File",

    //Placeholder 3
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (files) {
    console.log(files);
    saveSchemaFile(targetWindow, files.filePath);
  }
}

async function getSchemaFileFromUser(targetWindow) {
  const filesAsync = dialog.showOpenDialog(targetWindow, {
    properties: ["openFile"],
    filters: [{ name: "JSON Documents", extensions: ["json"] }],
  });
  const files = await filesAsync;
  //console.log(files.filePaths);
  if (files) {
    openSchemaFile(targetWindow, files.filePaths[0]);
  }
}

async function getSchemaPathFromUser(targetWindow) {
  const filesAsync = dialog.showOpenDialog(targetWindow, {
    properties: ["openFile"],
    filters: [{ name: "JSON Documents", extensions: ["json"] }],
  });
  const files = await filesAsync;
  //console.log(files.filePaths);
  if (files) {
    return files.filePaths[0];
  }
}

async function openSchemaFile(targetWindow, file) {
  //const content = fs.readFileSync(file);
  //startWatchingFile(targetWindow, file);
  //app.addRecentDocument(file);
  //targetWindow.setRepresentedFilename(file);
  var content = {};

  //const exists = fs.existsSync(fullpath);
  //if (exists) {
  //  console.log("exists")
  //  highlights = fs.readFileSync(fullpath, 'utf-8');
  //}
  try {
    content = JSON.parse(fs.readFileSync(file));
  } catch (err) {
    //console.log(err);
  }
  //console.log(JSON.stringify(highlights));
  targetWindow.webContents.send("schema-file-opened", content);
}

async function openFile(targetWindow, file) {
  const content = fs.readFileSync(file);
  //startWatchingFile(targetWindow, file);
  //app.addRecentDocument(file);
  //targetWindow.setRepresentedFilename(file);
  var highlights = {};
  highlights.highlights = [];
  highlights.relationships = [];

  inFileName = path.basename(file);
  // const fullpath = path.join(app.getPath('appData'), 'EPAAT', path.basename(file) + ".json")
  // console.log(fullpath);
  //
  // //const exists = fs.existsSync(fullpath);
  // //if (exists) {
  // //  console.log("exists")
  // //  highlights = fs.readFileSync(fullpath, 'utf-8');
  // //}
  // try {
  //   highlights = JSON.parse(fs.readFileSync(fullpath));
  // } catch (err) {
  //   //console.log(err);
  // }
  //console.log(JSON.stringify(highlights));
  targetWindow.webContents.send("file-opened", file, content, highlights);
}

const openAnnotFile = (exports.openAnnotFile = (targetWindow, file) => {
  const content = fs.readFileSync(file);

  //startWatchingFile(targetWindow, file);
  //app.addRecentDocument(file);
  //targetWindow.setRepresentedFilename(file);
  var highlights = {};
  highlights.highlights = [];
  highlights.relationships = [];
  // const fullpath = path.join(path(file) )
  //console.log(path);

  //const exists = fs.existsSync(fullpath);
  //if (exists) {
  //  console.log("exists")
  //  highlights = fs.readFileSync(fullpath, 'utf-8');
  //}
  try {
    highlights = JSON.parse(content);
  } catch (err) {
    alert("Error: file format invalid");
    //console.log(err);
  }
  //console.log(JSON.stringify(highlights));
  targetWindow.webContents.send("annot-opened", file, content, highlights);
});

// TODO Should save logic go here and not in App.js?  If so how to pass filename?
const saveAnnotFile = (targetWindow, file) => {
  targetWindow.webContents.send("save-file", file);
};

const saveSchemaFile = (targetWindow, file) => {
  targetWindow.webContents.send("save-schema", file);
};
const ipc = electron.ipcMain;
ipc.on("openF", function () {
  getFileFromUser(mainWindow);

  //dialog.showOpenDialog({title: "Open File",properties : ['openFile']}).then(result =>{
  //  mainWindow.webContents.send("filepaths", result.filePaths);
  //console.log(result.filePaths);
});
ipc.handle("openPDFFileDialog", async (event) => {
  const result = await getPDFPathFromUser(mainWindow);
  return result;
});
ipc.handle("openSchemaFileDialog", async (event) => {
  const result = await getSchemaPathFromUser(mainWindow);
  //if(result) openSchemaFile(mainWindow, result);
  return result;
});
ipc.handle("openPDF", async (event, fpath, sfpath) => {
  if (fpath) await openFile(mainWindow, fpath);
  //console.log(sfpath);
  if (sfpath) await openSchemaFile(mainWindow, sfpath);
  return 1;
});
ipc.handle("getUserName", async (event) => {
  return os.userInfo().username;
});
const autoAnnotate = (targetWindow) => {
  targetWindow.webContents.send("auto-annotate");
};

var newWindow = null;

function openHelpWindow() {
  if (newWindow) {
    newWindow.focus();
    return;
  }

  newWindow = new BrowserWindow({
    height: 800,
    resizable: true,
    width: 600,
    title: "",
    minimizable: false,
    fullscreenable: false,
  });

  newWindow.loadURL("file://" + __dirname + "/EPA-Annotator-UserGuide.pdf");

  newWindow.on("closed", function () {
    newWindow = null;
  });
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on("browser-window-focus", function () {
  globalShortcut.register("CommandOrControl+R", () => {
    console.log("CommandOrControl+R is pressed: Shortcut Disabled");
  });
  globalShortcut.register("F5", () => {
    console.log("F5 is pressed: Shortcut Disabled");
  });
});

app.on("browser-window-blur", function () {
  globalShortcut.unregister("CommandOrControl+R");
  globalShortcut.unregister("F5");
});
