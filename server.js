const express = require('express')
const cors = require('cors')
const path = require('path')
const { spawn } = require('child_process')
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'frontend')))

const EXE_PATH = path.join(__dirname,
  process.platform === 'win32'
    ? 'studyplanner.exe'
    : './studyplanner')

async function runCppExe(inputJSON) {
  return new Promise((resolve, reject) => {
    
    const proc = spawn(EXE_PATH, [inputJSON])
    
    let stdout = ''
    let stderr = ''
    
    proc.stdout.on('data', chunk => {
      stdout += chunk.toString()
    })
    
    proc.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    
    const timer = setTimeout(() => {
      proc.kill()
      reject(new Error('Timeout: exe took too long'))
    }, 10000)
    
    proc.on('close', code => {
      clearTimeout(timer)
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout.trim()))
        } catch(e) {
          reject(new Error(
            'Invalid JSON from exe: ' + stdout
          ))
        }
      } else {
        reject(new Error(
          stderr || 'exe failed with code ' + code
        ))
      }
    })
    
    proc.on('error', err => {
      clearTimeout(timer)
      if (err.code === 'ENOENT') {
        reject(new Error(
          'studyplanner.exe not found. ' +
          'Please compile C++ code first with: ' +
          'g++ -std=c++17 main.cpp Graph.cpp ' +
          'KahnAlgo.cpp utils.cpp -o studyplanner'
        ))
      } else {
        reject(err)
      }
    })
  })
}

app.post('/api/generate', async (req, res) => {
    try {
        if (!req.body) throw new Error("Request body missing");
        if (!Array.isArray(req.body.subjects)) throw new Error("req.body.subjects must be an array");
        if (req.body.subjects.length === 0) throw new Error("subjects cannot be empty");
        
        const result = await runCppExe(JSON.stringify(req.body));
        res.status(200).json(result);
    } catch (err) {
        console.error("Error in /api/generate:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/health', (req, res) => {
    try {
        res.json({
            status: 'ok',
            exe: EXE_PATH,
            message: 'Study Planner API running'
        });
    } catch (err) {
        console.error("Error in /api/health:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/', (req, res) => {
    try {
      res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
    } catch (err) {
        console.error("Error serving index.html:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = 5000
app.listen(PORT, () => {
  console.log('=============================')
  console.log('Study Planner Server Started!')
  console.log('=============================')
  console.log('Open browser at:')
  console.log('http://localhost:' + PORT)
  console.log('=============================')
})
