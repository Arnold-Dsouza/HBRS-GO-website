#!/usr/bin/env python3
"""
Test script to verify the mensa module can be imported and required dependencies are installed.
"""
import sys
import os
import importlib.util
import subprocess

def check_package(package_name):
    """Check if a package is installed and print its version if available."""
    try:
        package = __import__(package_name)
        version = getattr(package, '__version__', 'unknown version')
        print(f"✅ {package_name} is installed (version: {version})")
        return True
    except ImportError:
        print(f"❌ {package_name} is NOT installed")
        return False

def try_import_mensa():
    """Attempt to import the mensa module directly."""
    try:
        # Add the parent directory to sys.path to find the bonn_mensa module
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'BackEnd', 'Sankt_Augustin_mensa', 'src'))
        import bonn_mensa.mensa
        print("✅ Successfully imported bonn_mensa.mensa module")
        return True
    except ImportError as e:
        print(f"❌ Failed to import bonn_mensa.mensa module: {e}")
        return False

def run_mensa_cli():
    """Run the mensa CLI command and check if it works."""
    script_path = os.path.join(os.path.dirname(__file__), '..', '..', 'BackEnd', 'Sankt_Augustin_mensa', 'src', 'bonn_mensa', 'mensa.py')
    command = [
        'python', script_path,
        '--mensa', 'SanktAugustin',
        '--lang', 'en',
        '--show-all-allergens',
        '--show-additives',
        '--date', '2025-05-07',
        '--show-all-prices',
        '--filter-categories', 'Dessert'
    ]
    
    try:
        print(f"Running command: {' '.join(command)}")
        result = subprocess.run(command, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("\n✅ Mensa CLI executed successfully")
            print("\nOutput sample (first 200 chars):")
            print(result.stdout[:200] + "..." if len(result.stdout) > 200 else result.stdout)
            return True
        else:
            print(f"\n❌ Mensa CLI execution failed with code {result.returncode}")
            print("Error output:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"\n❌ Failed to run mensa CLI: {e}")
        return False

if __name__ == "__main__":
    print("Mensa Script Test Report")
    print("======================\n")
    
    # Check required packages
    print("Checking required packages:")
    required_packages = ['requests', 'colorama', 'holidays']
    all_packages_installed = all([check_package(pkg) for pkg in required_packages])
    
    print("\nTesting mensa module import:")
    import_success = try_import_mensa()
    
    print("\nTesting mensa CLI execution:")
    cli_success = run_mensa_cli()
    
    # Overall status
    print("\n======================")
    if all_packages_installed and import_success and cli_success:
        print("✅ All tests PASSED! The mensa script is ready to use.")
    else:
        print("❌ Some tests FAILED. Please check the issues above.")
        
    sys.exit(0 if (all_packages_installed and import_success and cli_success) else 1)