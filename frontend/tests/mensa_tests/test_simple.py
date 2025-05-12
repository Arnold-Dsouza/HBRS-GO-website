import subprocess
import os
import sys
import traceback

def main():
    """Run a simple test of the mensa command."""
    script_path = os.path.join(os.path.dirname(__file__), '..', '..', 'BackEnd', 'Sankt_Augustin_mensa', 'src', 'bonn_mensa', 'mensa.py')
    
    cmd = [
        'python', 
        script_path,
        '--mensa', 'SanktAugustin',
        '--lang', 'en',
        '--show-all-allergens',
        '--show-additives',
        '--date', '2025-05-07',
        '--show-all-prices',
        '--filter-categories', 'Dessert',
        '--json'  # Add JSON flag to test JSON output
    ]
    
    print(f"Running command: {' '.join(cmd)}")
    
    try:
        # Compatible with older Python versions
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        stdout, stderr = process.communicate()
        return_code = process.returncode
        
        print(f"Return code: {return_code}")
        
        if stdout:
            print("\nCommand output:")
            print(stdout[:1000])  # Print first 1000 characters of output
            if len(stdout) > 1000:
                print("... (output truncated)")
        
        if stderr:
            print("\nError output:")
            print(stderr)
        
        if return_code != 0:
            print("\nCommand failed with non-zero return code")
            
    except Exception as e:
        print(f"Error running command: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main()