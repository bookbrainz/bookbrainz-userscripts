// ==UserScript==
// @name        BookBrainz: Import from Amazon
// @include     *://www.amazon.*/*
// @version     0.0.1
// @author      tr1ten
// @description Import releases from Amazon
// @run-at      document-end
// ==/UserScript==
"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function GM_addStyle(cssRules, id) {
  var style = document.getElementById(id) || function () {
    var style = document.createElement("style");
    style.type = "text/css";
    style.id = id;
    document.head.appendChild(style);
    return style;
  }();

  var sheet = style.sheet;

  var _iterator = _createForOfIteratorHelper(cssRules),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var rule = _step.value;
      sheet.insertRule(rule, (sheet.rules || sheet.cssRules || []).length);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
} // injecting css


var cssRules = ["\n  .bb-btn{  \n    width: 100%;\n    height: 24px;\n    border: 1px solid #ddd;\n    border-radius: 3px;\n    background: linear-gradient(to bottom, #f7f8fa, #e7e9ec);\n    margin: 10px 0px;\n\n  }\n", "\n  .bb-btn:hover{\n    cursor:pointer;\n  }\n"];
GM_addStyle(cssRules, "bookbrainz");
var convertToBB = {
  cm: 10,
  g: 1,
  pounds: 453.6,
  ounces: 28.3,
  inches: 25.4
}; // #productTitle Name/Sort Name
// ul.a-spacing-none:nth-child(1) Language/Pages/Dimensions/Weight/Publisher(Date)/ISBNs

function scrapeAmz() {
  var _document$getElementB, _document$getElementB2, _res$weight, _res$publisher, _res$publisher$split$, _res$publisher$split$2, _date, _convertToBB$wtToBBKe, _convertToBB$lenghtTo, _convertToBB$lenghtTo2, _convertToBB$lenghtTo3;

  var name, sortName;
  name = sortName = (_document$getElementB = document.getElementById("productTitle")) === null || _document$getElementB === void 0 ? void 0 : (_document$getElementB2 = _document$getElementB.innerText.replace(/"/g, "'")) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.trim();
  var prodDetails = document.querySelector("ul.a-spacing-none:nth-child(1)");
  var subtitleEl = document.getElementById("productSubtitle");

  var _subtitleEl$innerText = subtitleEl.innerText.split(" – "),
      _subtitleEl$innerText2 = _toArray(_subtitleEl$innerText),
      format = _subtitleEl$innerText2[0],
      date = _subtitleEl$innerText2[1],
      res = _subtitleEl$innerText2.slice(2);

  var prodDetailsMap = {
    publisher: "Publisher",
    language: "Language",
    pages: format.trim(),
    isbn10: "ISBN-10",
    isbn13: "ISBN-13",
    asin: "ASIN",
    weight: "Item Weight",
    dimensions: "Dimensions"
  };
  var reverseProdDetailsMap = Object.fromEntries(Object.entries(prodDetailsMap).map(function (b) {
    return b.reverse();
  }));
  var key, value;
  res = {};

  for (var index = 0; index < Object.keys(prodDetails.children).length; index++) {
    var ls = prodDetails.children[index].innerText.split(":");
    key = ls[0].replace(/\u200f/g, "").replace(/\u200e/g, "").trim();
    value = ls[1].replace(/\u200f/g, "").replace(/\u200e/g, "").trim();

    if (reverseProdDetailsMap[key]) {
      res[reverseProdDetailsMap[key]] = value;
    }
  }

  var lenghtToBBKey;
  var height, width, depth;

  if (res.dimensions) {
    var _res$dimensions;

    var _res$dimensions$split = (_res$dimensions = res.dimensions) === null || _res$dimensions === void 0 ? void 0 : _res$dimensions.split("x");

    var _res$dimensions$split2 = _slicedToArray(_res$dimensions$split, 3);

    height = _res$dimensions$split2[0];
    width = _res$dimensions$split2[1];
    depth = _res$dimensions$split2[2];
    lenghtToBBKey = depth.match(/[A-Za-z]+/gi)[0];
  }

  var wtToBBKey = (_res$weight = res.weight) === null || _res$weight === void 0 ? void 0 : _res$weight.match(/[A-Za-z]+/gi)[0];
  var publisher;
  publisher = (_res$publisher = res.publisher) === null || _res$publisher === void 0 ? void 0 : (_res$publisher$split$ = _res$publisher.split(";")[0]) === null || _res$publisher$split$ === void 0 ? void 0 : (_res$publisher$split$2 = _res$publisher$split$.split("(")[0]) === null || _res$publisher$split$2 === void 0 ? void 0 : _res$publisher$split$2.trim();
  date = new Date((_date = date) === null || _date === void 0 ? void 0 : _date.replace(".", "")); // temporary fix for unsupported dates like `20 Oct. 2021`

  if (date instanceof Date && !isNaN(date)) {
    date = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(function (component) {
      return String(component).padStart(2, "0");
    }).join("-");
  } else {
    date = "";
  }

  delete res["dimensions"];
  return _objectSpread(_objectSpread({
    name: name,
    sortName: sortName
  }, res), {}, {
    weight: parseInt(res.weight) * ((_convertToBB$wtToBBKe = convertToBB[wtToBBKey]) !== null && _convertToBB$wtToBBKe !== void 0 ? _convertToBB$wtToBBKe : 1),
    height: parseFloat(height) * ((_convertToBB$lenghtTo = convertToBB[lenghtToBBKey]) !== null && _convertToBB$lenghtTo !== void 0 ? _convertToBB$lenghtTo : 1),
    width: parseFloat(width) * ((_convertToBB$lenghtTo2 = convertToBB[lenghtToBBKey]) !== null && _convertToBB$lenghtTo2 !== void 0 ? _convertToBB$lenghtTo2 : 1),
    depth: parseFloat(depth) * ((_convertToBB$lenghtTo3 = convertToBB[lenghtToBBKey]) !== null && _convertToBB$lenghtTo3 !== void 0 ? _convertToBB$lenghtTo3 : 1),
    date: date,
    publisher: publisher,
    format: format.includes('Kindle') ? 'eBook' : format
  });
}

window.onload = function () {
  console.log("running amazon import to bb script");

  if (!document.querySelector("#authorFollowHeading")) {
    return;
  }

  try {
    var _expectedOut, _itemDetails$isbn, _itemDetails$isbn2, _itemDetails$asin;

    // Setting up UI
    var submitUrl = "https://beta.bookbrainz.org/edition/create";
    var parentEl = document.getElementById("rightCol");
    var askButton = document.createElement("button");
    var divContainer = document.createElement("div");
    var amzPattern = RegExp("^(?:https?://)?(www[^/]+).*?(/[dg]p/[^/]+).*");
    var prodUrl = window.location.toLocaleString().replace(amzPattern, "$1$2");
    var submissionNote = "Imported from Amazon\nsource: ".concat(prodUrl, "\nscript: amazon-import\nversion: 0.0.1 \n    ");
    askButton.classList.add("bb-btn");
    askButton.innerText = "Import to BookBrainz";
    parentEl.insertBefore(askButton, parentEl.children[0]);
    var expectedOut = (_expectedOut = {
      name: "",
      sortName: "",
      publisher: "",
      language: "",
      pages: "",
      isbn10: "",
      isbn13: "",
      asin: "",
      weight: "",
      height: "",
      width: "",
      depth: "",
      date: ""
    }, _defineProperty(_expectedOut, "publisher", ""), _defineProperty(_expectedOut, "format", ""), _expectedOut);
    var itemDetails;

    try {
      itemDetails = scrapeAmz();
    } catch (err) {
      console.log("error whilte fetching, moving to default, ", err);
      itemDetails = expectedOut;
    }

    console.log("recieved scrape data ", itemDetails);
    var formHtml = "\n  <h3 class=\"bb-h3\">Edition Entity</h3>\n    <form target=\"_blank\" class=\"bb-form\" action=\"".concat(submitUrl, "\" method=\"POST\">\n    <input name=\"nameSection.name\" value=\"").concat(itemDetails.name, "\" id=\"bb-name\"/>\n    <input name=\"nameSection.sortName\" value=\"").concat(itemDetails.sortName, "\" id=\"bb-sname\"/>\n    <input name=\"nameSection.language\" value=\"").concat(itemDetails.language, "\" id=\"bb-language\"/>\n    <input name=\"identifierEditor.t9\" value=\"").concat((_itemDetails$isbn = itemDetails.isbn13) !== null && _itemDetails$isbn !== void 0 ? _itemDetails$isbn : "", "\" id=\"bb-isbn13\"/>\n    <input name=\"identifierEditor.t10\" value=\"").concat((_itemDetails$isbn2 = itemDetails.isbn10) !== null && _itemDetails$isbn2 !== void 0 ? _itemDetails$isbn2 : "", "\" id=\"bb-isbn10\"/>\n    <input name=\"identifierEditor.t5\" value=\"").concat((_itemDetails$asin = itemDetails.asin) !== null && _itemDetails$asin !== void 0 ? _itemDetails$asin : itemDetails.isbn10, "\" id=\"bb-asin\"/>\n    <input name=\"editionSection.publisher\"  value=\"").concat(itemDetails.publisher, "\" id=\"bb-pub\"/>\n    <input name=\"editionSection.releaseDate\" type=\"date\" value=").concat(itemDetails.date, " id=\"bb-date\">\n    <input name=\"editionSection.format\" value=\"").concat(itemDetails.format, "\" id=\"bb-format\"/>\n    <input name=\"editionSection.pages\" value=\"").concat(parseInt(itemDetails.pages), "\" id=\"bb-pgcount\" type=\"number\"/>\n    <input name=\"editionSection.width\" value=").concat(parseInt(itemDetails.width), " id=\"bb-width\" type=\"number\"/>\n    <input name=\"editionSection.height\" value=").concat(parseInt(itemDetails.height), " id=\"bb-height\" type=\"number\"/>\n    <input name=\"editionSection.depth\"  value=").concat(parseInt(itemDetails.depth), " id=\"bb-depth\" type=\"number\"/>\n    <input name=\"editionSection.weight\" value=").concat(parseInt(itemDetails.weight), " id=\"bb-depth\" type=\"number\"/>\n    <textarea name=\"submissionSection\" id=\"bb-format\">").concat(submissionNote, "</textarea>\n    <button type=\"submit\" id=\"bb-submit\" >Submit</button>\n    </form>\n    ");
    divContainer.style.display = "none";
    divContainer.innerHTML = formHtml;
    divContainer.className = "bb-container";
    parentEl.insertBefore(divContainer, parentEl.children[0]);

    askButton.onclick = function () {
      document.getElementById("bb-submit").click();
    };
  } catch (err) {
    console.log("error occured while running  script ", err);
  }

  console.log("script finished! ");
};