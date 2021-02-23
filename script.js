"use strict";

let genLines;

document.querySelector("#gap").value = 5;
document.querySelector("#lines").value = 20;
document.querySelector("#linew").value = 20;
document.querySelector("#strokew").value = 1;
document.querySelector("#imagew").value = 1000;
document.querySelector("#imageh").value = 250;

function initiateVariables() {
    let strColor = "";

    if (!document.getElementById("coloredLines").checked)
        strColor = "black";
    else
        strColor = "";

    let props = {
        intGap: +document.querySelector("#gap").value,
        intLineWidth: +document.querySelector("#linew").value,
        intPathHeight: 100,
        intImgWidth: +document.querySelector("#imagew").value,
        intImgHeight: +document.querySelector("#imageh").value,
        intLines: +document.querySelector("#lines").value,
        bSmoothLines: document.getElementById("smoothLines").checked,
        strColor: strColor,
        highlightFirstLine: document.getElementById("firstLine").checked,
        strStrokeWidth: +document.querySelector("#strokew").value,
        canvasId: "canvas",
        svgId: "svgLines"
    };

    genLines = new Lines(props);
    genLines.clearSVG();
    if (document.getElementById("savePng").checked) {
        $('#svgLines').css('display', 'none');
        $('#canvas').css('display', 'block');
    } else {
        $('#svgLines').css('display', 'block');
        $('#canvas').css('display', 'none');
    }
    $("#svgLines").width(genLines.intImgWidth).height(genLines.intImgHeight);
    $("#controls").width(genLines.intImgWidth);
    $("#settingsContainer").width(genLines.intImgWidth);
    $("#title").width(genLines.intImgWidth);
}

function runApp() {
    initiateVariables();
    genLines.drawLines(document.getElementById("bothDir").checked);
}

$('#settings').click(function () {  
    $('#settingsContainer').slideToggle('slow', function() {            
    });
});

$( document ).ready(function() {
    document.querySelector("#imagew").value = $("#svgLines").width() - 50;
    runApp();
});