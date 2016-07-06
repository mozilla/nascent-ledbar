/*
 * Copyright (c) 2015-2016, Nascent Objects Inc
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright 
 *    notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright 
 *    notice, this list of conditions and the following disclaimer in 
 *    the documentation and/or other materials provided with the 
 *    distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its 
 *    contributors may be used to endorse or promote products derived 
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN 
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 */
var mraa;
try {
    mraa = require('mraa');
} catch(e) {
    console.log('No libmraa found; assuming nops for ledbar');
}

var cmdStopAnimation = 0x10;
var cmdAllLedsOff = 0x20;
var cmdLedOn = 0x30;
var cmdSetRGB = 0x40;
var cmdRampRGB = 0x50;
var cmdSetRGBW = 0x60;

function LedBar(bus, address) {
    if (mraa) {
        this.i2c = new mraa.I2c(bus);
        this.i2c.address(address);

        // stop animation
        var buf = new Buffer(1);
        buf[0] = cmdStopAnimation;
        this.i2c.write(buf);
    }

    this.turnOffLeds();
}

LedBar.prototype.turnOffLeds = function() {
    if (!mraa) {
        return;
    }

    var buf = new Buffer(1);
    buf[0] = cmdAllLedsOff;
    this.i2c.write(buf);
}

function fixComponentValue(v) {
    var mx = 60;
    return Math.max(0, Math.min(mx, v * mx / 255));
}

LedBar.prototype.setLed = function(led, r, g, b, w) {
    if (!mraa) {
        return;
    }

    if (led < 0 || led > 15) {
        throw 'Led must be between 0 and 15 inclusive';
    }

    if (w) {
        var buf = new Buffer(5);
        buf[0] = cmdSetRGBW | (15 - led);
        buf[1] = fixComponentValue(r);
        buf[2] = fixComponentValue(g);
        buf[3] = fixComponentValue(b);
        buf[4] = fixComponentValue(w);
        this.i2c.write(buf);
    } else {
        var buf = new Buffer(4);
        buf[0] = cmdSetRGB | (15 - led);
        buf[1] = fixComponentValue(r);
        buf[2] = fixComponentValue(g);
        buf[3] = fixComponentValue(b);
        this.i2c.write(buf);
    }
}

LedBar.prototype.rampLed = function(led, t, r, g, b) {
    if (!mraa) {
        return;
    }

    if (led < 0 || led > 15) {
        throw 'Led must be between 0 and 15 inclusive';
    }
    var buf = new Buffer(5);
    buf[0] = cmdRampRGB | (15 - led);
    buf[1] = Math.max(0, Math.min(255, Math.round(t * 255 / 2.55)));
    buf[2] = fixComponentValue(r);
    buf[3] = fixComponentValue(g);
    buf[4] = fixComponentValue(b);
    this.i2c.write(buf);
}

module.exports = LedBar;
