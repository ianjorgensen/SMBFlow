#Witness Reader

##Lateral flow reader application

The application consist of two components. And imaging server and a client server. Both are coded in node.js

###Imaging Server:

A http server that start the imaging scripts, with desired parameters and pipes stdout of the scripts via websockets.

####install dependencies

>cd server   
>npm install .

####start

>npm start

###Client Server:

A http server that hosts the html files for mobile web application.

####install dependencies
>cd server
>npm install .

####start server

>npm start
