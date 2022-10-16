/* eslint-disable no-unused-vars */
import * as path from "path"
import { dirname } from "path"
import { fileURLToPath } from "url"
import express from "express"
import morgan from "morgan"
import serveIndex from "serve-index"
import * as swaggerUi from "swagger-ui-express"
import { v4 as uuidv4 } from "uuid"
import MobileVerifyApiMock from "./mocks/mv4-api.js"
import jwt_decode from "jwt-decode"
import rateLimit from "express-rate-limit"
import responseTime from "response-time"
import xlsx from "xlsx"

// initialize server
export const app = express()
export const worksheet = loadContentMatrix()

app.use(responseTime({
	header: "Mitek-Server-Processing-Time",
	suffix: false
}))

app.use(express.json())
// remove the X-Powered-By headers.
app.disable("x-powered-by")  

// setup rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100
})

// apply rate limit
app.use(limiter)
// support encoded bodies
app.use(express.urlencoded({ extended: true })) 

// serve static files
const fileName = fileURLToPath(import.meta.url)
const dirName = dirname(fileName)
const filePath = path.join(dirName, "../specs")
app.use("/specs", express.static(filePath), serveIndex("../specs", {"icons": true}))

// setup logging
// eslint-disable-next-line no-undef
app.use(morgan("dev", { skip: (req, res) => process.env.NODE_ENV === "test" }))

const mv4ApiMock = new MobileVerifyApiMock()
let options = {
	swaggerOptions: {
		url: mv4ApiMock.spec
	}
}

// setup mock API backend
app.use("/docs", swaggerUi.serve, swaggerUi.setup(null, options))
app.use("/examples", express.static(path.join(dirName, "../examples")))
app.use("/mock", (req, res) => {
	// generate request id
	let requestId = uuidv4()
	// set request id response header
	res.append("Mitek-Request-Id", requestId)
	res.locals.requestId = requestId

	// get client id from jwt if present
	if (req.headers["authorization"])
		res.locals.clientId = jwt_decode(req.headers["authorization"].split(" ")[1]).clientId

	var handledRequest = mv4ApiMock.api.handleRequest(req, req, res)

	if (req.headers["x-simulated-content"]) parseHeaders: {
		let simulatedContent = {}

		// checking allows for requesting with a JSON object
		// or the serialized version from OpenAPI Docs
		try {
			let parsedContent = JSON.parse(req.headers["x-simulated-content"])

			for (const [key, value] of Object.entries(parsedContent)) {
				let lowerKey = key.toLowerCase()
				let lowerValue = value.toString().toLowerCase()
				simulatedContent[lowerKey] = lowerValue
			}

			req.headers["x-simulated-content"] = simulatedContent
			break parseHeaders
		}
		catch(error) {
			// eslint-disable-next-line no-undef
			if (process.env.NODE_ENV !== "test")
				console.log("Couldn't parse as JSON. Trying to parses as serialized instead.")
		}

		simulatedContent["extractionitems"] = []
		let toggles = req.headers["x-simulated-content"].split(",")

		toggles.forEach(toggle => {
			let [key, value] = toggle.split("=")
			key = key.toLowerCase()

			if (value) {
				if(key === "extractionitems") {
					simulatedContent[key].push(value.toLowerCase())
				}
				else {
					simulatedContent[key] = value.toLowerCase()
				}
			}
			else {
				simulatedContent["extractionitems"].push(key.trim())
			}
		})
		req.headers["x-simulated-content"] = simulatedContent
	}
	return handledRequest
})

function loadContentMatrix() {
	const workbook = xlsx.readFile("./V4-Mock-Content-Matrix.xlsx", { sheetStubs: true })
	const first_sheet_name = workbook.SheetNames[0]
	return workbook.Sheets[first_sheet_name]
}
