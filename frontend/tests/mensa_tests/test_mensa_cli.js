const { exec } = require('child_process');
const path = require('path');

// Path to the mensa.py script
const mensaScriptPath = path.join(__dirname, '..', '..', 'BackEnd', 'Sankt_Augustin_mensa', 'src', 'bonn_mensa', 'mensa.py');

// Command to execute the mensa script
const command = `python "${mensaScriptPath}" --mensa SanktAugustin --lang en --show-all-allergens --show-additives --date 2025-05-07 --show-all-prices --filter-categories Dessert`;

console.log('Executing command:', command);

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing mensa command: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log('Command executed successfully!');
  console.log('Output:');
  console.log(stdout);
  
  // Check if the output contains expected markers
  if (stdout.includes('Category') || stdout.includes('Meal') || stdout.includes('Mensa SanktAugustin – 2025-05-07')) {
    console.log('\nSUCCESS: The output contains expected menu data!');
  } else {
    console.error('\nWARNING: The output does not contain expected menu data. Check if the script is working correctly.');
  }
});