const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const EventEmitter = require('events');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

const downloadEmitter = new EventEmitter();

// Helper function to download a file
const downloadFile = async (url, filePath) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.mkdirSync(path.dirname(filePath), { recursive: true }); // Create folders if they don't exist
    fs.writeFileSync(filePath, response.data);
    
    // Emit download status
    downloadEmitter.emit('download', {
      type: 'download',
      file: path.basename(filePath)
    });
    
    console.log(`Downloaded: ${url} -> ${filePath}`);
  } catch (error) {
    console.error(`Failed to download: ${url}`, error.message);
  }
};

// Helper function to resolve relative URLs to absolute URLs
const resolveUrl = (baseUrl, relativeUrl) => {
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch (error) {
    console.error(`Failed to resolve URL: ${relativeUrl}`, error.message);
    return null;
  }
};

// Function to extract font URLs from CSS content
const extractFontUrlsFromCss = (cssContent, baseUrl) => {
  const fontUrls = new Set();
  const fontFaceRegex = /@font-face\s*\{[^}]*src:\s*url\(['"]?(.*?)['"]?\)/g;
  let match;

  while ((match = fontFaceRegex.exec(cssContent)) !== null) {
    const fontUrl = match[1];
    if (fontUrl) {
      const absoluteUrl = resolveUrl(baseUrl, fontUrl);
      if (absoluteUrl) {
        fontUrls.add(absoluteUrl);
      }
    }
  }

  return Array.from(fontUrls);
};

// Function to download CSS files and extract fonts
const downloadCssAndFonts = async (url, dir, $) => {
  const cssUrls = new Set();

  // Find all CSS files in the HTML
  $('link[rel="stylesheet"]').each((i, element) => {
    const href = $(element).attr('href');
    if (href) {
      const absoluteUrl = resolveUrl(url, href);
      if (absoluteUrl) {
        cssUrls.add(absoluteUrl);
      }
    }
  });

  // Download each CSS file and extract fonts
  for (const cssUrl of cssUrls) {
    const cssFilePath = path.join(dir, new URL(cssUrl).pathname);
    await downloadFile(cssUrl, cssFilePath);

    // Read the CSS file to extract font URLs
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    const fontUrls = extractFontUrlsFromCss(cssContent, cssUrl);

    // Download all fonts
    for (const fontUrl of fontUrls) {
      const fontFilePath = path.join(dir, new URL(fontUrl).pathname);
      await downloadFile(fontUrl, fontFilePath);
    }
  }
};

// Function to recursively download all files
const downloadAllFiles = async (url, dir, $) => {
  const fileUrls = new Set();

  // Extract all file URLs from HTML
  const tags = {
    link: 'href',
    script: 'src',
    img: 'src',
    audio: 'src',
    video: 'src',
    source: 'src',
    embed: 'src',
    object: 'data',
    a: 'href',
  };

  Object.keys(tags).forEach((tag) => {
    $(tag).each((i, element) => {
      const attr = $(element).attr(tags[tag]);
      if (attr) {
        const absoluteUrl = resolveUrl(url, attr);
        if (absoluteUrl) {
          fileUrls.add(absoluteUrl);
        }
      }
    });
  });

  // Download all files
  const downloadPromises = Array.from(fileUrls).map((fileUrl) => {
    const filePath = path.join(dir, new URL(fileUrl).pathname);
    return downloadFile(fileUrl, filePath);
  });

  // Wait for all downloads to complete
  await Promise.all(downloadPromises);
};

// Endpoint to clone a website
app.post('/clone', async (req, res) => {
  const { url, directory } = req.body;

  if (!url || !directory) {
    return res.status(400).json({ error: 'URL and directory are required' });
  }

  try {
    // Fetch the website HTML
    const { data: html } = await axios.get(url);

    // Parse HTML using Cheerio
    const $ = cheerio.load(html);

    // Create the specified directory
    const dir = path.join(directory, new URL(url).hostname);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save HTML file
    const htmlFilePath = path.join(dir, 'index.html');
    fs.writeFileSync(htmlFilePath, html);

    // Download CSS files and extract fonts
    await downloadCssAndFonts(url, dir, $);

    // Download all other files
    await downloadAllFiles(url, dir, $);

    res.json({ message: `Website cloned successfully to ${dir}!`, dir });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to clone website' });
  }
});

// Add SSE endpoint
app.get('/clone-status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendStatus = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  downloadEmitter.on('download', sendStatus);

  req.on('close', () => {
    downloadEmitter.removeListener('download', sendStatus);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});