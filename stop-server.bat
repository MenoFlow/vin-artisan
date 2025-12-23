@echo off
title Fermeture des CMD
echo Fermeture de toutes les fenetres CMD...

:: Ferme tous les processus cmd.exe
taskkill /F /IM cmd.exe

echo Toutes les fenetres CMD ont ete fermees.
pause
