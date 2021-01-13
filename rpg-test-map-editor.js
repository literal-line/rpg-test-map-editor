// rpg-test by Literal Line
// more at quique.gq

var RPG_TEST_MAP_EDITOR = (function () {
  'use strict';

  var canvas = document.createElement('canvas');
  var stage = canvas.getContext('2d');
  var importButton = document.createElement('button');
  var exportButton = document.createElement('button');
  var output = document.createElement('textarea');
  var gameSettings = {
    version: 'v0.1-20210111-1754est',
    authors: ['Literal Line'], // in case you mod or whatever
    width: 768,
    height: 432,
    widthCSS: '768px',
    heightCSS: '432px',
    bg: '#000000',
    aa: false // leave this off to keep images c r i s p
  };

  var setupEventListeners = function () {
    canvas.addEventListener('mousemove', function (e) {
      var coords = getMousePos(canvas, e);
      mouse.x = coords.x;
      mouse.y = coords.y;
    });
    canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
    canvas.addEventListener('mousedown', function () {
      mouse.down = true;
      mouseClick();
    });
    canvas.addEventListener('mouseup', function () {
      mouse.down = false;
    });
    addEventListener('blur', function () {
      mouse.down = false;
    });

    importButton.addEventListener('click', function() {
      importMap();
    });
    exportButton.addEventListener('click', function() {
      exportMap();
    });
  };

  var importMap = function() {
    var data = prompt('Paste map data below:');
    data = data.split(' ');
    mapData = data;
  };

  var exportMap = function() {
    var data = '';
    for (var i = 0; i < mapData.length; i++) {
      data = data + mapData[i] + ' ';
    }
    output.value = data;
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
    tilesetGrass: './assets/tilesetGrass.png',
    soundClick: './assets/click.wav'
  };

  var sprites = { // image to img
    logo: newImage(assets.logo),
    itemDrops: newImage(assets.itemDrops),
    tilesetMap: newImage(assets.tilesetMap),
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
    '#273b2d',
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
    '#fffff4',
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
    canvas.width = gameSettings.width;
    canvas.height = gameSettings.height;
    canvas.style.width = gameSettings.widthCSS;
    canvas.style.height = gameSettings.heightCSS;
    canvas.style.background = gameSettings.bg;
    stage.imageSmoothingEnabled = gameSettings.aa;
    importButton.innerText = 'Import';
    exportButton.innerText = 'Export';
    output.rows = 17;
    output.cols = 200;
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

  var mapData = [ // big chunky soup
    'dddddd45a000000004a0000000b076ddddddddddd1c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    'dddddddd45a0000000455a000760bddddddddddd1c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    'dddddddddd4555a00000045556076ddddddd1222c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    'ddddddd122c000455a000000000bddddd122c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    'dddd122c000000000455a0000076dddd1c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    'ddd1c0000000000000004555556dddd1c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    'd12c000000000000000008dddddddd1c0000000000000000000000000000000075555a07550000000000000000000000000000000000000000000000000000000000000000000000',
    'db00000000000000000008ddddddddb0000000000000000000000000000000008ddddb76dd0000000000000000000000000000000000000000000000000000000000000000000000',
    'db000000000000000000092223ddddb0000000000000000000000075555a00008dddd76ddd0000000000000000000000000000555550000000000000000000000000000000000000',
    '2222300000000000000000000923d1c000045a00000000000000008ffffb00008dddd6dddd0000000000000000000000000000000000000000000000000000000000000000000000',
    '00009300000000000000075a00092c00000004555555555555a0008ffffb00755ddddddddd0000000000000000000000000000000000000000000000000000000000000000000000',
    '00000b0000000000000008d4a000000000000000000000000045555ffff5556ddddddddddd0000000000000000000000000000000000000000000000000000000000000000000000',
    '5555560000000000000008dd45a0000000000000000000000000007ffff5555adddddddddd0000000000000000000000000000000000000000000000000000000000000000000000',
    '0000000000000000000076dddd45555300000000000000000000008ffffddddddddddddddd0000000000000000000000000000000000000000000000000000000000000000000000',
    '000000000000000075556dddddddddd455a00000755a00000000008ffffddddddddddddddd0000000000000000000000000000000000000000000000000000000000000000000000',
    '0007555555a007556ddddddddddddddddd4a00076dd455555a007a9222223ddddddddddddd0000000000000000000000000000000000000000000000000000000000000000000000 ',
    '5556dddddd4556ddddddddddddddddddddd45556ddddddddd455645555556ddddddddddddd0000000000000000000000000000000000000000000000000000000000000000000000 '
  ];

  var gameLoop = (function () {
    var STATE = 'map'; // keeps track of game state. which functions run during which state is determined by a switch statement at the end of this IIFE

    var tilesets = { // tile spritesheets
      map: sprites.tilesetMap,
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
      var tileset = tilesets.map;
      var selectedTile = 0;
      var maxTiles = 18

      document.addEventListener('keydown', function(e) {
        if (e.key === 'w' || e.key === 'ArrowUp') {
          if (selectedTile < maxTiles + 1) selectedTile++;
        } else if (e.key === 's' || e.key === 'ArrowDown') {
          if (selectedTile > 0) selectedTile--;
        } else if (e.key === 'd' || e.key === 'ArrowRight') {
          offset += 16;
        } else if (e.key ==='a' || e.key === 'ArrowLeft') {
          offset -= 16;
        }
      });

      return function (mapData) {
        if (offset < 0) offset = 0;

        for (var y = 0; y < vertical; y++) {
          for (var x = 0; x < horizontal; x++) {
            var cur = mapData[y].charAt(x + Math.floor(offset / 16));
            stage.drawImage(
              tileset,
              (isNaN(parseInt(cur)) ? convertBase(cur, 36, 10) : parseInt(cur)) * 16, // check for non-decimal digit
              0,
              16,
              16,
              x * 16 - (offset % 16),
              y * 16,
              16,
              16
            );
          }
        }

        var cursorX = Math.round(mouse.x / 16) * 16 - 16;
        var cursorY = Math.round(mouse.y / 16) * 16 - 16
        stage.fillStyle = hexToRgba(colors[2], 0.25);
        stage.fillRect(cursorX, cursorY, 16, 16);
        stage.drawImage(
          tileset,
          selectedTile * 16,
          0,
          16,
          16,
          cursorX,
          cursorY,
          16,
          16
        );

        if (mouse.down) {
          if (cursorX / 16 >= 0 && cursorX / 16 <= 47 && cursorY / 16 >= 0 && cursorY / 16 <= 16) {
            mapData[cursorY / 16] = mapData[cursorY / 16].replaceAt(cursorX / 16 + Math.floor(offset / 16), convertBase(selectedTile.toString(), 10, 36));
          }
        }
      };
    })();

    var lastDelta = 0;
    var fps;
    var ms;
    return function (delta) {
      ms = delta - lastDelta; // calculate frame interval
      fps = Math.floor(1000 / ms); // not actually fps, just frame interval converted into screen refresh rate
      stage.clearRect(0, 0, gameSettings.width, gameSettings.height); // clear screen

      switch (STATE) { // run functions based on game state
        case 'map':
          map(mapData);
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
      document.body.appendChild(importButton);
      document.body.appendChild(exportButton);
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
