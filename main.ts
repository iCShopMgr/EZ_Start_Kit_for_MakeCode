//% weight=0 color=#B3203E icon="\uf118" block="EZ Start Kit"
namespace ezstartkit {
    /*
    ===EZ Start Kit : ButtonAB===
    */
    led.enable(false)
    pins.setPull(DigitalPin.P5, PinPullMode.PullNone)
    pins.setPull(DigitalPin.P11, PinPullMode.PullNone)

    export enum Button_read {
        //% block="A"
        read1 = 1,
        //% block="B"
        read2 = 2,
        //% block="A+B"
        read3 = 3
    }

    //% weight=121
    //% block="Push Bottom %direction"
    export function buttonABinput(direction: Button_read = 1, a: () => void) {
        if (direction == 1) {
            input.onButtonPressed(Button.A, function () {
                a();
            })
        }
        else if (direction == 2) {
            input.onButtonPressed(Button.B, function () {
                a();
            })
        }
        else {
            input.onButtonPressed(Button.AB, function () {
                a();
            })
        }
    }

    //% weight=120
    //% blockId=ButtonAB block="Button %br push?"
    export function buttonAB(br: Button_read = 1): boolean {
        if (br == 1) {
            if (pins.digitalReadPin(DigitalPin.P5) == 0 && pins.digitalReadPin(DigitalPin.P11) == 1) {
                return true
            }
            else {
                return false
            }
        }
        else if (br == 2) {
            if (pins.digitalReadPin(DigitalPin.P5) == 1 && pins.digitalReadPin(DigitalPin.P11) == 0) {
                return true
            }
            else {
                return false
            }
        }
        else {
            if (pins.digitalReadPin(DigitalPin.P5) == 0 && pins.digitalReadPin(DigitalPin.P11) == 0) {
                return true
            }
            else {
                return false
            }
        }
    }



    /*
    ===EZ Start Kit : DHT11===
    */
    export enum DHT_Data {
        //% block="Temp"
        data1 = 1,
        //% block="Humid"
        data2 = 2,
    }
    let DHT_count = 0
    let DHT_value = 0
    let DHT_out = 0
    let DHT_Temp = 0
    let DHT_Humid = 0

    function Ready(): number {
        pins.digitalWritePin(DigitalPin.P16, 0)
        basic.pause(20)
        pins.digitalWritePin(DigitalPin.P16, 1)
        DHT_count = input.runningTimeMicros()
        while (pins.digitalReadPin(DigitalPin.P16) == 1) {
            if (input.runningTimeMicros() - DHT_count > 100) {
                return 0
            }
        }
        DHT_count = input.runningTimeMicros()
        while (pins.digitalReadPin(DigitalPin.P16) == 0) {
            if (input.runningTimeMicros() - DHT_count > 100) {
                return 0
            }
        }
        DHT_count = input.runningTimeMicros()
        while (pins.digitalReadPin(DigitalPin.P16) == 1) {
            if (input.runningTimeMicros() - DHT_count > 100) {
                return 0
            }
        }
        return 1
    }

    function ReadData() {
        DHT_value = 0
        if (Ready() == 1) {
            for (let k = 0; k < 24; k++) {
                DHT_out = 0
                while (pins.digitalReadPin(DigitalPin.P16) == 0) {
                    DHT_out += 1
                    if (DHT_out > 100) {
                        break
                    }
                }
                DHT_count = input.runningTimeMicros()
                DHT_out = 0
                while (pins.digitalReadPin(DigitalPin.P16) == 1) {
                    DHT_out += 1
                    if (DHT_out > 100) {
                        break
                    }
                }
                if (input.runningTimeMicros() - DHT_count > 40) {
                    DHT_value = DHT_value + (1 << (23 - k));
                    DHT_Temp = (DHT_value & 0x0000ffff)
                    DHT_Humid = (DHT_value >> 16)
                }
            }
        }
        else {
            pins.digitalWritePin(DigitalPin.P16, 1)
        }
    }

    //% weight=110
    //% blockId=DHT11 block="DHT11 get %dh"
    export function dht11(dh: DHT_Data = 1): number {
        ReadData()
        basic.pause(100)
        if (dh == 1) {
            return DHT_Temp
        }
        else {
            return DHT_Humid
        }
    }

    /*
    ===EZ Start Kit : IR===
    */
    //% weight=102
    //% blockId=IR block="Enable IR"
    export function enIR(): void {
        pins.onPulsed(DigitalPin.P8, PulseValue.Low, function () {
            readir.push(pins.pulseDuration())
        })
        pins.onPulsed(DigitalPin.P8, PulseValue.High, function () {
            readir.push(pins.pulseDuration())
        })

        pins.setEvents(DigitalPin.P8, PinEventType.Pulse)
        pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
    }

    let hexCode: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]
    let readir: number[] = []
    readir = []
    let Pnumber = ""
    let readCode = 0
    let toHEX = ""
    let IRREAD: Action;
    let Reading = false
    control.inBackground(function () {
        while (true) {
            if (Reading == true) {
                if (readir[0] > 4000 && readir[0] < 5000) {
                    basic.pause(100)
                    let one_data = 0
                    /*
                        for (let i = 0; i < readir.length; i++) {
                            serial.writeLine("" + readir[i])
                        }
                        */
                    Pnumber = ""
                    //count
                    readCode = 0
                    one_data = 2
                    for (let i = 0; i < 8; i++) {
                        if (readir[one_data] > 1000) {
                            readCode += (1 << (7 - i))
                        }
                        one_data += 2
                    }
                    toHEX = hexCode[readCode / 16] + hexCode[readCode % 16]
                    Pnumber += toHEX

                    readCode = 0
                    one_data = 18
                    for (let i = 0; i < 8; i++) {
                        if (readir[one_data] > 1000) {
                            readCode += (1 << (7 - i))
                        }
                        one_data += 2
                    }
                    toHEX = hexCode[readCode / 16] + hexCode[readCode % 16]
                    Pnumber += toHEX
                    if (Pnumber == "00ff") {
                        Pnumber = ""
                        readCode = 0
                        one_data = 34
                        for (let i = 0; i < 8; i++) {
                            if (readir[one_data] > 1000) {
                                readCode += (1 << (7 - i))
                            }
                            one_data += 2
                        }
                        toHEX = hexCode[readCode / 16] + hexCode[readCode % 16]
                        Pnumber += toHEX

                        readCode = 0
                        one_data = 50
                        for (let i = 0; i < 8; i++) {
                            if (readir[one_data] > 1000) {
                                readCode += (1 << (7 - i))
                            }
                            one_data += 2
                        }
                        toHEX = hexCode[readCode / 16] + hexCode[readCode % 16]
                        Pnumber += toHEX
                    }
                    else {
                        Pnumber = "X"
                    }

                    basic.pause(50)
                    readir = []

                    if (Reading) {
                        IRREAD()
                    }

                }
                else {
                    readir = []
                }
            }
            basic.pause(1)
        }
    })

    //% weight=101
    //% blockId=IR_read block="IR Read"
    export function irRead(): string {
        return Pnumber
    }

    //% weight=100
    //% blockId=IR_remote block="IR Remote(NEC)"
    export function irRemote(add: Action): void {
        IRREAD = add
        Reading = true
    }

    /*
    ===EZ Start Kit : LED===
    */
    export enum LED_write {
        //% block="Red"
        write1 = 1,
        //% block="Yellow"
        write2 = 2,
        //% block="Green"
        write3 = 3
    }

    //% weight=80
    //% brightness.min=0 brightness.max=1023
    //% blockId=LED_control block="LED %choose set velue %brightness |(0~1023)"
    export function led_control(choose: LED_write = 1, brightness: number): void {
        if (brightness < 0) {
            brightness = 0;
        }
        if (brightness > 1023) {
            brightness = 1023;
        }
        if (choose == 1) {
            pins.analogWritePin(AnalogPin.P13, brightness)
        }
        else if (choose == 2) {
            pins.analogWritePin(AnalogPin.P14, brightness)
        }
        else {
            pins.analogWritePin(AnalogPin.P15, brightness)
        }
    }

    /*
    ===EZ Start Kit : OLED===
    */
    const basicFont: string[] = [
        "\x00\x00\x00\x00\x00\x00\x00\x00", // " "
        "\x00\x00\x5F\x00\x00\x00\x00\x00", // "!"
        "\x00\x00\x07\x00\x07\x00\x00\x00", // """
        "\x00\x14\x7F\x14\x7F\x14\x00\x00", // "#"
        "\x00\x24\x2A\x7F\x2A\x12\x00\x00", // "$"
        "\x00\x23\x13\x08\x64\x62\x00\x00", // "%"
        "\x00\x36\x49\x55\x22\x50\x00\x00", // "&"
        "\x00\x00\x05\x03\x00\x00\x00\x00", // "'"
        "\x00\x1C\x22\x41\x00\x00\x00\x00", // "("
        "\x00\x41\x22\x1C\x00\x00\x00\x00", // ")"
        "\x00\x08\x2A\x1C\x2A\x08\x00\x00", // "*"
        "\x00\x08\x08\x3E\x08\x08\x00\x00", // "+"
        "\x00\xA0\x60\x00\x00\x00\x00\x00", // ","
        "\x00\x08\x08\x08\x08\x08\x00\x00", // "-"
        "\x00\x60\x60\x00\x00\x00\x00\x00", // "."
        "\x00\x20\x10\x08\x04\x02\x00\x00", // "/"
        "\x00\x3E\x51\x49\x45\x3E\x00\x00", // "0"
        "\x00\x00\x42\x7F\x40\x00\x00\x00", // "1"
        "\x00\x62\x51\x49\x49\x46\x00\x00", // "2"
        "\x00\x22\x41\x49\x49\x36\x00\x00", // "3"
        "\x00\x18\x14\x12\x7F\x10\x00\x00", // "4"
        "\x00\x27\x45\x45\x45\x39\x00\x00", // "5"
        "\x00\x3C\x4A\x49\x49\x30\x00\x00", // "6"
        "\x00\x01\x71\x09\x05\x03\x00\x00", // "7"
        "\x00\x36\x49\x49\x49\x36\x00\x00", // "8"
        "\x00\x06\x49\x49\x29\x1E\x00\x00", // "9"
        "\x00\x00\x36\x36\x00\x00\x00\x00", // ":"
        "\x00\x00\xAC\x6C\x00\x00\x00\x00", // ";"
        "\x00\x08\x14\x22\x41\x00\x00\x00", // "<"
        "\x00\x14\x14\x14\x14\x14\x00\x00", // "="
        "\x00\x41\x22\x14\x08\x00\x00\x00", // ">"
        "\x00\x02\x01\x51\x09\x06\x00\x00", // "?"
        "\x00\x32\x49\x79\x41\x3E\x00\x00", // "@"
        "\x00\x7E\x09\x09\x09\x7E\x00\x00", // "A"
        "\x00\x7F\x49\x49\x49\x36\x00\x00", // "B"
        "\x00\x3E\x41\x41\x41\x22\x00\x00", // "C"
        "\x00\x7F\x41\x41\x22\x1C\x00\x00", // "D"
        "\x00\x7F\x49\x49\x49\x41\x00\x00", // "E"
        "\x00\x7F\x09\x09\x09\x01\x00\x00", // "F"
        "\x00\x3E\x41\x41\x51\x72\x00\x00", // "G"
        "\x00\x7F\x08\x08\x08\x7F\x00\x00", // "H"
        "\x00\x41\x7F\x41\x00\x00\x00\x00", // "I"
        "\x00\x20\x40\x41\x3F\x01\x00\x00", // "J"
        "\x00\x7F\x08\x14\x22\x41\x00\x00", // "K"
        "\x00\x7F\x40\x40\x40\x40\x00\x00", // "L"
        "\x00\x7F\x02\x0C\x02\x7F\x00\x00", // "M"
        "\x00\x7F\x04\x08\x10\x7F\x00\x00", // "N"
        "\x00\x3E\x41\x41\x41\x3E\x00\x00", // "O"
        "\x00\x7F\x09\x09\x09\x06\x00\x00", // "P"
        "\x00\x3E\x41\x51\x21\x5E\x00\x00", // "Q"
        "\x00\x7F\x09\x19\x29\x46\x00\x00", // "R"
        "\x00\x26\x49\x49\x49\x32\x00\x00", // "S"
        "\x00\x01\x01\x7F\x01\x01\x00\x00", // "T"
        "\x00\x3F\x40\x40\x40\x3F\x00\x00", // "U"
        "\x00\x1F\x20\x40\x20\x1F\x00\x00", // "V"
        "\x00\x3F\x40\x38\x40\x3F\x00\x00", // "W"
        "\x00\x63\x14\x08\x14\x63\x00\x00", // "X"
        "\x00\x03\x04\x78\x04\x03\x00\x00", // "Y"
        "\x00\x61\x51\x49\x45\x43\x00\x00", // "Z"
        "\x00\x7F\x41\x41\x00\x00\x00\x00", // """
        "\x00\x02\x04\x08\x10\x20\x00\x00", // "\"
        "\x00\x41\x41\x7F\x00\x00\x00\x00", // """
        "\x00\x04\x02\x01\x02\x04\x00\x00", // "^"
        "\x00\x80\x80\x80\x80\x80\x00\x00", // "_"
        "\x00\x01\x02\x04\x00\x00\x00\x00", // "`"
        "\x00\x20\x54\x54\x54\x78\x00\x00", // "a"
        "\x00\x7F\x48\x44\x44\x38\x00\x00", // "b"
        "\x00\x38\x44\x44\x28\x00\x00\x00", // "c"
        "\x00\x38\x44\x44\x48\x7F\x00\x00", // "d"
        "\x00\x38\x54\x54\x54\x18\x00\x00", // "e"
        "\x00\x08\x7E\x09\x02\x00\x00\x00", // "f"
        "\x00\x18\xA4\xA4\xA4\x7C\x00\x00", // "g"
        "\x00\x7F\x08\x04\x04\x78\x00\x00", // "h"
        "\x00\x00\x7D\x00\x00\x00\x00\x00", // "i"
        "\x00\x80\x84\x7D\x00\x00\x00\x00", // "j"
        "\x00\x7F\x10\x28\x44\x00\x00\x00", // "k"
        "\x00\x41\x7F\x40\x00\x00\x00\x00", // "l"
        "\x00\x7C\x04\x18\x04\x78\x00\x00", // "m"
        "\x00\x7C\x08\x04\x7C\x00\x00\x00", // "n"
        "\x00\x38\x44\x44\x38\x00\x00\x00", // "o"
        "\x00\xFC\x24\x24\x18\x00\x00\x00", // "p"
        "\x00\x18\x24\x24\xFC\x00\x00\x00", // "q"
        "\x00\x00\x7C\x08\x04\x00\x00\x00", // "r"
        "\x00\x48\x54\x54\x24\x00\x00\x00", // "s"
        "\x00\x04\x7F\x44\x00\x00\x00\x00", // "t"
        "\x00\x3C\x40\x40\x7C\x00\x00\x00", // "u"
        "\x00\x1C\x20\x40\x20\x1C\x00\x00", // "v"
        "\x00\x3C\x40\x30\x40\x3C\x00\x00", // "w"
        "\x00\x44\x28\x10\x28\x44\x00\x00", // "x"
        "\x00\x1C\xA0\xA0\x7C\x00\x00\x00", // "y"
        "\x00\x44\x64\x54\x4C\x44\x00\x00", // "z"
        "\x00\x08\x36\x41\x00\x00\x00\x00", // "{"
        "\x00\x00\x7F\x00\x00\x00\x00\x00", // "|"
        "\x00\x41\x36\x08\x00\x00\x00\x00", // "}"
        "\x00\x02\x01\x01\x02\x01\x00\x00"  // "~"
    ];

    let _screen = pins.createBuffer(1025);
    let _buf2 = pins.createBuffer(2);
    let _buf3 = pins.createBuffer(3);
    let _buf4 = pins.createBuffer(4);
    let fontsize = 0;

    function cmd(c: number) {
        pins.i2cWriteNumber(0x3c, c, NumberFormat.UInt16BE);
    }

    function cmd1(d: number) {
        let n = d % 256;
        pins.i2cWriteNumber(60, n, NumberFormat.UInt16BE);
    }

    function cmd2(d1: number, d2: number) {
        _buf3[0] = 0;
        _buf3[1] = d1;
        _buf3[2] = d2;
        pins.i2cWriteBuffer(60, _buf3);
    }

    function cmd3(d1: number, d2: number, d3: number) {
        _buf4[0] = 0;
        _buf4[1] = d1;
        _buf4[2] = d2;
        _buf4[3] = d3;
        pins.i2cWriteBuffer(60, _buf4);
    }

    function writeData(n: number) {
        let b = n;
        if (n < 0) { n = 0 }
        if (n > 255) { n = 255 }

        pins.i2cWriteNumber(0x3c, 0x4000 + b, NumberFormat.UInt16BE);
    }

    function writeCustomChar(c: string) {
        for (let i = 0; i < 8; i++) {
            writeData(c.charCodeAt(i));
        }
    }

    function putChar(c: string) {
        let c1 = c.charCodeAt(0);
        if (c1 < 32 || c1 > 127) //Ignore non-printable ASCII characters. This can be modified for multilingual font.
        {
            writeCustomChar("\x00\xFF\x81\x81\x81\xFF\x00\x00");
        } else {
            writeCustomChar(basicFont[c1 - 32]);
        }
    }

    function set_pos(col: number = 0, page: number = 0) {
        cmd1(0xb0 | page) // page number
        let c = col * (fontsize + 1)
        cmd1(0x00 | (c % 16)) // lower start column address
        cmd1(0x10 | (c >> 4)) // upper start column address
    }

    function draw() {
        set_pos()
        pins.i2cWriteBuffer(60, _screen)
    }

    // clear bit
    function clrbit(d: number, b: number): number {
        if (d & (1 << b))
            d -= (1 << b)
        return d
    }

    //% weight=78
    //% blockId="OLED_init" block="OLED init"
    export function oled_init() {
        cmd1(0xAE)         // SSD1306_DISPLAYOFF
        cmd1(0xA4)         // SSD1306_DISPLAYALLON_RESUME
        cmd2(0xD5, 0xF0)   // SSD1306_SETDISPLAYCLOCKDIV
        cmd2(0xA8, 0x3F)   // SSD1306_SETMULTIPLEX
        cmd2(0xD3, 0x00)   // SSD1306_SETDISPLAYOFFSET
        cmd1(0 | 0x0)      // line #SSD1306_SETSTARTLINE
        cmd2(0x8D, 0x14)   // SSD1306_CHARGEPUMP
        cmd2(0x20, 0x00)   // SSD1306_MEMORYMODE
        cmd3(0x21, 0, 127) // SSD1306_COLUMNADDR
        cmd3(0x22, 0, 63)  // SSD1306_PAGEADDR
        cmd1(0xa0 | 0x1)   // SSD1306_SEGREMAP
        cmd1(0xc8)         // SSD1306_COMSCANDEC
        cmd2(0xDA, 0x12)   // SSD1306_SETCOMPINS
        cmd2(0x81, 0xCF)   // SSD1306_SETCONTRAST
        cmd2(0xd9, 0xF1)   // SSD1306_SETPRECHARGE
        cmd2(0xDB, 0x40)   // SSD1306_SETVCOMDETECT
        cmd1(0xA6)         // SSD1306_NORMALDISPLAY
        cmd2(0xD6, 1)      // zoom on
        cmd1(0xAF)         // SSD1306_DISPLAYON
        oled_clear()
        fontsize = 0
        oled_font_size(fontsize)
    }

    //% weight=77
    //% blockId="OLED_show_string" block="OLED show string at text: %s |x: %x |y: %y"
    export function oled_showString(s: string, x: number, y: number) {
        x = Math.constrain(x, 0, 127);
        y = Math.constrain(y, 0, 63);
        let r = y;
        let c = x;
        if (y < 0) { r = 0 }
        if (x < 0) { c = 0 }
        if (y > 7) { r = 7 }
        if (x > 15) { c = 15 }

        cmd(0xB0 + r);            //set page address
        cmd(0x00 + (8 * c & 0x0F));  //set column lower address
        cmd(0x10 + ((8 * c >> 4) & 0x0F));   //set column higher address

        for (let c of s) {
            putChar(c);
        }
    }

    //% weight=76
    //% blockId="OLED_show_number" block="OLED show a Number at number: %num |x: %x |y: %y"
    export function oled_showNumber(num: number, x: number, y: number) {
        oled_showString(num.toString(), x, y)
    }

    //% weight=75
    //% blockId="OLED_pixel" block="OLED set pixel at x %x|y %y"
    export function oled_pixel(x: number, y: number, color: number = 1) {
        x = Math.constrain(x, 0, 127);
        y = Math.constrain(y, 0, 63);
        oled_font_size(0)
        let page = y >> 3
        let shift_page = y % 8
        let ind = x + page * 128 + 1
        let b = (color) ? (_screen[ind] | (1 << shift_page)) : clrbit(_screen[ind], shift_page)
        _screen[ind] = b
        set_pos(x, page)

        serial.writeLine("" + b)
        _buf2[0] = 0x40
        _buf2[1] = b
        pins.i2cWriteBuffer(60, _buf2)
    }


    /*
    function example_fast_pixel(x: number, y: number, color: number = 1) {
        oled_font_size(0)

        let list = [];

        for (let i = 0; i < 5; i++) {
            list.push(create_pixel_data(i, i, 1))
        }

        let _buf10 = pins.createBuffer(2);
        for (let i = 0; i < list.length; i++) {
            set_pos(list[i][2], list[i][3])
            _buf10[0] = list[i][0]
            _buf10[1] = list[i][1]
            pins.i2cWriteBuffer(60, _buf10)
        }
    }

    function create_pixel_data(x: number, y: number, color: number = 1): number[] {
        let page = y >> 3
        let shift_page = y % 8
        let ind = x + page * 128 + 1
        let b = (color) ? (_screen[ind] | (1 << shift_page)) : clrbit(_screen[ind], shift_page)
        _screen[ind] = b
        set_pos(x, page)

        let value = [0x40, b, x, page]
        return value
    }
    */

    //% weight=74
    //% blockId="OLED_draw_line" block="OLED draw a line at|x1 %x1|y1 %y1|x2 %x2|y2 %y2"
    export function oled_line(x1: number, y1: number, x2: number, y2: number, color: number = 1) {
        x1 = Math.constrain(x1, 0, 127);
        y1 = Math.constrain(y1, 0, 63);
        x2 = Math.constrain(x2, 0, 127);
        y2 = Math.constrain(y2, 0, 63);

        oled_font_size(0)

        if (x1 == x2) {
            vline(x1, Math.min(y1, y2), Math.abs(y2 - y1))
        }
        else if (y1 == y2) {
            hline(Math.min(x1, x2), y1, Math.abs(x2 - x1))
        }
        else {
            let list = [];

            let slope_ = (y2 - y1) / (x2 - x1)
            let dx
            let dy

            if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
                if (x1 > x2) {
                    for (dx = x1; dx >= x2; dx--) {
                        dy = Math.round(slope_ * (dx - x1) + y1)
                        oled_pixel(dx, dy, color)
                    }
                }
                else {
                    for (dx = x1; dx <= x2; dx++) {
                        dy = Math.round(slope_ * (dx - x1) + y1)
                        oled_pixel(dx, dy, color)
                    }
                }
            }
            else {
                if (y1 > y2) {
                    for (dy = y1; dy >= y2; dy--) {
                        dx = Math.round((dy - y1) / slope_ + x1)
                        oled_pixel(dx, dy, color)
                    }
                }
                else {
                    for (dy = y1; dy <= y2; dy++) {
                        dx = Math.round((dy - y1) / slope_ + x1)
                        oled_pixel(dx, dy, color)
                    }
                }
            }
        }
    }

    function hline(x: number, y: number, len: number, color: number = 1) {
        for (let i = x; i < (x + len); i++)
            oled_pixel(i, y, color)
    }

    function vline(x: number, y: number, len: number, color: number = 1) {
        for (let i = y; i < (y + len); i++)
            oled_pixel(x, i, color)
    }

    //% weight=73
    //% blockId="OLED_rect" block="OLED draw a rectangle at|x %x|y %y|w %w|h %h"
    export function oled_rect(x: number, y: number, w: number, h: number, color: number = 1) {
        oled_font_size(0)
        let list = [];

        let x1 = x
        let y1 = y
        let x2 = x + w - 1
        let y2 = y + h - 1

        x1 = Math.constrain(x1, 0, 127);
        y1 = Math.constrain(y1, 0, 63);
        x2 = Math.constrain(x2, 0, 127);
        y2 = Math.constrain(y2, 0, 63);

        /*
        for (let i = x1; i < (x1 + (x2 - x1 + 1)); i++) {
            list.push(create_pixel_data(i, y1, color))
        }

        for (let i = x1; i < (x1 + (x2 - x1 + 1)); i++) {
            list.push(create_pixel_data(i, y2, color))
        }

        for (let i = y1; i < (y1 + (y2 - y1 + 1)); i++) {
            list.push(create_pixel_data(x1, i, color))
        }

        for (let i = y1; i < (y1 + (y2 - y1 + 1)); i++) {
            list.push(create_pixel_data(x2, i, color))
        }

        let _buf10 = pins.createBuffer(2);
        for (let i = 0; i < list.length; i++) {
            set_pos(list[i][2], list[i][3])
            _buf10[0] = list[i][0]
            _buf10[1] = list[i][1]
            pins.i2cWriteBuffer(60, _buf10)
        }
        */
        hline(x1, y1, x2 - x1 + 1, color)
        hline(x1, y2, x2 - x1 + 1, color)
        vline(x1, y1, y2 - y1 + 1, color)
        vline(x2, y1, y2 - y1 + 1, color)
    }

    //% weight=72
    //% deg.min=0 deg.max=360
    //% blockId="OLED_circle" block="OLED draw a circle at|x %x|y %y|r %r|deg %deg"
    export function oled_circle(x: number, y: number, r: number, deg: number, color: number = 1) {
        x = Math.constrain(x, 0, 127);
        y = Math.constrain(y, 0, 63);
        deg = Math.constrain(deg, 0, 360);

        oled_font_size(0)
        let list = [];

        let x_
        let y_

        for (let index = 0; index <= deg; index++) {
            x_ = x + Math.round(r * Math.cos(index / 57.7))
            y_ = y + Math.round(r * Math.sin(index / 57.7))
            oled_pixel(x_, y_, color)
            //list.push(create_pixel_data(x_, y_, color))
        }
        /*
        serial.writeLine("" + list.length)
        let _buf10 = pins.createBuffer(2);
        for (let i = 0; i < list.length; i++) {
            set_pos(list[i][2], list[i][3])
            _buf10[0] = list[i][0]
            _buf10[1] = list[i][1]
            pins.i2cWriteBuffer(60, _buf10)
        }
        */

    }

    export enum OLED_Size {
        //% block="Big"
        size1 = 1,
        //% block="Small"
        size2 = 0
    }

    //% weight=71
    //% blockId="OLED_font_size" block="OLED font size %oled_size"
    export function oled_font_size(oled_size: OLED_Size) {
        fontsize = (oled_size) ? 1 : 0
        cmd2(0xd6, fontsize)
    }

    //% weight=70
    //% blockId="OLED_clera" block="OLED clear"
    export function oled_clear() {
        _screen.fill(0)
        _screen[0] = 0x40
        draw()
    }

    /*
    ===EZ Start Kit : Photoresistor===
    */
    //% weight=60
    //% blockId="Photoresistor" block="Photoresistor"
    export function photoresistor(): number {
        return pins.analogReadPin(AnalogPin.P1)
    }

    /*
    ===EZ Start Kit : Variable_Resistor===
    */
    //% weight=50
    //% blockId="Variable_Resistor" block="Variable Resistor"
    export function variable_resistor(): number {
        let reverl = Math.map(pins.analogReadPin(AnalogPin.P2), 1, 1023, 1023, 0)
        return Math.round(reverl)
    }

    /*
    ===EZ Start Kit : Relay===
    */
    export enum ON_OFF {
        //% block="ON"
        switch1 = 1,
        //% block="OFF"
        switch2 = 2
    }

    //% weight=40
    //% blockId=Relay_control block="Relay %ON_OFF"
    export function relay_control(sw: ON_OFF = 1): void {
        if (sw == 1) {
            pins.digitalWritePin(DigitalPin.P9, 1);
        }
        else {
            pins.digitalWritePin(DigitalPin.P9, 0);
        }
    }

    /*
    ===EZ Start Kit : RGB LED===
    */
    let _brightness = 25
    let neopixel_buf = pins.createBuffer(16 * 3);
    for (let i = 0; i < 16 * 3; i++) {
        neopixel_buf[i] = 0
    }
    for (let i = 0; i < 3; i++) {
        rgb_led_clear();
    }

    //% weight=34
    //% rgb.shadow="colorNumberPicker"
    //% blockId="RGB_LED_show_all" block="All RGB LED show color|%rgb"
    export function rgb_led_show_all(rgb: number): void {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        for (let i = 0; i < 3; i++) {
            neopixel_buf[i * 3 + 0] = Math.round(g)
            neopixel_buf[i * 3 + 1] = Math.round(r)
            neopixel_buf[i * 3 + 2] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P12)
    }

    //% weight=33
    //% index.min=0 index.max=2
    //% rgb.shadow="colorNumberPicker"
    //% blockId="RGB_LED_show" block="RGB LED number|%index show color|%rgb"
    export function rgb_led_show(index: number, rgb: number): void {
        if (index < 0) {
            index = 0;
        }
        if (index > 2) {
            index = 2;
        }
        let f = index;
        let t = index;
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);

        if (index > 15) {
            if (((index >> 8) & 0xFF) == 0x02) {
                f = index >> 16;
                t = index & 0xff;
            } else {
                f = 0;
                t = -1;
            }
        }
        for (let i = f; i <= t; i++) {
            neopixel_buf[i * 3 + 0] = Math.round(g)
            neopixel_buf[i * 3 + 1] = Math.round(r)
            neopixel_buf[i * 3 + 2] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P12)
    }

    //% weight=32
    //% brightness.min=0 brightness.max=255
    //% blockId="RGB_LED_set_brightness" block="RGB LED set brightness to |%brightness |(0~255)"
    export function rgb_led_set_setBrightness(brightness: number) {
        if (brightness < 0) {
            brightness = 0;
        }
        if (brightness > 255) {
            brightness = 255;
        }
        _brightness = brightness;
    }

    //% weight=31
    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% blockId="RGB_LED_set_RGB" block="Red|%r Green|%g Blue|%b"
    export function rgb_led_set_RGB(r: number, g: number, b: number): number {
        if (r < 0) {
            r = 0;
        }
        if (r > 255) {
            r = 255;
        }
        if (g < 0) {
            g = 0;
        }
        if (g > 255) {
            g = 255;
        }
        if (b < 0) {
            b = 0;
        }
        if (b > 255) {
            b = 255;
        }
        return (r << 16) + (g << 8) + (b);
    }

    //% weight=30
    //% blockId="RGB_LED_clear" block="RGB LED clear all"
    export function rgb_led_clear(): void {
        for (let i = 0; i < 16 * 3; i++) {
            neopixel_buf[i] = 0
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P12)
    }
}
