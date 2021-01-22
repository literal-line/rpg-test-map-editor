// rpg-test by Literal Line
// more at quique.gq

var RPG_TEST_MAP_EDITOR = (function () {
  'use strict';

  var canvas = document.createElement('canvas');
  var stage = canvas.getContext('2d');
  var output = document.createElement('textarea');
  var gameSettings = {
    version: 'v0.1-20210121-2029est',
    authors: ['Literal Line'], // in case you mod or whatever
    width: 768,
    height: 432,
    widthCSS: '768px',
    heightCSS: '432px',
    bg: '#000000',
    aa: false // leave this off to keep images c r i s p
  };

  var setupEventListeners = function () {
    document.addEventListener('mousemove', function (e) {
      var coords = getMousePos(canvas, e);
      mouse.x = coords.x;
      mouse.y = coords.y;
    });
    canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
    canvas.addEventListener('mousedown', function (e) {
      if (e.button === 0) {
        mouse.down = true;
        mouseClick();
      }
    });
    canvas.addEventListener('mouseup', function (e) {
      if (e.button === 0) mouse.down = false;
    });
    canvas.addEventListener('mouseleave', function () {
      mouse.down = false;
    });
  };

  var setupCanvas = function() {
    canvas.width = gameSettings.width;
    canvas.height = gameSettings.height;
    canvas.style.width = gameSettings.widthCSS;
    canvas.style.height = gameSettings.heightCSS;
    canvas.style.background = gameSettings.bg;
    canvas.style.imageRendering = gameSettings.aa ? 'auto' : 'pixelated';
    canvas.style.imageRendering = gameSettings.aa ? 'auto' : '-moz-crisp-edges';
    stage.imageSmoothingEnabled = gameSettings.aa;
  };

  var setupOutput = function() {
    output.rows = 10;
    output.cols = 50;
  };

  var importMap = function() { // import map
    var input = prompt('Paste map data string below:');
    if (!input) return;
    input = input.replace(/'/g, '"');
    mapData = JSON.parse(input);
  };

  var exportMap = function(data) { // export map as json string
    var output = JSON.stringify(data);
    output = output.replace(/"/g, '\''); // i hate double quotes
    output = output.replace(/,/g, ',\n');
    return output;
  };

  var exportMapFile = function(data) { // export map as json file
    var fileName = prompt('Enter file name below:');
    var link = document.createElement('a');
    var file = new Blob([JSON.stringify(data)], {type: 'text/plain'});
    link.href = URL.createObjectURL(file);
    link.download = fileName + '.json';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  var mouseClick = function () { // prevents buttons from being clicked when click-dragging
    mouse.click = true;
    setTimeout(function () {
      mouse.click = false;
    }, 10);
  };

  var mouse = { // mouse data
    x: 0,
    y: 0,
    down: false,
    click: false // <-- will briefly become true when mouseClick() is called
  };

  var assets = { // images/audio
    tilesetMap: './assets/tilesetMap.png',
    tilesetMapIcons: './assets/tilesetMapIcons.png',
    tilesetGrass: './assets/tilesetGrass.png',
    soundClick: './assets/click.wav'
  };

  var sprites = { // image to img
    tilesetMap: newImage(assets.tilesetMap),
    tilesetMapIcons: newImage(assets.tilesetMapIcons),
    tilesetGrass: newImage(assets.tilesetGrass)
  };

  var audio = {
    click: newWav(assets.soundClick)
  };

  var colors = [ // color pallete for text. idk why im using this, just want consistent colors i guess...
    // slightly modified from here: https://lospec.com/palette-list/pineapple-32
    '#43002a',
    '#890027',
    '#d9243c',
    '#ff6157',
    '#ffb762',
    '#c76e46',
    '#73392e',
    '#34111f',
    '#000000',
    '#375340',
    '#458239',
    '#9cb93b',
    '#ffd832',
    '#ff823b',
    '#d1401f',
    '#7c191a',
    '#310c1b',
    '#833f34',
    '#eb9c6e',
    '#ffdaac',
    '#ffffff',
    '#bfc3c6',
    '#6d8a8d',
    '#293b49',
    '#041528',
    '#033e5e',
    '#1c92a7',
    '#c1f9ff',
    '#ffe0dc',
    '#ff88a9',
    '#c03b94',
    '#601761'
  ];

  var init = function () {
    console.log('rpg-test-map-editor ' + gameSettings.version);
    console.log('Authors: ' + gameSettings.authors);
    setupCanvas();
    setupOutput();
    setupEventListeners();
  };

  var getMousePos = function (c, e) { // gets mouse pos on canvas by taking actual canvas position on document into account
    var rect = c.getBoundingClientRect();
    var scaleX = gameSettings.width / rect.width;
    var scaleY = gameSettings.height / rect.height;
    return {
      x: Math.floor(e.clientX * scaleX - rect.left * scaleX),
      y: Math.floor(e.clientY * scaleY - rect.top * scaleY)
    };
  };

  var drawLine = function (startX, startY, endX, endY) { // draw a line but easier ¯\_(ツ)_/¯
    stage.beginPath();
    stage.moveTo(startX, startY);
    stage.lineTo(endX, endY);
    stage.stroke();
  };

  var drawText = function (obj) { // more uniform way of drawing text
    stage.fillStyle = colors[obj.color || 20];
    stage.font = (obj.size || 24) + 'px Zelda DX';
    stage.fillText(obj.text, obj.center ? obj.x - stage.measureText(obj.text).width / 2 : obj.x, obj.y);
  };

  var CButton = function (obj) { // constructor for buttons
    this.text = obj.text;
    this.color = obj.color || 20;
    this.x = obj.x;
    this.y = obj.y;
    this.width = obj.width || 150;
    this.height = obj.height || 75;
    this.borderColor = obj.borderColor || 1;
    this.bgColor = obj.bgColor || 8;
    this.border = obj.border;
    this.run = obj.run; // <-- will call this function when clicked
  };

  CButton.prototype.draw = (function () { // draw proto (might change name later...)
    audio.click.volume = 0.5;

    return function () {
      var mx = mouse.x;
      var my = mouse.y;
      var x = this.x;
      var y = this.y;
      var width = this.width;
      var height = this.height;
      if (this.border) {
        stage.lineWidth = 2;
        stage.strokeStyle = colors[this.borderColor];
        stage.strokeRect(x - width / 2, y - height / 2, width, height);
      }
      stage.fillStyle = colors[this.bgColor];
      stage.fillRect(x - width / 2, y - height / 2, width, height);

      if (mx >= x - width / 2 && mx <= x + width / 2 && my >= y - height / 2 && my <= y + height / 2) {
        stage.fillStyle = hexToRgba(colors[2], 0.25);
        stage.fillRect(x - width / 2, y - height / 2, width, height);
        if (mouse.click) {
          audio.click.play();
          mouse.click = false;
          this.run();
        }
      }
      if (this.text)
        drawText({
          text: this.text,
          color: this.color,
          x: x,
          y: y + 5,
          center: true
        });
    };
  })();

  var mapData = { // the chunky soup you ordered sir...
    width: 144,
    bg: [
      'dddddd45ag00000g04a0000000b076ddddddddddddddddddddddddddddd8000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'dddddddd45a0g0000g455a000760bdddddddddddddddddddddddddddddd8000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'dddddddddd4555a00000045556076ddddddd12223dddd122223ddddddddb000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'ddddddddeeee00455a000000000bddddd122c00092222c00009223dddddb000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'dddddeeeee000000b455a0000076dddd1c000000000000000000093ddddb000075555a0000000075555555a000000000000000000000000000000000000000000000000000000000',
      'ddddeee00000000045a045555568ddd1c00000000000000000000092222c00008ddddb0000000767675a4a4a00000000000000000000000000000000000000000000000000000000',
      'ddeee0000000000000455a0g0009222c000000000000000000000000000000008ddddb0755555676e8gbe4a4a0000000000000000000000000000000000000000000000000000000',
      'dee0000000000000000008000g000gb0000000000000000000000075555a00008ddddb767555556ee92cee4500000000000000000000000000000000000000000000000000000000',
      'ee00000000000000000004555ag000b000000000000000000000008ddddb00008jjjj4676dddddeeeeeeeee000000000000000555550000000000000000000000000000000000000',
      '222230000000000000000000045a076000045a00000000000000008ddddb00008jjjj456dddddddeeeeeeed000000000000000000000000000000000000000000000000000000000',
      '00009300000000000000012300045600000004555555555555a0076ddddb00076jjjjdddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
      '00000b000000000000000b093000000000000000000000000045560jjjj45556ijjjjiddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
      '555556000000000000000b009230000000000000000000000000007jjjj55556diiiidddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
      '000000000000000000001c0g0092223000000000000000000000008iiiidddddddddddddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
      '00000000000000007551c00000g0009355a00000755a00000000009222223ddddddddddd12222223ddddddd000000000000000000000000000000000000000000000000000000000',
      '0007555555a007556ddbg000000000g8dd4a00076dd455555a007a0000008dddddddddddb0075a08ddddddd000000000000000000000000000000000000000000000000000000000',
      '5556dddddd4556dddddb000g0000g0093dd45556ddddddddd455645555556ddddddddddd4a08gb08ddddddd000000000000000000000000000000000000000000000000000000000'
    ],
    fg: [
      '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000000000000300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000000000000000000000000077700000077770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000100000000000000000070000707777007000770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000100000000000000000700000000000000000077000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000011030000000000007000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000000101000000000077000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000000000000000000000000000070070000770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000000000020000000000000007077707707777007000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '001000000000000000000000001000000000100000000000000770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '100000100000000000001000000000000000001101110101010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000100000000000011000000010000000000000000110001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000001110000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000011100000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000001100000000000000000000000100000000000000100000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    ]
  };

  var gameLoop = (function () {
    var STATE = 'map'; // keeps track of game state. which functions run during which state is determined by a switch statement at the end of this IIFE

    var tilesets = { // tile spritesheets
      map: sprites.tilesetMap,
      mapIcons: sprites.tilesetMapIcons,
      grass: sprites.tilesetGrass
    };

    var invalidState = function () { // if current game state has no case in switch statement
      drawText({ text: 'ERROR:', size: 48, color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2, center: true });
      drawText({ text: 'REQUESTED STATE "' + STATE + '"', color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2 + 40, center: true });
      drawText({ text: 'DOES NOT EXIST!', color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2 + 60, center: true });
      drawText({ text: 'Actual gameplay coming soon... ;)', color: 12, x: gameSettings.width / 2, y: gameSettings.height - 60, center: true });
    };

    var map = (function () { // draw map
      var horizontal = Math.floor(gameSettings.width / 16) + 1;
      var vertical = Math.floor(gameSettings.height / 16) - 10;
      var offset = 0;
      var offsetLimit;
      var tileset = {
        bg: tilesets.map,
        fg: tilesets.mapIcons
      };
      var currentLayer = 'bg';
      var selectedTile = {
        bg: 0,
        fg: 0
      };

      document.addEventListener('keydown', function(e) {
        var maxTiles = {
          bg: tileset.bg.width / 16,
          fg: tileset.fg.width / 16
        };
        var selected = selectedTile[currentLayer];
        var max = maxTiles[currentLayer] - 1;
        switch(e.code) {
          case 'KeyW' || 'ArrowUp':
            if (selected < max) selectedTile[currentLayer]++;
            break;
          case 'KeyS' || 'ArrowDown':
            if (selected > 0) selectedTile[currentLayer]--;
            break;
          case 'KeyD' || 'ArrowRight':
            if (offset < offsetLimit) offset += 16;
            break;
          case 'KeyA' || 'ArrowLeft':
            if (offset > 0) offset -= 16;
            break;
          case 'Space':
            e.preventDefault();
            if (currentLayer === 'bg') {
              currentLayer = 'fg';
            } else if (currentLayer === 'fg') {
              currentLayer = 'bg';
            }
            break;
        }
      });

      return function (mapData) {
        offsetLimit = mapData.width * 16 - gameSettings.width;
        var selectedTileset = tileset[currentLayer];
        var bgTiles = mapData.bg;
        var fgTiles = mapData.fg;

        for (var y = 0; y < vertical; y++) {
          for (var x = 0; x < horizontal; x++) {
            var curBg = bgTiles[y].charAt(x + Math.floor(offset / 16));
            var curFg = fgTiles[y].charAt(x + Math.floor(offset / 16));
            var curBgTile = (isNaN(parseInt(curBg)) ? convertBase(curBg, 36, 10) : parseInt(curBg)) * 16;
            var curFgTile = (isNaN(parseInt(curFg)) ? convertBase(curFg, 36, 10) : parseInt(curFg)) * 16;
            if (curBgTile) stage.drawImage(tileset.bg, curBgTile, 0, 16, 16, x * 16 - (offset % 16), y * 16, 16, 16); // draw bg
            if (curFgTile) stage.drawImage(tileset.fg, curFgTile, 0, 16, 16, x * 16 - (offset % 16), y * 16, 16, 16); // draw fg
          }
        }

        var cursorX = Math.round(mouse.x / 16) * 16 - 16;
        var cursorY = Math.round(mouse.y / 16) * 16 - 16;

        if (cursorX / 16 >= 0 && cursorX / 16 <= 47 && cursorY / 16 >= 0 && cursorY / 16 <= 16) {
          stage.fillStyle = hexToRgba((currentLayer === 'bg' ? colors[6] : colors[10]), 0.5);
          stage.fillRect(cursorX, cursorY, 16, 16);
          stage.drawImage(selectedTileset, selectedTile[currentLayer] * 16, 0, 16, 16, cursorX, cursorY, 16, 16); // tile preview
          if (mouse.down) {
            switch(currentLayer) {
              case 'bg':
                bgTiles[cursorY / 16] = bgTiles[cursorY / 16].replaceAt(cursorX / 16 + Math.floor(offset / 16), convertBase(selectedTile.bg.toString(), 10, 36));
                break;
              case 'fg':
                fgTiles[cursorY / 16] = fgTiles[cursorY / 16].replaceAt(cursorX / 16 + Math.floor(offset / 16), convertBase(selectedTile.fg.toString(), 10, 36));
                break;
            }
          }
        }

        drawText({ text: (offset === 0 ? '' : '<< a'), x: 40, y: gameSettings.height / 4, center: true }); // left/right scroll indicators
        drawText({ text: (offset === offsetLimit ? '' : 'd >>'), x: gameSettings.width - 40, y: gameSettings.height / 4, center: true });

        drawText({ text: '>> w', x: gameSettings.width - 150, y: gameSettings.height - 75, center: true }); // tile selection
        drawText({ text: 's <<', x: gameSettings.width - 305, y: gameSettings.height - 75, center: true });
        drawText({ text: 'Selected tile', x: gameSettings.width - 225, y: gameSettings.height - 135, center: true });
        drawText({ text: '[space] Current layer: ' + currentLayer, x: gameSettings.width - 225, y: gameSettings.height - 20, center: true });
        stage.strokeStyle = colors[20];
        stage.lineWidth = 2;
        stage.strokeRect(gameSettings.width - 260, gameSettings.height - 115, 64, 64);
        stage.drawImage(selectedTileset, selectedTile[currentLayer] * 16, 0, 16, 16, gameSettings.width - 260, gameSettings.height - 115, 64, 64); // selected tile
      };
    })();

    var gui = (function() {
      var buttons = {
        import: new CButton({
          text: 'Import',
          size: 12,
          x: 75,
          y: gameSettings.height - 125,
          width: 115,
          height: 30,
          run: function() {
            mouse.down = false;
            importMap();
          }
        }),
        exportString: new CButton({
          text: 'Export as string',
          x: 158,
          y: gameSettings.height - 85,
          width: 282,
          height: 30,
          run: function() {
            output.value = exportMap(mapData);
          }
        }),
        exportObject: new CButton({
          text: 'Export as file',
          x: 140,
          y: gameSettings.height - 45,
          width: 246,
          height: 30,
          run: function() {
            exportMapFile(mapData);
          }
        })
      };

      return function() {
        for (var b in buttons) if (buttons[b]) buttons[b].draw();
      }
    })();

    var lastDelta = 0;
    var fps;
    var ms;
    return function (delta) {
      ms = delta - lastDelta; // calculate frame interval
      fps = Math.floor(1000 / ms); // not actually fps, just frame interval converted into screen refresh rate
      stage.clearRect(0, 0, gameSettings.width, gameSettings.height); // clear screen

      switch (STATE) { // stupid switch statement still here event though all other states are gone
        case 'map':
          map(mapData);
          gui();
          break;
        default:
          invalidState(); // if current state does not exist...
      }

      drawText({ text: 'FPS: ' + fps, x: 0, y: 20 });
      /*drawText({ text: 'MS: ' + ms, x: 0, y: 40 });*/
      lastDelta = delta;
      requestAnimationFrame(gameLoop); // and again and again and again and again and again and again...
    };
  })();

  return {
    go: function () { // called once document body loads
      init();
      document.body.appendChild(canvas);
      document.body.appendChild(output);
      requestAnimationFrame(gameLoop);
    }
  }
})();


// misc functions

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function convertBase(value, from_base, to_base) {
  var range = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
  var from_range = range.slice(0, from_base);
  var to_range = range.slice(0, to_base);
  
  var dec_value = value.split('').reverse().reduce(function (carry, digit, index) {
    if (from_range.indexOf(digit) === -1) throw new Error('Invalid digit `'+digit+'` for base '+from_base+'.');
    return carry += from_range.indexOf(digit) * (Math.pow(from_base, index));
  }, 0);
  
  var new_value = '';
  while (dec_value > 0) {
    new_value = to_range[dec_value % to_base] + new_value;
    dec_value = (dec_value - (dec_value % to_base)) / to_base;
  }
  return new_value || '0';
}

function newImage(src) {
  var img = document.createElement('img');
  img.src = src;
  return img;
}

function newWav(src) {
  var audio = new Audio(src);
  audio.setAttribute('type', 'audio/x-wav');
  return audio;
}

function hexToRgba(hex, opacity) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? 'rgba(' + parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) + ', ' + opacity + ')'
    : null;
}
