import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const GUARINI_BASE = 'http://www.regione.piemonte.it/guaw';
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const axiosInstance = axios.create({
  baseURL: GUARINI_BASE,
  headers: { 'User-Agent': USER_AGENT },
  timeout: 10000
});

const cache = { enti: null, lastFetch: 0, ttl: 3600000 };

app.get('/api/enti', async (req, res) => {
  try {
    if (cache.enti && Date.now() - cache.lastFetch < cache.ttl) {
      return res.json(cache.enti);
    }
    const response = await axiosInstance.get('/ListAction.do');
    const $ = cheerio.load(response.data);
    const enti = [];
    $('select[name="enteKey"] option').each((i, el) => {
      const value = $(el).attr('value');
      const label = $(el).text().trim();
      if (value && label && value !== '') {
        enti.push({ enteKey: value, label });
      }
    });
    cache.enti = enti;
    cache.lastFetch = Date.now();
    res.json(enti);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/albero/:enteKey', async (req, res) => {
  try {
    const { enteKey } = req.params;
    const response = await axiosInstance.get('/ShowLsAlberoEntiAction.do', {
      params: { reload: true, operation: 'load', enteKey }
    });
    const $ = cheerio.load(response.data);
    const scriptContent = $('script').html() || '';
    const pattern = /dbAddAlbero\(true,\s*"([^"]+)",\s*"([^"]+)",\s*"",\s*"[^"]*",\s*(\d+),\s*"",\s*(\w+),\s*(\w+),\s*"(\d+)",\s*"(\d+)"\)/g;
    const albero = [];
    let match;
    while ((match = pattern.exec(scriptContent)) !== null) {
      albero.push({
        label: match[1],
        indent: parseInt(match[3]),
        padre: match[4] === 'true',
        keyEnte: match[6],
        keyProg: match[7]
      });
    }
    res.json({ enteKey, items: albero });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/isad/:enteKey/:progKey', async (req, res) => {
  try {
    const { enteKey, progKey } = req.params;
    const response = await axiosInstance.get('/ShowLsIsadAction.do', {
      params: { keyEnte: enteKey, keyProg: progKey }
    });
    const $ = cheerio.load(response.data);
    const isad = {};
    $('table.tabnormale tr').each((i, el) => {
      const th = $(el).find('th').text().trim();
      const td = $(el).find('td').text().trim();
      if (th && td) isad[th.toLowerCase().replace(/\s+/g, '_')] = td;
    });
    res.json({ enteKey, progKey, data: isad });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend statico
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Backend on http://localhost:${PORT}`);
});
