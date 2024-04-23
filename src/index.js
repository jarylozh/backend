// src/index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const puppeteer = require("puppeteer");

dotenv.config();

const app = express();
const port = process.env.PORT;

// connect to db
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     app.listen(port, () => {
//       console.log(`Connected to database, running on port ${port}`);
//     });
//   })
//   .catch((error) => {
//     console.error("Connecting to the database failed: ", error);
//   });

app.get("/", (req, res) => {
  res.send("Express + TypeScript Server");
});

scrape();

async function scrapeweapons(browser) {
  let urls = [];
  const MAX_VIEW = 1;
  for (let i = 0; i < MAX_VIEW; ++i) {
    const url = `https://mhrise.kiranico.com/data/weapons?view=${i}`;

    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    const data = await page.evaluate(() => {
      let links = [];
      const tds = Array.from(document.querySelectorAll("table tr td"));
      tds.forEach((td) => {
        let link = td.querySelector("a");
        if (link) links.push(link.href);
      });
      return links;
    });

    urls = [...urls, ...data];
    await page.close();
  }

  await scrapeweapons(browser, url);
}

async function scrapeweapon(browser, url) {
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  const data = await page.evaluate(() => {
    const Index_Enums = {
      Info: 0,
      Forging: 1,
      Upgrade: 2,
    };

    const Info_Enum = {
      Image: 0,
      Slot: 1,
      Attack: 2,
      Element: 3,
      Affinity: 4,
      Rampage_Skills: 6,
    };

    const tables = Array.from(document.querySelectorAll("table"));
    let data = [];
    for (let i = 0; i < tables.length; ++i) {
      let table = tables[i];
      if (i === Index_Enums.Info) {
        let cells = table.rows[0].cells;
        let v = [];
        for (let i = 0; i < cells.length; ++i) {
          v.push(cells[i].innerText);
        }
        data.push(v);
      }
    }

    return data;
  });

  console.log(data);
  console.log(data.length);

  await page.close();
}
async function scrape() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const url = "https://mhrise.kiranico.com/data/weapons/1608178838";
  await scrapeweapon(browser, url);

  await browser.close();
}
