require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/db");

async function startServer() {
  try {
    await connectToDB();

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`App is listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
