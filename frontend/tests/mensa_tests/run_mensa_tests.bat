@echo off
echo ============================================
echo     Running Mensa Command Line Tests
echo ============================================

echo.
echo 1. Testing Python imports and dependencies...
python test_mensa_imports.py
echo.

echo 2. Testing JavaScript interface to mensa...
node test_mensa_cli.js
echo.

echo All tests complete!
echo ============================================