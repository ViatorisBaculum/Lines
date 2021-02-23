"use strict";

class Coords {
  constructor (x, y) {
    this.x = x;
    this.y = y;
  }
}

class Lines extends Coords {

  constructor({
    lines = [],
    intGap = 3,
    intLineWidth = 40,
    intPathHeight = 100,
    intImgWidth = 1000,
    intImgHeight = 200,
    intLines = 10,
    bSmoothLines = false,
    strColor = "",
    highlightFirstLine = true,
    strStrokeWidth = "1",
    canvasId = "canvas",
    svgId = "svg"
  }) {
    super();

    this.lines = lines;
    this.intGap = intGap;
    this.intLineWidth = intLineWidth;
    this.intPathHeight = intPathHeight;
    this.intImgWidth = intImgWidth;
    this.intImgHeight = intImgHeight;
    this.intLines = intLines;
    this.bSmoothLines = bSmoothLines;
    this.strColor = strColor;
    this.highlightFirstLine = highlightFirstLine;
    this.strStrokeWidth = strStrokeWidth;
    this.canvasID = canvasId;
    this.svgID = svgId;
  }

  drawLines(drawBothDirections) {
    if (!drawBothDirections) {
      this.generateUpwards();
    } else {
      lineDiff = this.generateDownwards();
    }

    this.drawLinesOnSVG(this.lines, this.strColor, this.strStrokeWidth, drawBothDirections);
    this.drawLinesOnCanvas(this.lines, this.strColor, this.strStrokeWidth, drawBothDirections);
  }

  generateUpwards() {
    this.lines.push(this.generateFirstLine());
    if (this.bSmoothLines) 
      while (this.lines[this.lines.length - 1].length > 2)
        this.lines.push(this.generateSecondLine(this.lines[this.lines.length-1]));
    else
      for (let i = 0; i < this.intLines; i++)
        this.lines.push(this.generateSecondLine(this.lines[i]));
  }

  generateDownwards() {
    this.generateUpwards();
    this.lines = this.rotateLines(this.lines, this.intImgHeight - this.intPathHeight);
    this.lines.push(this.generateSecondLine(this.lines[0], this.intGap));
    if (this.bSmoothLines) 
      while (this.lines[this.lines.length - 1].length > 3)
                this.lines.push(this.generateSecondLine(this.lines[this.lines.length-1]));
    else
      for (let i = 0; i < this.intLines; i++) 
        this.lines.push(this.generateSecondLine(this.lines[this.lines.length-1]));
  }

  generateFirstLine() {
    let outPutLine = [];
    var rndLength;
    var rndDirection = 0;

    var min = this.intImgHeight - this.intPathHeight;
    var max = this.intImgHeight;
    var width = this.intImgWidth;
    var maxRnd = this.intLineWidth;

    var newCoords = new Coords(0, min);
    outPutLine.push(new Coords(newCoords.x, newCoords.y));

    while (newCoords.x < width) {
      rndLength = this.getRnd(5, maxRnd);

      switch (rndDirection) {
        case 0: //right
          newCoords.x = newCoords.x + rndLength;
          outPutLine.push(new Coords(newCoords.x, newCoords.y));
          break;
        case 1: //down
          if (newCoords.y + rndLength < max) {
            newCoords.y = newCoords.y + rndLength;
            outPutLine.push(new Coords(newCoords.x, newCoords.y));
          } else {
            rndDirection = 0;
          }
          break;
        case 2: //up
          if (newCoords.y - rndLength > min) {
            newCoords.y = newCoords.y - rndLength;
            outPutLine.push(new Coords(newCoords.x, newCoords.y));
          } else {
            rndDirection = 0;
          }
          break;
      }

      if (rndDirection == 0)  //make sure direction always changes
        rndDirection = this.getRnd(1, 2);
      else if (rndDirection == 1)
        rndDirection = 0;
      else if (rndDirection == 2)
        rndDirection = 0;
    }
    if (outPutLine[outPutLine.length-1].x > width)  
      outPutLine[outPutLine.length-1].x = width;
    return outPutLine;
  }

  generateSecondLine(inputLineRef) {
    var outPutLine = [];
    var x, y, dx, dy;

    var iSpace = this.intGap;
    let inputLine = this.cloneObj(inputLineRef);
    //let inputLine = _.cloneDeep(inputLineRef);
    inputLine = this.smoothLine(inputLine, iSpace);

    outPutLine.push(new Coords(inputLine[0].x, inputLine[0].y - iSpace)); //push first array manually for comparison 

    for (let i = 1; i < inputLine.length; i++) {
      x = inputLine[i].x;
      y = inputLine[i].y;
      dx = inputLine[i - 1].x;
      dy = inputLine[i - 1].y;

      if (x > dx) { //right
        outPutLine.push(new Coords(x, y - iSpace));
      } else if (y > dy) { //down
        outPutLine[outPutLine.length - 1].x = outPutLine[outPutLine.length - 1].x + iSpace; //when goin down the preceding x-coord has to be moved slightly to match the vertical line of the
        outPutLine.push(new Coords(x + iSpace, y - iSpace));
      } else if (y < dy) { //up     
        outPutLine[outPutLine.length - 1].x = outPutLine[outPutLine.length - 1].x - iSpace; //changin again preceding x-coord   
        outPutLine.push(new Coords(x - iSpace, y - iSpace));
      }
    }

    return outPutLine;
  }

  smoothLine(inputLine) {
    var wasInvalid = true;
    var iSpace = this.intGap;

    while (wasInvalid) {
      wasInvalid = false;
      for (let i = 3; i < inputLine.length; i++) {
        if ((inputLine[i].x - inputLine[i - 2].x) < iSpace * 2 && inputLine[i - 1].y > inputLine[i].y && inputLine[i - 2].y > inputLine[i - 3].y) {
          if (inputLine[i].y > inputLine[i - 3].y) {
            inputLine[i].x = inputLine[i - 3].x;
          } else {
            inputLine[i - 3].x = inputLine[i].x;
          }
          if (inputLine[i].y != inputLine[i - 3].y)
            inputLine.splice(i - 2, 2);
          else
            inputLine.splice(i - 3, 4);
          wasInvalid = true;
        }
      }
      if (inputLine[inputLine.length-1].x - inputLine[inputLine.length-2].x < iSpace + 1 && inputLine[inputLine.length-2].y > inputLine[inputLine.length-3].y) {
        inputLine.length = inputLine.length-2;
        inputLine[inputLine.length-1].x = this.intImgWidth;
      } else if ((inputLine[1].x - inputLine[0].x < iSpace + 1 && inputLine[1].y > inputLine[2].y)) {
        inputLine.splice(0, 2);
        inputLine[0].x = 0;
      }
    }
    return inputLine;
  }

  rotateLines(inputLines, yCenter) {
    var outputLine = [], outputLines = [];

    var yDiff;
    for (let n = 0; n < inputLines.length; n++) {
      for (let i = 0; i < inputLines[n].length; i++) {
        yDiff = 2 * (yCenter - inputLines[n][i].y); //positive when point higher

        outputLine.push(new Coords(inputLines[n][i].x, inputLines[n][i].y + yDiff));
      }
      outputLines.push(outputLine);
      outputLine = [];
    }
    return outputLines;
  }

  drawLinesOnSVG(toDraw, strColor = "", strStrokeWidth = "1", drawBothDirections = false) {
    var lineColor = "";
    let lineTranslation = 10 + Math.abs(this.getBounds(toDraw)[0] - Math.abs(this.getBounds(toDraw)[1]));

    $("#svgLines").height(lineTranslation);
    if (drawBothDirections)
      lineTranslation = lineTranslation/2 - this.intPathHeight;
    else
      lineTranslation = lineTranslation - this.intImgHeight;

    for (let n = 0; n < toDraw.length; n++) {
      var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      var strPoints = "";

      if (strColor == "")
        lineColor = "#" + (Math.random().toString(16) + "000FFF").slice(2, 8);
      else
        lineColor = strColor;

      if (n == 0 && this.highlightFirstLine) lineColor = "#000000";

      newLine.setAttribute("stroke-width", strStrokeWidth);
      if (n == 0 && this.highlightFirstLine) newLine.setAttribute("stroke-width", "3");
      newLine.setAttribute("stroke", lineColor);
      newLine.setAttribute("fill", "none");
      newLine.setAttribute("shape-rendering", "crispEdges");

      for (let i = 0; i < toDraw[n].length; i++) {
        strPoints = strPoints + (toDraw[n][i].x + 0.5) + "," + (toDraw[n][i].y + 0.5 + lineTranslation ) + "\n";
      }

      newLine.setAttribute("points", strPoints);
      $('#' + this.svgID).append(newLine);
    }
  }
 
  clearSVG = () => {
    //$('#' + this.svgID).empty();
    var svg = document.getElementById(this.svgID);
    while (svg.lastChild) {
      svg.removeChild(svg.lastChild);
    }
  }
 
  drawLinesOnCanvas(toDraw, strColor = "", strStrokeWidth = "1", drawBothDirections) {
    var canvas = document.getElementById(this.canvasID);
    canvas.width = this.intImgWidth;
    canvas.height = this.intImgHeight;
    var ctx = canvas.getContext("2d");

    let lineTranslation = 10 + Math.abs(this.getBounds(toDraw)[0] - Math.abs(this.getBounds(toDraw)[1]));
    ctx.canvas.height = lineTranslation;

    if (drawBothDirections)
      lineTranslation = lineTranslation/2 - this.intPathHeight;
    else
      lineTranslation = lineTranslation - this.intImgHeight;

    var lineColor = "";

    for (let n = 0; n < toDraw.length; n++) {
      if (strColor == "")
        lineColor = "#" + (Math.random().toString(16) + "000000").slice(2, 8);
      else
        lineColor = strColor;

      if (n == 0 && this.highlightFirstLine) lineColor = "#000000";
      if (n == 0 && this.highlightFirstLine) ctx.lineWidth = 3; else ctx.lineWidth = +strStrokeWidth;

      ctx.beginPath();
      ctx.strokeStyle = lineColor;

      for (let i = 1; i < toDraw[n].length; i++) {
        ctx.moveTo(toDraw[n][i - 1].x + this.getTrans(ctx.lineWidth), toDraw[n][i - 1].y + this.getTrans(ctx.lineWidth) + lineTranslation);
        ctx.lineTo(toDraw[n][i].x + this.getTrans(ctx.lineWidth), toDraw[n][i].y + this.getTrans(ctx.lineWidth) + lineTranslation);
      }
      ctx.closePath();
      ctx.lineCap = "square";
      ctx.stroke();
    }
  }
  // getSign(iNumber) {
  //   if (iNumber > 0)
  //     return 1
  //   else
  //     return -1
  // }
  // getTrans(strokeWidth) {
  //   if (strokeWidth % 2 > 0)
  //     return 0.5
  //   else
  //     return 0
  // }
  // getRnd(min, max) { //random integer
  //   min = Math.ceil(min);
  //   max = Math.floor(max);
  //   return Math.floor(Math.random() * (max - min + 1)) + min;
  // }

  getSign = (iNumber) => iNumber > 0 ? 1 : -1;

  getTrans = (strokeWidth) => strokeWidth % 2 > 0 ? 0.5 : 0;

  getRnd = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  cloneObj(source) {
    if (Object.prototype.toString.call(source) === '[object Array]') {
      var clone = [];
      for (let i = 0; i < source.length; i++) {
        clone[i] = this.cloneObj(source[i]);
      }
      return clone;
    } else if (typeof (source) == "object") {
      var clone = {};
      for (let prop in source) {
        if (source.hasOwnProperty(prop)) {
          clone[prop] = this.cloneObj(source[prop]);
        }
      }
      return clone;
    } else {
      return source;
    }
  }
  getBounds(inputLines) {
    let min = 0, max = 0;
    for (let n = 0; n < inputLines.length; n++) {
      for (let i = 1; i < inputLines[n].length; i++) {
        if (inputLines[n][i].y < min) {
          min = inputLines[n][i].y;
        }
        if (inputLines[n][i].y > max) {
          max = inputLines[n][i].y;
        }
      }
    }
    return [min, max];
  }
  sortArray(inputLines) {
    // for (let n = 0; n < inputLines.length; n++) {
    //   inputLines[n].sort((a, b) => +a.y - +b.y);
    // }
    inputLines.sort((a, b) => +a[0].y - +b[0].y);
  }
}