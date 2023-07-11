//----------------------------------------------------------------------------
// Created By  : github/ysfsvm & Main Code:https://gitlab.com/a/PTT-API
// Created Date: 03.04.2023
// license = MIT
//----------------------------------------------------------------------------
//
// API dökümanlarına ve kullanımına https://gitlab.com/a/PTT-API'dan ulaşabilirsiniz.

const express = require("express");
const https = require("https");
const router = express.Router();

router.get("/", (req, res) => {res.send(`<pre>Usage: /track/ptt/{BARKOD}</pre>`);});

router.get("/:barcode", (req, res) => {
  const barcode = req.params.barcode;

  const apiUrl =
    "https://pttws.ptt.gov.tr/cepptt/mssnvrPttaceaemaa/gonderitakipvepostakod/gonderisorguYurticiveYurtDisi?barkod=" +
    barcode +
    "&kaynak=ANDORID&tokenIdBildirim=";

  const options = {
    headers: {
      "User-Agent": "ek.ptt",
    },
  };

  https
    .get(apiUrl, options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          if (!parsedData) {
            throw new Error("Api boş çıktı gönderdi!");
          }
          if (parsedData.sonucAciklama == "Sistem hatası.") {
            throw new Error("Ptt api geçersiz yanıt gönderdi! Tekrar dene.");
          }
          if (!parsedData.GONDEREN) {
            // eğer "gonderen" boşsa
            throw new Error("Kargo bulunamadı!"); // hata gönder
          }

          const formattedData = {
            alici: parsedData.ALICI,
            takip_kodu: parsedData.BARNO,
            gonderen: parsedData.GONDEREN,
            gonderi_ucreti: parsedData.GONUCR,
            gonderi_agirligi: parsedData.GR,
            gonderi_merkezi: parsedData.IMERK,
            teslim_alan: parsedData.TESALAN,
            gonderi_ozellikleri: parsedData.VMERK,
            takip_dongusu: parsedData.dongu.map((d) => ({
              merkez: d.IMERK,
              saat: d.ISAAT,
              islem: d.ISLEM,
              tarih: d.ITARIH,
              sira_no: d.siraNo,
            })),
            sonuc_aciklama: parsedData.sonucAciklama,
            sonuc_kodu: parsedData.sonucKodu,
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
