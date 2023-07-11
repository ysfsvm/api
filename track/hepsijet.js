//----------------------------------------------------------------------------
// Created By  : github/ysfsvm
// Created Date: 03.04.2023
// license = MIT
//----------------------------------------------------------------------------

const express = require("express");
const https = require("https");
const router = express.Router();

router.get("/", (req, res) => {res.send(`<pre>Usage: /track/hepsijet/{BARKOD}</pre>`);});

router.get("/:barcode", (req, res) => {
  const barcode = req.params.barcode;

  const apiUrl =
    "https://website-backend.hepsijet.com/server/tms/getDeliveryTracking?customerDeliveryNo=" +
    barcode;

  const options = {
    headers: {
      "User-Agent": "._.",
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
          return res.status(500).json({
            error: "Api boş yanıt verdi! Takip Numaranızı kontrol edin!",
          });
        }
        try {
          const parsedData = JSON.parse(data).data[0];
          const formattedData = {
            alici: parsedData.receiver,
            takip_kodu: parsedData.barcode,
            gonderen: parsedData.sender,
            son_konum: parsedData.currentLocation,
            son_islem: parsedData.lastTransaction,
            tahmini_teslim: parsedData.deliveryDatePromised,
            gonderen_sirket: parsedData.company.corporateName,
            teslim_alan: parsedData.deliveredPerson,
            gonderi_ozellikleri: parsedData.productName,
            takip_dongusu: parsedData.transactions.map((d) => ({
              merkez: d.location,
              islem: d.transaction,
              tarih: d.transactionDateTime,
              durum: d.deliveryStatus,
            })),
            kurye_foto: parsedData.userProfilePhotoURL,
            kurye_isim: parsedData.maskedUserFullName,
          };
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(formattedData, null, 2));
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
});

module.exports = router;
