// App config
const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer"); // Use puppeteer-core
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
// Initialize Supabase client with your credentials

app.use(cors());

app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader(
          "Content-Type",
          path.endsWith(".mjs") ? "module/javascript" : "text/javascript"
        );
      }
    },
  })
);

app.use(
  express.static(__dirname, {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader(
          "Content-Type",
          path.endsWith(".mjs") ? "module/javascript" : "text/javascript"
        );
      }
    },
  })
);

app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

app.use(express.json()); // Parse JSON request body

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/convert", async (req, res) => {
  try {
    console.log("Convert request received");

    // Get the checkbox states from the request
    console.log(req.body);
    const { inputFieldValues } = req.body;
    console.log(inputFieldValues);

    // Launch Puppeteer
    // Configure Puppeteer to use the installed Chrome binary
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"], // Add this line
    });
    const page = await browser.newPage();

    // Load the locally hosted HTML file
    await page.goto(`file://${__dirname}/index.html`, {
      waitUntil: "networkidle2",
    });

    // Update input field values based on the request data
    for (const inputFieldId in inputFieldValues) {
      if (inputFieldValues.hasOwnProperty(inputFieldId)) {
        const inputValue = inputFieldValues[inputFieldId];
        await page.evaluate(
          (id, value) => {
            const inputField = document.getElementById(id);
            if (inputField) {
              inputField.value = value;
            }
          },
          inputFieldId,
          inputValue
        );
      }
    }

    // Capture a screenshot of the entire webpage
    const screenshot = await page.screenshot({
      type: "jpeg",
      quality: 100,
      fullPage: true,
    });

    // Construct the filename using the first name, last name, and ".jpg" extension
    const fileName =
      inputFieldValues.driverFirstName +
      inputFieldValues.driverLastName +
      ".jpg";

    console.log(fileName);

    // Define the path where you want to save the screenshot
    const screenshotPath = path.join(__dirname, "public", fileName);

    // Save the screenshot using the constructed filename
    fs.writeFileSync(screenshotPath, screenshot);
    // Upload the image to Supabase Storage using the function from your supa.js script

    console.log("Webpage converted to JPG");
    res.status(200).send("Webpage converted to JPG");

    // Close the browser
    await browser.close();
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Serve static files from a directory (e.g., 'public')
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
