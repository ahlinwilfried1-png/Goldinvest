import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set higher limits for payload transfers (e.g., receipt images)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Central Database file inside the container
  const dbPath = path.join(process.cwd(), "db.json");
  let storeData: Record<string, any> = {};

  function loadStore() {
    if (fs.existsSync(dbPath)) {
      try {
        const fileContent = fs.readFileSync(dbPath, "utf-8");
        storeData = JSON.parse(fileContent);
        console.log("State database loaded successfully from db.json");
      } catch (e) {
        console.error("Failed to parse db.json data, resetting:", e);
        storeData = {};
      }
    } else {
      storeData = {};
    }
  }

  function saveStore() {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(storeData, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to db.json file:", e);
    }
  }

  // Load store on startup
  loadStore();

  // API endpoints to synchronize state
  app.get("/api/get-store", (req, res) => {
    res.json(storeData);
  });

  app.post("/api/save-store", (req, res) => {
    const body = req.body;
    if (body && typeof body === "object") {
      for (const key of Object.keys(body)) {
        const newVal = body[key];
        const oldVal = storeData[key];

        if (Array.isArray(newVal) && Array.isArray(oldVal)) {
          // Merge arrays by ID or Code and choose the item with the higher lastModified
          const mergedMap = new Map<string, any>();
          
          // First populated with existing server data
          for (const item of oldVal) {
            if (item && typeof item === "object") {
              const id = item.id || item.code;
              if (id) {
                mergedMap.set(String(id), item);
              }
            }
          }

          // Then merge incoming items
          for (const item of newVal) {
            if (item && typeof item === "object") {
              const id = item.id || item.code;
              if (id) {
                const idStr = String(id);
                if (!mergedMap.has(idStr)) {
                  mergedMap.set(idStr, item);
                } else {
                  const existingItem = mergedMap.get(idStr);
                  const existingTime = existingItem.lastModified || 0;
                  const incomingTime = item.lastModified || 0;
                  if (incomingTime >= existingTime) {
                    mergedMap.set(idStr, item);
                  }
                }
              }
            }
          }

          storeData[key] = Array.from(mergedMap.values());
        } else {
          // Overwrite single primitives or single configs with the newest
          storeData[key] = newVal;
        }
      }

      saveStore();
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid store data" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development, static fallback for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
