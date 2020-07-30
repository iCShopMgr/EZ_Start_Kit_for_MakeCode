//% weight=20 color=#B3203E icon="\uf118" block="EZ Start Kit"
namespace ezstartkit {
    /*
    ===EZ Start Kit : ButtonAB===
    */
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

    //% blockId=ButtonAB weight=90 block="Button %br push?"
    export function buttonAB(br: Button_read = 1): boolean {
        if (br == 1) {
            if (pins.digitalReadPin(DigitalPin.P5) == 0 && pins.digitalReadPin(DigitalPin.P11) == 1) {
                return true
            }
            else {
                return false
            }
        }
        else if (br == 2){
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

    //% blockId=DHT11 weight=80 block="DHT11 get %dh"
    export function dht11(dh: DHT_Data = 1): number {
        ReadData()
        basic.pause(100)
        if(dh == 1) {
            return DHT_Temp
        }
        else {
            return DHT_Humid
        }
    }

    /*
    ===EZ Start Kit : IR===
    */
    //% blockId=IR weight=72 block="Enable IR"
	export function enIR() :void{
		pins.onPulsed(DigitalPin.P8, PulseValue.Low, function () {
			readir.push(pins.pulseDuration())
		})
		pins.onPulsed(DigitalPin.P8, PulseValue.High, function () {
			readir.push(pins.pulseDuration())
		})

		pins.setEvents(DigitalPin.P8, PinEventType.Pulse)
		pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
	}

	let readir: number[] = []
	readir = []
	let Pnumber = 0
	let IRREAD: Action;
	let Reading = false
	control.inBackground(function () {
		while(true) {
			if (Reading == true) {
				if (readir[0] > 30000) {
					basic.pause(100)
					let count = 0
					let one_data = 0
					for (let i = 0; i < readir.length; i++) {
						if (readir[i] > 1000 && readir[i] < 2000) {
							count += 1
						}
						if (count == 8) {
							one_data = i + 2
							break
						}
					}

					Pnumber = 0
					for (let i = 0; i < 8; i++) {
						if (readir[one_data] > 1000) {
							Pnumber += (1 << (7 - i))
						}
						one_data += 2
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

	//% blockId=IR_read weight=71 block="IR Read"
	export function irRead(): number {
		return Pnumber
	}

	//% blockId=IR_remote weight=70 block="IR Remote(NEC)" blockInlineInputs=true
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

    //% blockId=LED_control weight=60 block="LED %choose set velue %brightness |(0~1023)"
    export function led_control(choose: LED_write = 1, brightness: number): void {
        if (choose == 1) {
            pins.analogWritePin(AnalogPin.P13, brightness)
        }
        else if (choose == 2){
            pins.analogWritePin(AnalogPin.P14, brightness)
        }
        else {
            pins.analogWritePin(AnalogPin.P15, brightness)
        }
    }

    /*
    ===EZ Start Kit : OLED===
    */
    let font: number[] = [];
    font[0] = 0x0022d422; font[1] = 0x0022d422; font[2] = 0x0022d422; font[3] = 0x0022d422;
    font[4] = 0x0022d422; font[5] = 0x0022d422; font[6] = 0x0022d422; font[7] = 0x0022d422;
    font[8] = 0x0022d422; font[9] = 0x0022d422; font[10] = 0x0022d422; font[11] = 0x0022d422;
    font[12] = 0x0022d422; font[13] = 0x0022d422; font[14] = 0x0022d422; font[15] = 0x0022d422;
    font[16] = 0x0022d422; font[17] = 0x0022d422; font[18] = 0x0022d422; font[19] = 0x0022d422;
    font[20] = 0x0022d422; font[21] = 0x0022d422; font[22] = 0x0022d422; font[23] = 0x0022d422;
    font[24] = 0x0022d422; font[25] = 0x0022d422; font[26] = 0x0022d422; font[27] = 0x0022d422;
    font[28] = 0x0022d422; font[29] = 0x0022d422; font[30] = 0x0022d422; font[31] = 0x0022d422;
    font[32] = 0x00000000; font[33] = 0x000002e0; font[34] = 0x00018060; font[35] = 0x00afabea;
    font[36] = 0x00aed6ea; font[37] = 0x01991133; font[38] = 0x010556aa; font[39] = 0x00000060;
    font[40] = 0x000045c0; font[41] = 0x00003a20; font[42] = 0x00051140; font[43] = 0x00023880;
    font[44] = 0x00002200; font[45] = 0x00021080; font[46] = 0x00000100; font[47] = 0x00111110;
    font[48] = 0x0007462e; font[49] = 0x00087e40; font[50] = 0x000956b9; font[51] = 0x0005d629;
    font[52] = 0x008fa54c; font[53] = 0x009ad6b7; font[54] = 0x008ada88; font[55] = 0x00119531;
    font[56] = 0x00aad6aa; font[57] = 0x0022b6a2; font[58] = 0x00000140; font[59] = 0x00002a00;
    font[60] = 0x0008a880; font[61] = 0x00052940; font[62] = 0x00022a20; font[63] = 0x0022d422;
    font[64] = 0x00e4d62e; font[65] = 0x000f14be; font[66] = 0x000556bf; font[67] = 0x0008c62e;
    font[68] = 0x0007463f; font[69] = 0x0008d6bf; font[70] = 0x000094bf; font[71] = 0x00cac62e;
    font[72] = 0x000f909f; font[73] = 0x000047f1; font[74] = 0x0017c629; font[75] = 0x0008a89f;
    font[76] = 0x0008421f; font[77] = 0x01f1105f; font[78] = 0x01f4105f; font[79] = 0x0007462e;
    font[80] = 0x000114bf; font[81] = 0x000b6526; font[82] = 0x010514bf; font[83] = 0x0004d6b2;
    font[84] = 0x0010fc21; font[85] = 0x0007c20f; font[86] = 0x00744107; font[87] = 0x01f4111f;
    font[88] = 0x000d909b; font[89] = 0x00117041; font[90] = 0x0008ceb9; font[91] = 0x0008c7e0;
    font[92] = 0x01041041; font[93] = 0x000fc620; font[94] = 0x00010440; font[95] = 0x01084210;
    font[96] = 0x00000820; font[97] = 0x010f4a4c; font[98] = 0x0004529f; font[99] = 0x00094a4c;
    font[100] = 0x000fd288; font[101] = 0x000956ae; font[102] = 0x000097c4; font[103] = 0x0007d6a2;
    font[104] = 0x000c109f; font[105] = 0x000003a0; font[106] = 0x0006c200; font[107] = 0x0008289f;
    font[108] = 0x000841e0; font[109] = 0x01e1105e; font[110] = 0x000e085e; font[111] = 0x00064a4c;
    font[112] = 0x0002295e; font[113] = 0x000f2944; font[114] = 0x0001085c; font[115] = 0x00012a90;
    font[116] = 0x010a51e0; font[117] = 0x010f420e; font[118] = 0x00644106; font[119] = 0x01e8221e;
    font[120] = 0x00093192; font[121] = 0x00222292; font[122] = 0x00095b52; font[123] = 0x0008fc80;
    font[124] = 0x000003e0; font[125] = 0x000013f1; font[126] = 0x00841080; font[127] = 0x0022d422;

    let _screen = pins.createBuffer(1025);
    let _buf2 = pins.createBuffer(2);
    let _buf3 = pins.createBuffer(3);
    let _buf4 = pins.createBuffer(4);
    let fontsize = 1;

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

    //% blockId="OLED_init" weight=54 block="OLED init"
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
        fontsize = 1
    }

    //% blockId="OLED_show_string" weight=53 block="OLED show string at x: %x |y: %y|text: %s"
    export function oled_showString(x: number, y: number, s: string) {
        let col = 0
        let p = 0
        let ind = 0
        for (let n = 0; n < s.length; n++) {
            p = font[s.charCodeAt(n)]
            for (let i = 0; i < 5; i++) {
                col = 0
                for (let j = 0; j < 5; j++) {
                    if (p & (1 << (5 * i + j)))
                        col |= (1 << (j + 1))
                }
                ind = (x + n) * 5 * (fontsize + 1) + y * 128 + i * (fontsize + 1) + 1
                _screen[ind] = col
                if (fontsize)_screen[ind + 1] = col
            }
        }
        set_pos(x * 5, y)
        let ind0 = x * 5 * (fontsize + 1) + y * 128
        let buf = _screen.slice(ind0, ind + 1)
        buf[0] = 0x40
        pins.i2cWriteBuffer(60, buf)
    }

    //% blockId="OLED_show_number" weight=52 block="OLED show a Number at x: %x |y: %y|number: %num"
    export function oled_showNumber(x: number, y: number, num: number) {
        oled_showString(x, y, num.toString())
    }

    export enum OLED_Size {
		//% block="Big"
		size1 = 1,
		//% block="Small"
		size2 = 0
	}

    //% blockId="OLED_font_size" weight=51 block="OLED font size %oled_size"
    export function oled_font_size(oled_size: OLED_Size) {
        fontsize = (oled_size) ? 1 : 0
        cmd2(0xd6, fontsize)
    }

    //% blockId="OLED_clera" weight=50 block="OLED clear"
    export function oled_clear() {
        _screen.fill(0)
        _screen[0] = 0x40
        draw()
    }

    /*
    ===EZ Start Kit : Photoresistor===
    */
    //% blockId="Photoresistor" weight=40 block="Photoresistor"
    export function photoresistor(): number {
        return pins.analogReadPin(AnalogPin.P1)
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

    //% blockId=Relay_control weight=30 block="Relay %ON_OFF"
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

    //% rgb.shadow="colorNumberPicker"
    //%  blockId="RGB_LED_show_all" weight=24 block="All RGB LED show color|%rgb"
    export function rgb_led_show_all(rgb: number): void{
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

    //% index.min=0 index.max=2
    //% rgb.shadow="colorNumberPicker"
    //%  blockId="RGB_LED_show" weight=23 block="RGB LED number|%index show color|%rgb"
    export function rgb_led_show(index: number, rgb: number): void{
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

    //% brightness.min=0 brightness.max=255
    //% blockId="RGB_LED_set_brightness" weight=22 block="RGB LED set brightness to |%brightness |(0~255)"
    export function rgb_led_set_setBrightness(brightness: number) {
        _brightness = brightness;
    }

    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% blockId="RGB_LED_set_RGB" weight=21 block="Red|%r Green|%g Blue|%b"
    export function rgb_led_set_RGB(r: number, g: number, b: number): number {
        return (r << 16) + (g << 8) + (b);
    }

    //% blockId="RGB_LED_clear" weight=20 block="RGB LED clear all"
    export function rgb_led_clera(): void {
        for (let i = 0; i < 16 * 3; i++) {
            neopixel_buf[i] = 0
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P12)
    }

    /*
    ===EZ Start Kit : Variable_Resistor===
    */
    //% blockId="Variable_Resistor" weight=10 block="Variable Resistor"
    export function variable_resistor(): number {
        return pins.analogReadPin(AnalogPin.P2)
    }
}
