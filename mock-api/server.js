import process from "process"
import {config} from "./config.js"
import { app } from "./serverApp.js"

const PORT = config.PORT

// This is a hacky global error handler to output errors and exit
process.on("uncaughtException", err => {
	console.log(`Uncaught Exception: ${err.message}`)
	process.exit(1)
})
// This is a hacky global error handler to output errors and exit
process.on("unhandledRejection", (reason) => {
	console.log("Unhandled Rejection at:", reason.stack || reason)
	process.exit(1)
})

app.listen(PORT)
console.log(`Running on port ${PORT}`)