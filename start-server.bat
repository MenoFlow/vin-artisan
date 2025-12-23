@echo off
title Lancement du projet CDR

:: Ouvrir le backend
start cmd /k "cd /d F:\IMPORTANT\vinexpert\backend && node index.js"

:: Ouvrir le frontend
start cmd /k "cd /d F:\IMPORTANT\vinexpert\frontend && npm run dev"

:: Afficher un popup avec l'adresse
mshta "javascript:var sh=new ActiveXObject('WScript.Shell'); sh.Popup('Veuillez entrer dans votre navigateur l\'URL : http://localhost:8080', 0, 'Accès à l\'application', 64);close();"

exit
