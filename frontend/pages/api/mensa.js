import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    
    // Try multiple potential locations for the Python script
    const possibleScriptPaths = [
      path.join(process.cwd(), 'api', 'mensa.py'),
      path.join(process.cwd(), '..', 'BackEnd', 'Sankt_Augustin_mensa', 'src', 'bonn_mensa', 'mensa.py'),
      path.join(process.cwd(), '..', 'api', 'mensa.py')
    ];
    
    let scriptPath = null;
    for (const potentialPath of possibleScriptPaths) {
      if (fs.existsSync(potentialPath)) {
        scriptPath = potentialPath;
        break;
      }
    }

    if (!scriptPath) {
      return res.status(404).json({
        error: 'Python script not found in any expected location'
      });
    }
    
    const pythonCommand = process.env.PYTHON_COMMAND || 
      (process.platform === 'win32' ? 'python' : 'python3');
    
    let command = `${pythonCommand} "${scriptPath}"`;
    command += ` --mensa ${mensa}`;
    command += ` --lang ${lang}`;
    command += ` --date ${date}`;
    command += ` --json`;
    
    if (filterCategories.length > 0) {
      command += ` --filter-categories ${filterCategories.join(' ')}`;
    }
    
    if (showAllAllergens) command += ' --show-all-allergens';
    if (showAdditives) command += ' --show-additives';
    if (showAllPrices) command += ' --show-all-prices';
    if (vegan) command += ' --vegan';
    if (vegetarian) command += ' --vegetarian';
    
    const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
    
    if (stderr && !stderr.includes('Fetching mensa data')) {
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
      const jsonMatch = stdout.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[1] : stdout;
      
      if (!jsonString || jsonString.trim() === '') {
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
      
      const jsonData = JSON.parse(jsonString);
      
      return res.json({
        data: jsonData,
        params: {
          mensa, lang, date, filterCategories,
          showAllAllergens, showAdditives, showAllPrices, vegan, vegetarian
        }
      });
    } catch (parseError) {
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
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
} 