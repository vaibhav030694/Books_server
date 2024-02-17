#!/bin/bash

# Clone the frontend project
git clone https://github.com/vaibhav030694/Books_FrontEnd.git

# Change directory to Books_FrontEnd
cd Books_FrontEnd

# Install frontend dependencies
npm install

# Change directory back to the parent directory
cd ..

# Clone the server project
git clone https://github.com/vaibhav030694/Books_server.git

# Change directory to Books_server
cd Books_server

# Install server dependencies
npm install

# Change directory back to the parent directory
cd ..

# Change directory to Books_FrontEnd and open command prompt to run ng serve
cd Books_FrontEnd
cmd /c "start ng serve"

# Change directory back to the parent directory
cd ..

# Change directory to Books_server and open command prompt to run node server.js
cd Books_server
cmd /c "start node server.js"
