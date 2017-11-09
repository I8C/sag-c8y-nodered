
Quickstart
-------------
Open your docker terminal and execute following command:

``docker run -it -p 1880:1880 -v ~/cumulocity:/usr/cumulocity --name mynodered nodered/node-red-docker``

This will start a plain vanilla node-red instance in docker. Make sure this project is checked out inside the ``~/cumulocity`` folder.

Next build the node package by issuing the following command:

``docker exec -u root -it mynodered npm install /usr/cumulocity/node-red-i8c-cumulocity/ && docker restart mynodered``

Now open a browser and point it to following url: ``http://<your docker host>:1880``

Now your good to go. In the pallette you should find the Cumulocity specific functions.