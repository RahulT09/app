require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/db");

async function startServer() {
  try {
    await connectToDB();

    app.listen(3001, () => {
      console.log("App is listening on port 3001");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
