//=============================================================================
// Thai Font Automatic Adjuster
//=============================================================================
/*:
 * @target MV
 * @target MZ
 * @plugindesc ปรับตัวอักษรภาษาไทยไปตามยถากรรม
 * License: MIT License
 * =============================================================================
 * MIT License
 *
 * Copyright (c) 2020-Present XthemeCore
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * =============================================================================
 * @author XthemeCore
 * 
 * @param ======== Common ========
 * @default
 * 
 * @param pixelYOffset
 * @parent ======== Common ========
 * @text Font Bitmap Y Offset
 * @desc ระยะพิกเซลของตัวอักษรที่ต้องการขยายออกไป (เช่นภาษาไทยที่มีวรรณยุกต์เหนือสระ)
 * @type number
 * @default 6
 * 
 * @param enableLineHeight
 * @parent ======== Common ========
 * @text Enable Line Height
 * @desc เปิดใช้การแก้ไข Line Height หรือไม่
 * @type boolean
 * @on Enabled
 * @off Disabled
 * @default true
 *
 * @param lineHeight
 * @parent ======== Common ========
 * @text Line Height
 * @desc ความสูงของกล่องข้อความ
 * @type number
 * @default 42
 * 
 * @help ThaiFontAutoAdjuster.js
 *
 * ปลั๊กอินนี้จะปรับตัวอักษรภาษาไทยให้เป็นไปตามยถากรรม
 * การแสดงผลจะตรงกับที่แสดงในหน้าจอเริ่มเกมและเมนูต่างๆ 
 */
(() => { 'use strict';    
    var XTC = XTC || {};
    XTC = PluginManager.parameters('ThaiFontAutoAdjuster');

    Utils.containsThaiSpecialCharacters = function (character) {
        return /[ำิีึืัํ่้๊๋์ฺุู็ๅ]/.test(character);
    };

    const XTC_Window_Base_processCharacter = Window_Base.prototype.processCharacter;
    Window_Base.prototype.processCharacter = function (textState) {
        console.trace(textState);
        if(textState)
        {
            let index = textState.index;
            if (Utils.containsThaiSpecialCharacters(textState.text[index + 1]))
            {            
                let buffer = textState.text[index] + textState.text[index + 1];
                textState.index += 2;
                if (Utils.containsThaiSpecialCharacters(textState.text[index + 2]))
                {
                    buffer += textState.text[index + 2]        
                    textState.index++;
                }
                let width = this.textWidth(buffer);
                this.contents.drawText(buffer, textState.x, textState.y, width * 2, textState.height);
                textState.x += width;
            } 
            else
            {
                XTC_Window_Base_processCharacter.call(this, textState);
            }
        }
    };

    const XTC_Bitmap_drawText = Bitmap.prototype.drawText;
    Bitmap.prototype.drawText = function (text, x, y, maxWidth, lineHeight, align) {
        y += parseInt(XTC.pixelYOffset || 6, 10);
        XTC_Bitmap_drawText.call(this, text, x, y, maxWidth, lineHeight, align);
    };

    const XTC_Window_Base_lineHeight = Window_Base.prototype.lineHeight;
    Window_Base.prototype.lineHeight = function() {
        if (XTC.enableLineHeight)
        {
            return parseInt(XTC.lineHeight || 42, 10);
        }
        else
        {
            return XTC_Window_Base_lineHeight.call(this);
        }
    };

})();
