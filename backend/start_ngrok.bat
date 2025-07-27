@echo off
echo Checking for ngrok...

:: Try to find ngrok in common locations
set NGROK_LOCATIONS="%USERPROFILE%\ngrok.exe" "%USERPROFILE%\Downloads\ngrok.exe" "%PROGRAMFILES%\ngrok\ngrok.exe" "%PROGRAMFILES(X86)%\ngrok\ngrok.exe" "ngrok.exe"

for %%G in (%NGROK_LOCATIONS%) do (
    if exist %%G (
        echo Found ngrok at: %%G
        echo Starting ngrok tunnel on port 5000...
        %%G http 5000
        exit /b
    )
)

:: If we get here, ngrok wasn't found
echo ERROR: ngrok not found!
echo.
echo Please follow these steps to set up ngrok:
echo 1. Download ngrok from https://ngrok.com/download
echo 2. Extract ngrok.exe to your user folder (%USERPROFILE%)
echo 3. Run 'ngrok config add-authtoken YOUR_TOKEN' with your ngrok auth token
echo 4. Run this script again
echo.
pause 