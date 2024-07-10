// pages/api/getSheetData.js

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

  const range = "Logs!A2:I13217";

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEETID,
    range,
  });

  return response.data.values || {};
}

async function insertData(auth, data) {
  const sheets = google.sheets({ version: "v4", auth });

  const range = "Logs!A2";
  const resource = {
    values: data,
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEETID,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource,
  });

  return { msg: "Data inserted successfully" };
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { data } = req.body;
      if (!data) {
        res.status(400).json({ error: "data are required" });
        return;
      }

      const auth = await authenticate();
      await insertData(auth, data);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "GET") {
    try {
      const auth = await authenticate();
      const data = await getSheetData(auth);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
