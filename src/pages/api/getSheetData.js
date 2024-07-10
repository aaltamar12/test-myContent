import { google } from "googleapis";
import path from "path";

const SPREADSHEETID = "1a7GsnowzcQm-7SJVdilZlJg_PZvizmo5UeeVAIcJB7I";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

async function authenticate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
  });
  const authClient = await auth.getClient();
  return authClient;
}

async function getSheetData(auth) {
  const sheets = google.sheets({ version: "v4", auth });

  const range = "A2:I13217";

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEETID,
    range,
  });

  return response.data.values;
}

async function updateStatus(auth, row, value, selectedRow) {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    const range = `H${row + 2}`;

    const resource = {
      values: [[value]],
    };

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEETID,
      range,
      valueInputOption: "RAW",
      resource,
    });
    const message = `Se actualizo la celda H${
      row + 2
    } idTable:${row}  lastValue: ${selectedRow[8]}, newValue: ${value}`;

    console.log({ message });

    await fetch("http://localhost:3000/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          values: [message],
        },
      }),
    });
  } catch (error) {
    console.error(error);
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const auth = await authenticate();
      const data = await getSheetData(auth);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "POST") {
    try {
      const { row, value, selectedRow } = req.body;
      if (!row && !value) {
        res.status(400).json({ error: "Row and value are required" });
        return;
      }

      const auth = await authenticate();
      await updateStatus(auth, row, value, selectedRow);
      res.status(200).json({ message: "Cell updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
