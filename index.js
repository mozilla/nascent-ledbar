/**
 * Copyright 2015, Nascent Objects
 * All rights reserved.
 */

/**
 * API for the Nascent LED bar module
 * @module NascentLedBar
 */

var LedBar = require('./ledbar');

var NascentLedBar = {
    ledbar: new LedBar(6, 0x10),
    r: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    g: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    b: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    w: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
};

/**
 * Gets the number of leds that this led bar supports.
 * @returns {number} - The number of leds supported by this led bar.
 * @alias module:NascentLedBar.getNumLeds  
 */
NascentLedBar.getNumLeds = function() {
    return 16;
}

/**
 * Turns off all leds.
 * @alias module:NascentLedBar.turnOffLeds  
 */
NascentLedBar.turnOffLeds = function() {
    for (var a=0; a<16; ++a) {
        this.r[a] = 0;
        this.g[a] = 0;
        this.b[a] = 0;
        this.w[a] = 0;
    }

    if (!NascentLedBar.inErrorState()) {
        this.ledbar.turnOffLeds();
    }
};

/**
 * Sets all leds to the given colour.
 * @param {number} r - An integer in range of 0 - 255 specifying the red component.
 * @param {number} g - An integer in range of 0 - 255 specifying the green component.
 * @param {number} b - An integer in range of 0 - 255 specifying the blue component.
 * @param {number} w - An integer in range of 0 - 255 specifying the white component.
 * @alias module:NascentLedBar.setAllLeds  
 */
NascentLedBar.setAllLeds = function(r, g, b, w) {
    var a;
    for (a=0; a<NascentLedBar.getNumLeds(); ++a) {
        NascentLedBar.setLed(a, r, g, b, w);
    }
};

/**
 * Sets a single leds colour.
 * @param {number} led - Index of the led to change.  Starts with 0 and must be below getNumLeds().
 * @param {number} r - An integer in range of 0 - 255 specifying the red component.
 * @param {number} g - An integer in range of 0 - 255 specifying the green component.
 * @param {number} b - An integer in range of 0 - 255 specifying the blue component.
 * @param {number} w - An integer in range of 0 - 255 specifying the white component.
  * @alias module:NascentLedBar.setLed
 */
NascentLedBar.setLed = function(led, r, g, b, w) {
    if (r === this.r[led] && g === this.g[led] && b === this.b[led] && w === this.w[led]) {
        return;
    }

    this.r[led] = r;
    this.g[led] = g;
    this.b[led] = b;
    this.w[led] = w;
    this.ledbar.setLed(led, r, g, b, w);
};

/**
 * Sets all leds of the led bar to act as a progress bar.
 * @param {number} val - Number between 0 and 1 showing the current value of the progress bar.  0 will be no leds, 1 will be all leds visible.
 * @param {string} type - The type of progress bar.  One of 'left', 'bottom', 'middle', 'top', 'right'.
 * @alias module:NascentLedBar.setProgress 
 */
NascentLedBar.setProgress = function(val, type, r, g, b, w) {
    var a;

    val = Math.max(0, Math.min(1, val));
    var maxLeds = NascentLedBar.getNumLeds();
    var numLeds = Math.round(val * maxLeds);
    var mid = Math.round(maxLeds/2);

    if (!r && !g && !b && !w) {
        r = 255;
        g = 255;
        b = 255;
	w = 0;
    }

    if (type === 'top' || type === 'right') {
        for (a=0; a<numLeds; ++a) {
            NascentLedBar.setLed(maxLeds-a-1, r, g, b, w);
        }
        for (a=numLeds; a<maxLeds; ++a) {
            NascentLedBar.setLed(maxLeds-a-1, 0, 0, 0, 0);
        }
    } else if (type === 'middle') {
        numLeds = numLeds / 2;
        for (a=0; a<numLeds; ++a) {
            NascentLedBar.setLed(mid+a, r, g, b, w);
            NascentLedBar.setLed(mid-a, r, g, b, w);
        }
        for (a=numLeds; a<maxLeds/2; ++a) {
            NascentLedBar.setLed(mid+a, 0, 0, 0, 0);
            NascentLedBar.setLed(mid-a, 0, 0, 0, 0);
        }
    } else {
        for (a=0; a<numLeds; ++a) {
            NascentLedBar.setLed(a, r, g, b, w);
        }
        for (a=numLeds; a<maxLeds; ++a) {
            NascentLedBar.setLed(a, 0, 0, 0, 0);
        }
    }
};

function consoleDebug() {
    for (var a=0; a<NascentLedBar.getNumLeds(); ++a) {
        var avg = (NascentLedBar.r[a] + NascentLedBar.g[a] + NascentLedBar.b[a]) / 3;
        avg = Math.floor(avg / 16);
        process.stdout.write(avg.toString(16));
    }
    process.stdout.write('\n');
}

/**
 * Enables console output of the current state of the led bar.  Use this if you don't actually have an led bar, but want to see its values in the console.
 * @param {number} interval.  The interval to print out the led bar state in ms.
 * @alias module:NascentLedBar.enableConsoleDebug  
 */
NascentLedBar.enableConsoleDebug = function(interval) {
    setInterval(consoleDebug, interval);
};

/**
 * Disables console output.
 * @alias module:NascentLedBar.disableConsoleDebug  
 */
NascentLedBar.disableConsoleDebug = function() {
    clearInterval(consoleDebug);
};

/**
 * Sets LEDs on or off according to an array of booleans.
 * @param {boolean[]} boolArray - Array of boolean values indicating if that led is full brightness or off.
 * @alias module:NascentLedBar.setOnOffPattern   
 */
NascentLedBar.setOnOffPattern = function(boolArray, r, g, b, w) {
    if (!r && !g && !b && !w) {
        r = 255;
        g = 255;
        b = 255;
	w = 0;
    }

    for (var a=0; a<NascentLedBar.getNumLeds(); ++a) {
        if (a >= boolArray.length) {
            NascentLedBar.setLed(a, 0, 0, 0, 0);
        } else if (boolArray[a]) {
            NascentLedBar.setLed(a, r, g, b, w);
        } else {
            NascentLedBar.setLed(a, 0, 0, 0, 0);
        }
    }
};

module.exports = NascentLedBar;
