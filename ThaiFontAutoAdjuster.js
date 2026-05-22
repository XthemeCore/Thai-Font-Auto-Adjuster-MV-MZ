//=============================================================================
// Thai Font Automatic Adjuster
//=============================================================================
/*:
 * @target MV
 * @target MZ
 * @plugindesc ปรับตัวอักษรภาษาไทยไปตามยถากรรม
 * @license: MIT License
 *  
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
 * @default 4
 * 
 * @param enableLineHeight
 * @parent ======== Common ========
 * @text Enable Line Height
 * @desc เปิดใช้การแก้ไขความสูงบรรทัดของข้อความหรือไม่
 * @type boolean
 * @on Enabled
 * @off Disabled
 * @default false
 *
 * @param lineHeight
 * @parent ======== Common ========
 * @text Line Height
 * @desc ความสูงของบรรทัด
 * @type number
 * @default 36
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

    function XTC_pixelYOffset() {
        return parseInt(XTC.pixelYOffset || 4, 10);
    }

    function XTC_messageExtraTop() {
        var pixelYOffset = XTC_pixelYOffset();
        return Math.max(0, pixelYOffset + Math.ceil(pixelYOffset / 2) + 2);
    }

    const XTC_Bitmap_drawText = Bitmap.prototype.drawText;
    Bitmap.prototype.drawText = function (text, x, y, maxWidth, lineHeight, align) {
        const pixelYOffset = XTC_pixelYOffset();
        const adjustedLineHeight = lineHeight + pixelYOffset;
        const adjustedY = y - (pixelYOffset / 2);
        XTC_Bitmap_drawText.call(this, text, x, adjustedY, maxWidth, adjustedLineHeight, align);
    };

    Window_Command.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();

        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawTextEx(this.commandName(index), rect.x, rect.y, rect.width, align); // Support icon drawing in commands
    };

    if (typeof Imported !== "undefined" && Imported.YEP_CommonEventMenu) {
        Window_CommonEventMenu.prototype.drawItem = function(index) {
            var rect = this.itemRectForText(index);
            this.resetFontSettings();
            this.changePaintOpacity(this.isCommandEnabled(index));
            this.resetTextColor();
            this.drawTextEx(this.commandName(index), rect.x, rect.y);
        };
    }

    const XTC_Window_Base_processDrawIcon = Window_Base.prototype.processDrawIcon;
    Window_Base.prototype.processDrawIcon = function(iconIndex, textState) {
        var offsetY = Math.floor(XTC_pixelYOffset() / 2);
        if (this instanceof Window_Command) {
            offsetY = 0;
        }
        textState.y += offsetY;
        XTC_Window_Base_processDrawIcon.call(this, iconIndex, textState);
        textState.y -= offsetY;
    };

    Window_Message.prototype.newPage = function(textState) {
        const extraTop = XTC_messageExtraTop();
        this.contents.clear();
        this.resetFontSettings();
        this.clearFlags();
        this.loadMessageFace();
        textState.x = this.newLineX();
        textState.y = extraTop;
        textState.left = this.newLineX();
        textState.height = this.calcTextHeight(textState, false);
    };

    const XTC_Window_Message_windowHeight = Window_Message.prototype.windowHeight;
    Window_Message.prototype.windowHeight = function() {
        return XTC_Window_Message_windowHeight.call(this) + XTC_messageExtraTop();
    };

    if (typeof Window_NameBox !== "undefined") {
        const XTC_Window_NameBox_windowHeight = Window_NameBox.prototype.windowHeight;
        Window_NameBox.prototype.windowHeight = function() {
            return XTC_Window_NameBox_windowHeight.call(this) + Math.max(0, Math.ceil(XTC_pixelYOffset() / 2));
        };
    }

    const XTC_Window_Base_lineHeight = Window_Base.prototype.lineHeight;
    Window_Base.prototype.lineHeight = function() {
        if (String(XTC.enableLineHeight).toLowerCase() === "true") {
            return parseInt(XTC.lineHeight || 36, 10);
        }
        return XTC_Window_Base_lineHeight.call(this);
    };
})();
