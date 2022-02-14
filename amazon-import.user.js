// ==UserScript==
// @name        BookBrainz: Import from Amazon
// @include     *://www.amazon.*/*
// @version     0.0.1
// @author      tr1ten
// @description Import releases from Amazon
// @run-at      document-end
// ==/UserScript==

"use strict";
function GM_addStyle(cssRules, id) {
  const style =
    document.getElementById(id) ||
    (function () {
      const style = document.createElement("style");
      style.type = "text/css";
      style.id = id;
      document.head.appendChild(style);
      return style;
    })();
  const sheet = style.sheet;
  for (const rule of cssRules) {
    sheet.insertRule(rule, (sheet.rules || sheet.cssRules || []).length);
  }
}
// injecting css
const cssRules = [
  `
  .bb-btn{  
    width: 100%;
    height: 24px;
    border: 1px solid #ddd;
    border-radius: 3px;
    background: linear-gradient(to bottom, #f7f8fa, #e7e9ec);
    margin: 10px 0px;

  }
`,
  `
  .bb-btn:hover{
    cursor:pointer;
  }
`,
];
GM_addStyle(cssRules, "bookbrainz");
const convertToBB = {
  cm: 10,
  g: 1,
  pounds: 453.6,
  ounces: 28.3,
  inches: 25.4,
};

// #productTitle Name/Sort Name
// ul.a-spacing-none:nth-child(1) Language/Pages/Dimensions/Weight/Publisher(Date)/ISBNs
function scrapeAmz() {
  let name, sortName;
  name = sortName = document
    .getElementById("productTitle")
    ?.innerText.replace(/"/g, "'")
    ?.trim();
  const prodDetails = document.querySelector("ul.a-spacing-none:nth-child(1)");
  const subtitleEl = document.getElementById("productSubtitle");
  let [format, date, ...res] = subtitleEl.innerText.split(" – ");
  const prodDetailsMap = {
    publisher: "Publisher",
    language: "Language",
    pages: format.trim(),
    isbn10: "ISBN-10",
    isbn13: "ISBN-13",
    asin: "ASIN",
    weight: "Item Weight",
    dimensions: "Dimensions",
  };
  const reverseProdDetailsMap = Object.fromEntries(
    Object.entries(prodDetailsMap).map((b) => b.reverse())
  );
  let key, value;
  res = {};
  for (
    let index = 0;
    index < Object.keys(prodDetails.children).length;
    index++
  ) {
    let ls = prodDetails.children[index].innerText.split(":");
    key = ls[0]
      .replace(/\u200f/g, "")
      .replace(/\u200e/g, "")
      .trim();
    value = ls[1]
      .replace(/\u200f/g, "")
      .replace(/\u200e/g, "")
      .trim();
    if (reverseProdDetailsMap[key]) {
      res[reverseProdDetailsMap[key]] = value;
    }
  }
  let [height, width, depth] = res.dimensions?.split("x");
  let lenghtToBBKey = depth.match(/[A-Za-z]+/gi)[0];
  let wtToBBKey = res.weight?.match(/[A-Za-z]+/gi)[0];
  let publisher;
  publisher = res.publisher?.split(";")[0]?.split("(")[0]?.trim();
  date = new Date(date.replace(".", "")); // temporary fix for unsupported dates like `20 Oct. 2021`
  if (date instanceof Date && !isNaN(date)) {
    date = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      .map((component) => String(component).padStart(2, "0"))
      .join("-");
  } else {
    date = "";
  }

  delete res["dimensions"];
  return {
    name,
    sortName,
    ...res,
    weight: parseInt(res.weight) * (convertToBB[wtToBBKey] ?? 1),
    height: parseFloat(height) * (convertToBB[lenghtToBBKey] ?? 1),
    width: parseFloat(width) * (convertToBB[lenghtToBBKey] ?? 1),
    depth: parseFloat(depth) * (convertToBB[lenghtToBBKey] ?? 1),
    date,
    publisher,
    format,
  };
}
window.onload = () => {
  console.log("running amazon import to bb script");
  if (!document.querySelector("#authorFollowHeading")) {
    return;
  }
  try {
    // Setting up UI
    const submitUrl = "https://test.bookbrainz.org/edition/create";
    const parentEl = document.getElementById("rightCol");
    const askButton = document.createElement("button");
    const divContainer = document.createElement("div");
    const amzPattern = RegExp("^(?:https?://)?(www[^/]+).*?(/[dg]p/[^/]+).*");
    const prodUrl = window.location.toLocaleString().replace(amzPattern,"$1$2")
    const submissionNote = `Imported from Amazon\nsource: ${
      prodUrl
    }\nscript: amazon-import\nversion: 0.0.1 
    `;
    askButton.classList.add("bb-btn");
    askButton.innerText = "Import to BookBrainz";
    parentEl.insertBefore(askButton, parentEl.children[0]);
    const expectedOut = {
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
      date: "",
      publisher: "",
      format: "",
    };

    let itemDetails;
    try {
      itemDetails = scrapeAmz();
    } catch (err) {
      console.log("error whilte fetching, moving to default, ", err);
      itemDetails = expectedOut;
    }
    console.log("recieved scrape data ", itemDetails);
    const formHtml = `
  <h3 class="bb-h3">Edition Entity</h3>
    <form target="_blank" class="bb-form" action="${submitUrl}" method="POST">
    <input name="nameSection.name" value="${itemDetails.name}" id="bb-name"/>
    <input name="nameSection.sortName" value="${
      itemDetails.sortName
    }" id="bb-sname"/>
    <input name="nameSection.language" value="${
      itemDetails.language
    }" id="bb-language"/>
    <input name="identifierEditor.t9" value="${
      itemDetails.isbn13 ?? ""
    }" id="bb-isbn13"/>
    <input name="identifierEditor.t10" value="${
      itemDetails.isbn10 ?? ""
    }" id="bb-isbn10"/>
    <input name="identifierEditor.t5" value="${
      itemDetails.asin ?? itemDetails.isbn10
    }" id="bb-asin"/>
    <input name="editionSection.publisher"  value="${
      itemDetails.publisher
    }" id="bb-pub"/>
    <input name="editionSection.releaseDate" type="date" value=${
      itemDetails.date
    } id="bb-date">
    <input name="editionSection.format" value="${
      itemDetails.format
    }" id="bb-format"/>
    <input name="editionSection.pages" value="${parseInt(
      itemDetails.pages
    )}" id="bb-pgcount" type="number"/>
    <input name="editionSection.width" value=${parseInt(
      itemDetails.width
    )} id="bb-width" type="number"/>
    <input name="editionSection.height" value=${parseInt(
      itemDetails.height
    )} id="bb-height" type="number"/>
    <input name="editionSection.depth"  value=${parseInt(
      itemDetails.depth
    )} id="bb-depth" type="number"/>
    <input name="editionSection.weight" value=${parseInt(
      itemDetails.weight
    )} id="bb-depth" type="number"/>
    <textarea name="submissionSection" id="bb-format">${submissionNote}</textarea>
    <button type="submit" id="bb-submit" >Submit</button>
    </form>
    `;
    divContainer.style.display = "none";
    divContainer.innerHTML = formHtml;
    divContainer.className = "bb-container";
    parentEl.insertBefore(divContainer, parentEl.children[0]);
    askButton.onclick = () => {
      document.getElementById("bb-submit").click();
    };
  } catch (err) {
    console.log("error occured while running  script ", err);
  }

  console.log("script finished! ");
};
