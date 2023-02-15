import { MongoClient, MongoClientOptions } from "mongodb";

const URI = process.env.MONGODB_URI;
const options: MongoClientOptions = {};

if (!URI) throw new Error("Please add your Mongo URI to .env.local");

let client = new MongoClient(URI, options);
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV !== "production") {
  let globalWithMongoClientPromise = global as typeof globalThis & {
    _mongoClientPromise: Promise<MongoClient>;
  };

  if (!globalWithMongoClientPromise._mongoClientPromise) {
    globalWithMongoClientPromise._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongoClientPromise._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;
