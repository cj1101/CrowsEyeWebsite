@echo off
echo Setting up Java 17 for Firebase emulators...

set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.15.6-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

echo Java version:
java -version

echo.
echo Starting Firebase emulators...
firebase emulators:start --only firestore,auth,storage,ui

pause 