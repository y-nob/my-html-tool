const { contextBridge, exec } = require('electron');
const { exec: execCmd } = require('child_process');

contextBridge.exposeInMainWorld('exifAPI', {
  searchByFocalLength: (folder, focal, callback) => {
    const command = `exiftool -if "$FocalLength# == ${focal}" -filename -FocalLength -r "${folder}"`;
    execCmd(command, { encoding: 'utf8', shell: true }, (error, stdout, stderr) => {
      if (error) return callback({ error: error.message });
      if (stderr) return callback({ error: stderr });
      callback({ result: stdout });
    });
  }
});