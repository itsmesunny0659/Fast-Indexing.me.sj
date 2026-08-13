@echo off
title YT Baba - Content ID Bypass Tool
color 0A
echo.
echo  ============================================================
echo   YT Baba - Content ID Bypass Tool v2.0
echo   9-Layer Signal Alteration Engine - Handshaking Mode
echo  ============================================================
echo.
echo  [*] Starting server on port 4000...
cd /d "%~dp0yt baba"
start /B node server.js > server_log.txt 2>&1
echo  [*] Waiting for server...
timeout /t 2 /nobreak > nul
echo  [*] Opening browser...
start http://localhost:4000
echo.
echo  ============================================================
echo   Tool ready at: http://localhost:4000
echo   Close this window to STOP the server
echo  ============================================================
echo.
pause > nul
taskkill /F /IM node.exe /T > nul 2>&1
echo  Server stopped. Goodbye!
timeout /t 2 /nobreak > nul