# TOPO3

Draws a [olsrd](http://olsr.org) topology graph using [cytoscape.js](https://github.com/cytoscape/cytoscape.js).

TOPO3 just gets JSON data from an URL. The JSON file there needs to be created by
a server side application, that parses olsrd dotdraw plugin output and uses 
graphviz to get the nodes positions. A script that does that may be found in the
[python-olsrd-scripts](https://github.com/mmunz/python-olsrd-scripts).

Depencies:

- cytoscape.js
- jquery
- jquery.cookie.js

## Demo

http://augsburg.freifunk.net/TOPO3



