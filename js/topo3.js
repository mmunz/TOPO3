var cy;
var meta;
var targetDiv = 'topo';
var btnIcvpnLabel = "Hide ICVPN";
var siteTitle = "Freifunk Augsburg";
var siteUrl = 'http://augsburg.freifunk.net'
function drawGraph(json) {
    cy = cytoscape({
        container: document.getElementById(targetDiv),
        style: cytoscape.stylesheet()
                .selector('node')
                .css({
                    'content': 'data(label)',
                    'background-color': '#f9f9f9',
                    'background-opacity': '0.85',
                    'border-color': '#888',
                    'border-width': 1,
                    'text-valign': 'center',
                    'font-size': 12,
                    'color': 'black',
                    'min-zoomed-font-size': 2,
                    'width': 130,
                    'height': 30,
                })
                .selector('edge')
                .css({
                    'font-size': 10,
                    'min-zoomed-font-size': 5,
                    'target-arrow-shape': 'triangle',
                    'width': 2,
                    'opacity': 0.5,
                    'text-opacity': 1,
                    'line-color': 'data(color)',
                    'target-arrow-color': 'data(color)',
                    'content': 'data(label)'
                })

                .selector('edge[label="HNA"]')
                .css({
                    'line-style': 'dashed',
                })
                .selector('edge[group = "icvpn"]')
                .css({
                    'line-style': 'dotted',
                    'width': 1
                })
                .selector('node[type="HNA"]')
                .css({
                    'shape': 'rectangle'
                })
                .selector('node[id = "0.0.0.0/0"]')
                .css({
                    'shape': 'octagon',
                    'width': 100,
                    'height': 100,
                    'border-radius': 0
                })

                .selector('node:selected')
                .css({
                    'background-color': 'black',
                    'color': 'white',
                    'opacity': 1,
                    'text-opacity': 1,
                })
                .selector('edge:selected')
                .css({
                    'opacity': 1,
                    'text-opacity': 1,
                })
                .selector('.highlighted')
                .css({
                    'background-color': '#61bffc',
                    'line-color': '#61bffc',
                    'width': 8,
                    'target-arrow-color': '#61bffc',
                    'transition-property': 'background-color, line-color, target-arrow-color',
                    'transition-duration': '0.5s'
                }),
        elements: json['cyto'],
        layout: {
            name: 'preset',
            fit: true,
            ready: function() {
                initState(json);
            },
        },
        minZoom: 0.1,
        maxZoom: 2,
        motionBlur: true,
        hideLabelsOnViewport: false,
        textureOnViewport: true,
    });
}

function loadGraph() {
    $.getJSON("topo3.json")
            .done(function(json) {
                meta = json['meta'];
                drawGraph(json);
            })
            .fail(function(jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                console.log("JSON Request Failed: " + err);
            });
}
loadGraph();

function toggleIcvpn() {
    var el = cy.elements('node[group = "icvpn"]');
    var visible = el.visible();

    if (visible == true) {
        el.hide();
        $.cookie("show-icvpn", false, {expires: 31});
        $("#toggle-icvpn").html("Show ICVPN");
    } else {
        el.show();
        $.cookie("show-icvpn", true, {expires: 31});
        $("#toggle-icvpn").html("Hide ICVPN");
    }
    updateStats();
}

function panToNode(el) {
    cy.fit(el);
    el.selected();
}

function searchNode(searchString) {
    var eles = cy.elements('node[id *= "' + searchString + '" ], node[label *= "' + searchString + '" ]');
    console.log(eles.length);
    if (eles.length == 1) {
        panToNode(eles)
    }
}

function initState() {
    if ($.cookie("show-icvpn") === 'false') {
        toggleIcvpn();
        btnIcvpnLabel = "Show ICVPN";
    }
    insertHeader();
    insertFooter();
    updateStats();
    updateMeta();
    $("#search-node").keyup(function() {
        var searchString = $("#search-node").val();
        if (searchString.length > 3) {
            searchNode($("#search-node").val());
        }
    });
}

function insertHeader() {
    if (!$('#topo3-stats').length) {
        var controls = '<div id="controls">';
        controls += '<button id="button-reload" class="btn" onclick="loadGraph()">Reload</button>';
        controls += '<button id="toggle-icvpn" class="btn" onclick="toggleIcvpn()">' + btnIcvpnLabel + '</button>';
        controls += '<input id="search-node" name="search-node" placeholder="Search (IP or hostname)" />';
        controls += '</div>';
        $('#' + targetDiv).before('<div id="topo3-header">' + controls + '</div>');
    }
}

function insertFooter() {
    if (!$('#topo3-footer').length) {
        var footer = '<div id="#topo3-footer">';
        footer += '<div id="topo3-about">';
        if (siteTitle.length && siteUrl.length) {
            footer += '<a href="' + siteUrl + '">' + siteTitle + '</a> Network Topology ';
        }
        footer += 'created by <a href="https://github.com/mmunz/TOPO3">TOPO3</a>';
        footer += '</div>';
        footer += '<div id="topo3-meta">';
        footer += 'Generated on <span id="topo3-generated-on"></span> by <span id="topo3-generated-by">';
        footer += '</div>';
        footer += '</div>';
        $('#' + targetDiv).after('<div id="topo3-footer">' + footer + '</div>');
    }
}

function updateStats() {
    var nodesTotal = cy.elements('node:visible').length;
    var nodesHna = cy.elements('node[type = "HNA"]:visible').length;
    var nodes = nodesTotal - nodesHna;
    var links = cy.elements('edge:visible').length;
    var stats = "Nodes: " + nodes + " | HNA: " + nodesHna + " | Links: " + links;
    if ($('#topo3-stats').length > 0) {
        $("#topo3-stats").html(stats);
    } else {
        $("#topo3-header").prepend('<div id="topo3-stats">' + stats + '</div>');
    }
}

function formatTimestamp(timestamp) {
    var d = new Date();
    date = new Date(timestamp * 1000 + d.getTimezoneOffset() * 60000);
    return date;
}

function updateMeta() {
    $('#topo3-generated-on').html(formatTimestamp(meta['generated_on']));
    $('#topo3-generated-by').html(meta['generated_by']);
}


