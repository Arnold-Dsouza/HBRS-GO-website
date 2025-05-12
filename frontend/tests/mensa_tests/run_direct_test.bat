@echo off
echo Running direct Python mensa command test...
echo.

python "..\..\BackEnd\Sankt_Augustin_mensa\src\bonn_mensa\mensa.py" --mensa SanktAugustin --lang en --show-all-allergens --show-additives --date 2025-05-07 --show-all-prices --filter-categories Dessert

echo.
echo Test complete.