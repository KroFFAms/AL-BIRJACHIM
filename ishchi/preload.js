const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ishchi', {
  holat: () => ipcRenderer.invoke('holat'),
  qosh: (p) => ipcRenderer.invoke('qosh', p),
  kirish: (id) => ipcRenderer.invoke('kirish', id),
  yigish: (id) => ipcRenderer.invoke('yigish', id),
  hammasi: () => ipcRenderer.invoke('hammasi'),
  korsat: (id) => ipcRenderer.invoke('korsat', id),
  ochiq: (id, v) => ipcRenderer.invoke('ochiq', id, v),
  ochir: (id) => ipcRenderer.invoke('ochir', id),
  sayt: () => ipcRenderer.invoke('sayt'),
  sozla: (o) => ipcRenderer.invoke('sozla', o),
  aktiv: () => ipcRenderer.invoke('aktiv'),
  navbat: () => ipcRenderer.invoke('navbat'),
  tkOch: (id) => ipcRenderer.invoke('tk_och', id),
  tkHolat: (id, h) => ipcRenderer.invoke('tk_holat', id, h),
  on: (ch, cb) => ipcRenderer.on(ch, (_e, d) => cb(d)),
});
