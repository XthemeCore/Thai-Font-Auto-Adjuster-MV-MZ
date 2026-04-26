//=============================================================================
// Thai Font Automatic Adjuster
//=============================================================================
/*:
 * @target MV
 * @target MZ
 * @plugindesc ปรับตัวอักษรภาษาไทยไปตามยถากรรม
 * License: MIT License
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
})();
