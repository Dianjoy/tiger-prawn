/**
 * Created by meathill on 14-4-29.
 */
'use strict';
(function (ns) {
  ns.decodeURLParam = function (str) {
    if (!str) {
      return {};
    }
    var params = str.split('&')
      , result = {};
    for (var i = 0, len = params.length; i < len; i++) {
      var arr = params[i].split('=');
      result[arr[0]] = decodeURIComponent(arr[1]);
    }
    return result;
  };
  ns.convertCurrency = function (currencyDigits) {
    var MAXIMUM_NUMBER = 99999999999.99;
    var CN_ZERO = "零";
    var CN_ONE = "壹";
    var CN_TWO = "贰";
    var CN_THREE = "叁";
    var CN_FOUR = "肆";
    var CN_FIVE = "伍";
    var CN_SIX = "陆";
    var CN_SEVEN = "柒";
    var CN_EIGHT = "捌";
    var CN_NINE = "玖";
    var CN_TEN = "拾";
    var CN_HUNDRED = "佰";
    var CN_THOUSAND = "仟";
    var CN_TEN_THOUSAND = "万";
    var CN_HUNDRED_MILLION = "亿";
    var CN_DOLLAR = "元";
    var CN_TEN_CENT = "角";
    var CN_CENT = "分";
    var CN_INTEGER = "整";

    var integral;
    var decimal;
    var outputCharacters;
    var parts;
    var digits, radices, bigRadices, decimals;
    var zeroCount;
    var i, p, d;
    var quotient, modulus;

    currencyDigits = currencyDigits.toString();
    if (currencyDigits == "") {
      alert("Empty input!");
      return "";
    }
    if (currencyDigits.match(/[^,.\d]/) != null) {
      alert("Invalid characters in the input string!");
      return "";
    }
    if ((currencyDigits).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
      alert("Illegal format of digit number!");
      return "";
    }

    currencyDigits = currencyDigits.replace(/,/g, "");
    currencyDigits = currencyDigits.replace(/^0+/, "");
    if (Number(currencyDigits) > MAXIMUM_NUMBER) {
      alert("Too large a number to convert!");
      return "";
    }

    parts = currencyDigits.split(".");
    if (parts.length > 1) {
      integral = parts[0];
      decimal = parts[1];

      decimal = decimal.substr(0, 2);
    } else {
      integral = parts[0];
      decimal = "";
    }

    digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
    radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
    bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
    decimals = new Array(CN_TEN_CENT, CN_CENT);

    outputCharacters = "";

    if (Number(integral) > 0) {
      zeroCount = 0;
      for (i = 0; i < integral.length; i++) {
        p = integral.length - i - 1;
        d = integral.substr(i, 1);
        quotient = p / 4;
        modulus = p % 4;
        if (d == "0") {
          zeroCount++;
        } else {
          if (zeroCount > 0)
          {
            outputCharacters += digits[0];
          }
          zeroCount = 0;
          outputCharacters += digits[Number(d)] + radices[modulus];
        }
        if (modulus == 0 && zeroCount < 4) {
          outputCharacters += bigRadices[quotient];
        }
      }
      outputCharacters += CN_DOLLAR;
    }

    if (decimal != "") {
      for (i = 0; i < decimal.length; i++) {
        d = decimal.substr(i, 1);
        if (d != "0") {
          outputCharacters += digits[Number(d)] + decimals[i];
        }
      }
    }

    if (outputCharacters == "") {
      outputCharacters = CN_ZERO + CN_DOLLAR;
    }
    if (decimal == "") {
      outputCharacters += CN_INTEGER;
    }
    outputCharacters = outputCharacters;
    return outputCharacters;
  }
}(Nervenet.createNameSpace('tp.utils')));