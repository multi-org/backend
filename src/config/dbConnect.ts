import mongoose from "mongoose";

mongoose.set("strictQuery", true);

async function conectarNaDB() {
  const connectionString = process.env.DB_CONNECTION_STRING || "";
  await mongoose.connect(connectionString);
  return mongoose.connection;
}

export default conectarNaDB;
