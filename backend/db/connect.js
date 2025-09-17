// db/connect.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  mongoose.set("strictQuery", true);

  const uriCredentials = process.env.MONGO_URI_CRED;
  const uriHost = process.env.MONGO_URI_HOST;

  let uri = uriCredentials;
  let db = "";

  if (process.env.TEMP_PROD) {
    db = "production";
    uri += db;
  } else {
    switch (process.env.NODE_ENV) {
      case "production":
      case "staging":
      case "development":
        db = process.env.NODE_ENV;
        break;
      case "test":
        db = "development"; // point at development for now
        break;
      default:
        throw new Error("NODE_ENV not set");
    }
  }

  // Add db cluster and add host to uri
  uri += db + uriHost + db;

  try {
    const connection = await mongoose.connect(uri);
    if (process.env.NODE_ENV !== "test") console.log(`connected to MongoDB! ${db}`);
    return connection;
  } catch (error) {
    console.log(`error connecting to mongodb: ${error}`);
    throw error;
  }
};

// connect immediately on import for server startup
await connectDB();
