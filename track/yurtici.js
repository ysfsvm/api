//----------------------------------------------------------------------------
// Created By  : github/ysfsvm
// Created Date: 02.04.2023
// license = MIT
//----------------------------------------------------------------------------

const express = require("express");
const https = require("https");
const router = express.Router();

router.get("/", (req, res) => {res.send(`<pre>Usage: /track/yurtici/{BARKOD}</pre>`);});

// Yurtiçi kargo öncelikle uygulamasında telefona token üretip
// ardından tokeni takip sorgulamasında auth olarak kullanıyor.
function theTokenGenerator3000() {
  // OMG tokenGenerator 3000!
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      hostname: "customerappapi.yurticikargo.com",
      path: "/KOPSRestServices/rest/customermobile/auth/session",
      headers: {
        "Yk-App-Token": "Android411",
        "Yk-Mobile-Device-Id": "(._.)", //thx yurtici
        "Yk-Mobile-Os": "Android",
        "Accept-Language": "tr",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData.sessionToken);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

router.get("/:barcode", async (req, res) => {
  try {
    const sessionToken = await theTokenGenerator3000();
    const barcode = req.params.barcode;
    const apiUrl = `https://customerappapi.yurticikargo.com/KOPSRestServices/rest/customermobile/shipments/tracking/${barcode}/detail`;

    const options = {
      headers: {
        "Yk-App-Token": "Android411",
        "Yk-Mobile-Device-Id": "._.", // hehe
        "Yk-Mobile-Os": "Android",
        "Accept-Language": "tr",
        Authorization: sessionToken, // theTokenGenerator3000()'den alıdığımız tokeni kullanabiliriz.
      },
    };

    https
      .get(apiUrl, options, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          if (data === "") {
            return res.status(500).json({ error: "Api boş yanıt verdi! Takip Numaranızı kontrol edin!" });
          }
          try {
            const parsedData = JSON.parse(data);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(parsedData, null, 2));
          } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
          }
        });
      })
      .on("error", (error) => {
        console.log("Error: " + error.message);
        res.status(500).json({ error: "API hatası!" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
