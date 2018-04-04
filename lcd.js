var LCDPLATE, lcd;
LCDPLATE = require('adafruit-i2c-lcd').plate;
lcd = new LCDPLATE(1, 0x70);

lcd.createChar(1, [0,0,10,31,31,14,4,0]);
