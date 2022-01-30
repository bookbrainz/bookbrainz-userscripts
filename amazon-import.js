// ==UserScript==
// @name        BookBrainz: Import from Amazon
// @include     *://www.amazon.*/*/dp/*
// @version     0.0.1
// @grant GM_addStyle
// @author      tr1ten
// @description Import releases from Amazon
// @run-at      document-end
// ==/UserScript==

"use strict";
function GM_addStyle(css, id) {
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
  sheet.insertRule(css, (sheet.rules || sheet.cssRules || []).length);
}
GM_addStyle(
  `
  .bb-btn{  
    padding:0.4em;
    margin:0.5em;
      color: white;
      background-color: #04aa6d;
      border:none;

  }
`,
  "bookbrainz"
);
GM_addStyle(
  `
  #bb-cancel{  
    background-color:red;

  }
`,
  "bookbrainz"
);
GM_addStyle(
  `
  .bb-btn:hover{
    cursor:pointer;
    background-color: #eb743b;
    color: white;
  }
`,
  "bookbrainz"
);
GM_addStyle(
  `
  .bb-finput{
    margin-bottom:0.4em
    }

`,
  "bookbrainz"
);
GM_addStyle(
  `
  .bb-form{
    display:flex;
     flex-direction:column;
      justify-content:center;
      width:min-content;
      padding:0.8em;
      font-family:'mono', sans-serif;
      
    }

`,
  "bookbrainz"
);

GM_addStyle(
  `
  .bb-flabel {
    margin-bottom:0.5em;
     margin-top:0.1em;
     font-size:1rem;
     font-weight:700;
   }

`,
  "bookbrainz"
);
GM_addStyle(
  `

  .bb-container{
    border:2px solid black;
      border-radius:10px;
      display:flex;
     flex-direction:column;
      justify-content:center;
      width:min-content;
      margin:1em;
    }
`,
  "bookbrainz"
);
GM_addStyle(
  `
  .bb-h3{
    padding:0.4em;
      background-color:#754e37;
      margin:0;
      border-radius:8px;
      text-align:center;
      color:white;
      
    }
`,
  "bookbrainz"
);

// #productTitle Name/Sort Name
// ul.a-spacing-none:nth-child(1) Language/Pages/Dimensions/Weight/Publisher(Date)/ISBNs
function scrapeAmz() {
  let name, sortName;
  name = sortName = document.getElementById("productTitle").innerText;
  const prodDetails = document.querySelector("ul.a-spacing-none:nth-child(1)");
  const prodDetailsMap = {
    publisher: "Publisher",
    language: "Language",
    pages: "Paperback",
    isbn10: "ISBN-10",
    isbn13: "ISBN-13",
    weight: "Item Weight",
    dimensions: "Dimensions",
  };
  let key, value;
  res = {};
  console.log("loop start!");
  for (let index = 0; index < Object.keys(prodDetailsMap).length; index++) {
    let ls = prodDetails.children[index].innerText.split(":");
    key = ls[0]
      .replace(/\u200f/g, "")
      .replace(/\u200e/g, "")
      .trim();
    value = ls[1]
      .replace(/\u200f/g, "")
      .replace(/\u200e/g, "")
      .trim();
    res[Object.keys(prodDetailsMap)[index]] = value;
  }
  let [height, width, depth] = res.dimensions.replace("cm", "").split("x");
  let publisher, date;
  publisher = res.publisher.split("(")[0].trim();
  date = new Date(res.publisher.split("(")[1].replace(")", ""));
  console.log("date and publisher ", date, publisher);
  date = date.toISOString().split("T")[0];

  delete res["dimensions"];
  return {
    name,
    sortName,
    ...res,
    height: height.trim(),
    width: width.trim(),
    depth: depth.trim(),
    date,
    publisher,
  };
}
window.onload = () => {
  console.log("running amazon import to bb script");
  if(!document.querySelector("#authorFollowHeading"))
  {
    return;
  }
  try {
    // Setting up UI
    const submitUrl="https://bookbrainz.org/edition/create";
    const parentEl = document.getElementById("rightCol");
    const askButton = document.createElement("button");
    const divContainer = document.createElement("div");
    askButton.classList.add("bb-btn");
    askButton.innerText = "Import to BookBrainz";
    parentEl.insertBefore(askButton, parentEl.children[0]);
    let itemDetails = scrapeAmz();
    console.log("recieved scrape data ", itemDetails);
    const formHtml = `
    <h2>Verify Form before submitting</h2>
<div class="bb-container">
<h3 class="bb-h3">Edition Entity</h3>
    <form class="bb-form" action=${submitUrl} method="POST">
    <label class="bb-flabel" for="bb-name">Name</label>
    <input class="bb-finput" name="nameSection.name" value="${
      itemDetails.name
    }" id="bb-name"/>
    <label class="bb-flabel" for="bb-sname">Sort Name</label>
    <input class="bb-finput" name="nameSection.sortName" value="${
      itemDetails.sortName
    }" id="bb-sname"/>
    <label class="bb-flabel" for="bb-language">Language</label>
    <input class="bb-finput" name="nameSection.language" value="${
      itemDetails.language
    }" id="bb-language"/>
    <label class="bb-flabel" for="bb-pub">Publisher</label>
    <input class="bb-finput"  value="${itemDetails.publisher}" id="bb-pub"/>
    <label class="bb-flabel" for="bb-date">Start date:</label>
    <input class="bb-finput" name="editionSection.releaseDate" type="date" value=${
      itemDetails.date
    } id="bb-date" name="" value="2018-07-22">
    <label class="bb-flabel" for="bb-format">Format</label>
    <input class="bb-finput" name="editionSection.format" value="Paperback" id="bb-format"/>
    <label class="bb-flabel" for="bb-pgcount">Page count</label>
    <input class="bb-finput" ame="editionSection.pages" value=${parseInt(
      itemDetails.pages
    )} id="bb-pgcount" type="number"/>
    <label class="bb-flabel" for="bb-width">Width</label>
    <input class="bb-finput" value=${parseFloat(
      itemDetails.width
    )} id="bb-width" type="number"/>
    <label class="bb-flabel" for="bb-height">Height</label>
    <input class="bb-finput" value=${parseFloat(
      itemDetails.height
    )} value=${parseFloat(itemDetails.height)} id="bb-height" type="number"/>
    <label class="bb-flabel" for="bb-depth">Depth</label>
    <input class="bb-finput" value=${parseFloat(
      itemDetails.depth
    )}  value=${parseFloat(itemDetails.depth)} id="bb-depth" type="number"/>
    <button class="bb-btn">Submit</button>
    <button class="bb-btn" id="bb-cancel">Cancel</button>
</div>
    </form>
    `;
    divContainer.innerHTML = formHtml;
    askButton.onclick = () => {
      console.log("btn clicked");
      parentEl.removeChild(askButton);
      parentEl.insertBefore(divContainer, parentEl.children[0]);
      document.getElementById("bb-cancel").onclick = () => {
        parentEl.removeChild(divContainer);
        parentEl.insertBefore(askButton, parentEl.children[0]);
      };
    };
  } catch (err) {
    console.log("error occured while running  script ", err);
  }

  console.log("script finished! ");
};