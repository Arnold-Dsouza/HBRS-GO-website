const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
// Get PORT from environment variable for Render deployment
const PORT = process.env.PORT || 3001;
const execAsync = promisify(exec);

// Enable CORS for all routes
app.use(cors());

// Add detailed logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  console.log('Health check endpoint called');
  res.json({ 
    status: 'ok', 
    message: 'HBRS Mensa API server is running',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// Mensa API endpoint
app.get('/api/mensa', async (req, res) => {
  console.log('Mensa API endpoint called with query:', req.query);
  
  try {
    // Get parameters from query string
    const mensa = req.query.mensa || 'SanktAugustin';
    const lang = req.query.lang || 'en';
    const date = req.query.date || formatDate(new Date());
    const filterCategories = req.query.filterCategories ? 
      (Array.isArray(req.query.filterCategories) ? 
        req.query.filterCategories : [req.query.filterCategories]) : 
      ['Dessert'];
    
    // Boolean flags
    const showAllAllergens = 'showAllAllergens' in req.query;
    const showAdditives = 'showAdditives' in req.query;
    const showAllPrices = 'showAllPrices' in req.query;
    const vegan = 'vegan' in req.query;
    const vegetarian = 'vegetarian' in req.query;
    
    // Log current directory and check available Python scripts
    const currentDir = __dirname;
    console.log('Current directory:', currentDir);
    
    // Try multiple potential locations for the Python script
    const possibleScriptPaths = [
      // Look in frontend's own api folder first (most likely location now)
      path.join(__dirname, 'api', 'mensa.py'),
      // Look in project root BackEnd folder
      path.join(__dirname, '..', 'BackEnd', 'Sankt_Augustin_mensa', 'src', 'bonn_mensa', 'mensa.py'),
      // Look in project root api folder
      path.join(__dirname, '..', 'api', 'mensa.py')
    ];
    
    console.log('Checking for Python script in possible locations:');
    let scriptPath = null;
    
    for (const potentialPath of possibleScriptPaths) {
      console.log(`- Checking ${potentialPath}`);
      if (fs.existsSync(potentialPath)) {
        scriptPath = potentialPath;
        console.log(`✓ Found script at: ${scriptPath}`);
        break;
      }
    }
    
    // List directories to help debug
    try {
      console.log('Contents of current directory:', fs.readdirSync(__dirname));
      if (fs.existsSync(path.join(__dirname, 'BackEnd'))) {
        console.log('Contents of BackEnd directory:', fs.readdirSync(path.join(__dirname, 'BackEnd')));
      }
      if (fs.existsSync(path.join(__dirname, 'api'))) {
        console.log('Contents of api directory:', fs.readdirSync(path.join(__dirname, 'api')));
      }
    } catch (err) {
      console.error('Error listing directories:', err);
    }

    if (!scriptPath) {
      console.error('Python script not found in any expected location');
      return res.status(404).json({
        error: `Python script not found in any expected location`
      });
    }
    
    // Determine Python command to use - prioritize environment variable, then platform detection
    const pythonCommand = process.env.PYTHON_COMMAND || 
      (process.platform === 'win32' ? 'python' : 'python3');
    
    // Use --json flag for JSON output
    let command = `${pythonCommand} "${scriptPath}"`;
    command += ` --mensa ${mensa}`;
    command += ` --lang ${lang}`;
    command += ` --date ${date}`;
    command += ` --json`; // Request JSON output
    
    if (filterCategories.length > 0) {
      command += ` --filter-categories ${filterCategories.join(' ')}`;
    }
    
    if (showAllAllergens) command += ' --show-all-allergens';
    if (showAdditives) command += ' --show-additives';
    if (showAllPrices) command += ' --show-all-prices';
    if (vegan) command += ' --vegan';
    if (vegetarian) command += ' --vegetarian';
    
    console.log(`Executing command: ${command}`);
    
    // Execute the command with a timeout of 30 seconds
    const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
    
    // Log the command output
    console.log('Command stdout:', stdout);
    if (stderr) console.error('Command stderr:', stderr);
    
    if (stderr && !stderr.includes('Fetching mensa data')) {
      console.error('Error executing mensa command:', stderr);
      
      // Fall back to markdown if there's an issue with JSON
      command = command.replace(' --json', ' --markdown');
      const fallbackResult = await execAsync(command);
      
      return res.json({ 
        error: stderr,
        markdownData: fallbackResult.stdout,
        params: {
          mensa, lang, date, filterCategories,
          showAllAllergens, showAdditives, showAllPrices, vegan, vegetarian
        }
      });
    }
    
    try {
      // Try to extract the JSON part of the output
      const jsonMatch = stdout.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[1] : stdout;
      
      console.log('Attempting to parse JSON string:', jsonString);
      
      // Check if we have an actual string to parse
      if (!jsonString || jsonString.trim() === '') {
        console.warn('Empty JSON response from Python script');
        
        // Fall back to markdown since JSON output failed
        command = command.replace(' --json', ' --markdown');
        const fallbackResult = await execAsync(command);
        
        return res.json({
          error: 'Empty JSON response from Python script',
          markdownData: fallbackResult.stdout || '',
          params: {
            mensa, lang, date, filterCategories,
            showAllAllergens, showAdditives, showAllPrices, vegan, vegetarian
          }
        });
      }
      
      // Try to parse as JSON
      const jsonData = JSON.parse(jsonString);
      
      return res.json({
        data: jsonData,
        params: {
          mensa, lang, date, filterCategories,
          showAllAllergens, showAdditives, showAllPrices, vegan, vegetarian
        }
      });
    } catch (parseError) {
      console.warn('Failed to parse JSON output:', parseError);
      
      // If JSON parsing fails, fall back to markdown
      command = command.replace(' --json', ' --markdown');
      const fallbackResult = await execAsync(command);
      
      return res.json({
        error: `Failed to parse JSON: ${parseError.message}`,
        markdownData: fallbackResult.stdout || stdout,
        params: {
          mensa, lang, date, filterCategories,
          showAllAllergens, showAdditives, showAllPrices, vegan, vegetarian
        }
      });
    }
  } catch (error) {
    console.error('Error in mensa API route:', error);
    return res.status(500).json({ 
      error: `Internal server error: ${error.message || 'Unknown error'}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Add a catch-all route handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Current directory: ${__dirname}`);
  console.log(`Node version: ${process.version}`);
});