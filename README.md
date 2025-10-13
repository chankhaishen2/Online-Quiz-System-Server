# Online Quiz Server
This repository contains the source code for the dummy server for an online quiz answering app (which is a dummy smartphone application whose source code is available from https://github.com/chankhaishen2/Online-Quiz-System-Smartphone-Application) and online quiz setting website (whose source code is available in this repository). This server provides the application programming interface (API) for the smartphone application to get the quizzes and for student to login, answer the quiz and get results. The server renders the webpage for the administrator to add, edit and delete students and teachers and the webpage for the teacher to create, edit, delete, publish and manage the quizzes.

# Setup
1. Open the source code in Visual Studio Code.
2. In the terminal, run "npm install" to install the node modules.
3. In the terminal, run "npm run dev" to start the server.
4. For administrator login, in the browser, go to "http://localhost:5000/administrator/studentList.html". When prompted to enter the user name and password, enter user name "Admin1" and password "My$Password123".
6. For teacher login, in the browser, go to "http://localhost:5000/teacher/quizList.html". When promted to enter the user name and password, enter user name "staff001" and password "My$Password123".
