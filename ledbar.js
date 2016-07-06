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
        buf[4] = fixComponentValue(a);
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
