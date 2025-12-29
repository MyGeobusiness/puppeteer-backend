import express from "express";
import puppeteer from "puppeteer";

const app = express();
app.use(express.json());

const cache = {};

app.post("/fetch", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send({ error: "Missing URL" });

  if (cache[url]) return res.send({ html: cache[url] });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    const content = await page.content();
    await browser.close();

    cache[url] = content;
    res.send({ html: content });
  } catch (err) {
    res.status(500).send({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
