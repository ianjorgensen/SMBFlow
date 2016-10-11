var spawn = require('child_process').spawn;
var imaging = spawn('node', ['-v']);

imaging.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

imaging.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

imaging.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
