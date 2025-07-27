import mongoose, { connect } from "mongoose"
import { connectiontoDatabase } from "./configs/database";

console.log("Hello via Bun!")
connectiontoDatabase.connect();