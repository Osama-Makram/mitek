/* eslint-disable no-unused-vars */
import jwt from "jsonwebtoken"
import {OpenAPIBackend} from "openapi-backend"
import path, { dirname } from "path"
import { fileURLToPath } from "url"

import {HealthHandler} from "./handlers/health-handler.js"
import {PollHandler} from "./handlers/poll-handler.js"
import {VerifyHandler} from "./handlers/verify-handler.js"
import {RetrieveHandler} from "./handlers/retrieve-handler.js"
import {Oauth2TokenHandler} from "./handlers/oauth2-handler.js"


const SPEC_FILE = "/specs/mv4-api.yaml"
const FILENAME = fileURLToPath(import.meta.url)
const DIR_NAME = dirname(FILENAME)
const SPEC_PATH = path.resolve(DIR_NAME, `../..${SPEC_FILE}`)

export default class MobileVerifyApiMock {
	// Secret used to verify mock jwt auth token

	constructor() {
		this.mockTokenSecret = "VGltZVRvV2lu"
		// create new api
		this.api = new OpenAPIBackend({
			definition: SPEC_PATH,
			strict: true
		})

		// register the right handlers to the operations
		this.api.register({
			health: HealthHandler,
			poll: PollHandler,
			verify: VerifyHandler,
			retrieve: RetrieveHandler,
			oauth2Token: Oauth2TokenHandler,
			validationFail: failedRequestValidationHandler,
			// responseValidation
			postResponseHandler: responseValidationHandler,
			// unauthorized request
			unauthorizedHandler: unauthorizedHandler,
			notFound: notFoundHandler,
			methodNotAllowed: methodNotAllowedHandler,
		})

		// register security handler
		this.api.registerSecurityHandler("BearerToken", (c, req, res) => {
			const authHeader = c.request.headers["authorization"]
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				throw new Error("Authorization header is missing or is not a valid Bearer token")
			}
			const token = authHeader.replace("Bearer ", "")
			return jwt.verify(token, this.mockTokenSecret)
		})

		// initalize the backend
		this.api.init()
	}

	get spec() {
		return SPEC_FILE
	}

}

async function failedRequestValidationHandler(c, req, res) {
	return res.status(400).json({ err: c.validation.errors })
}

async function responseValidationHandler(c, req, res) {
	// Headers might have already been set in unauthorized handler
	if (res.headersSent)
		return

	const valid = c.api.validateResponse(c.response, c.operation)
	if (valid.errors) {
		// response validation failed
		return res.status(502).json({ status: 502, err: valid.errors })
	}
	return res.status(200).json(c.response)
}

async function unauthorizedHandler(c, req, res) {
	return res.status(401).json({
		requestId: res.get("Mitek-Request-Id"),
		message: "The token is either invalid, malformed, inactive, or missing the required scopes"
	})
}

async function notFoundHandler(c, req, res) {
	return res.status(404).json({
		requestId: res.get("Mitek-Request-Id"),
		message: "Not found"
	})
}

async function methodNotAllowedHandler(c, req, res) {
	return res.status(405).json({
		requestId: res.get("Mitek-Request-Id"),
		message: "Method not allowed"
	})
}
