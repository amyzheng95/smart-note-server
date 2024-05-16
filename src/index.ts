import express, { Express, Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app: Express = express();
app.use(cors());
app.use(express.json()); // need this to parse json correctly

const diaryFilePath = path.join(__dirname, "diaries.json");

app.get("/", (req: Request, res: Response) => {
  let diaries: Record<string, string> = {};
  try {
    // Read existing diaries from the file if it exists
    const existingData = fs.readFileSync(diaryFilePath, "utf8");

    if (existingData === "") {
      console.log("Diary file found but is empty");
      return res.status(404).json({ error: `Diary file found but is empty` });
    }

    diaries = JSON.parse(existingData);
  } catch (err) {
    console.log(`Diary not found with error ${err}`);
    return res.status(404).json({ error: `Diary not found with error ${err}` });
  }
  res.send(diaries);
});

type Diary = {
  content: string;
  color: string;
};

function sortDate(diaries: Record<string, Diary>) {
  const arr = Object.entries(diaries);

  arr.sort((a, b) => {
    return new Date(b[0]).getTime() - new Date(a[0]).getTime();
  });

  return Object.fromEntries(arr);
}

app.post("/diaries", (req: Request, res: Response) => {
  const { date, content, color } = req.body;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  let diaries: Record<string, Diary> = {};

  try {
    // Read existing diaries from the file if it exists
    const diariesObj = fs.readFileSync(diaryFilePath, "utf8");
    diaries = JSON.parse(diariesObj);
  } catch (err) {
    console.log("error: ", err);
    // If the file doesn't exist or is empty, start with an empty object
    fs.writeFileSync(diaryFilePath, "{}");
  }

  // Add the new diary entry
  if (diaries.hasOwnProperty(date)) {
    diaries[date].content = content;
    diaries[date].color = color;
  } else {
    diaries[date] = { content: content, color: color };
  }

  console.log("diaries: ", diaries);
  const sortedDiaries = sortDate(diaries);
  console.log("sortedDiaries: ", sortedDiaries);

  // Write the updated diaries back to the file
  fs.writeFileSync(diaryFilePath, JSON.stringify(sortedDiaries));

  res.status(201).json(diaries);
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
