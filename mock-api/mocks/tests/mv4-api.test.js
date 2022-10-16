/* eslint-disable no-undef */
import request from "supertest"
import { test } from "@jest/globals"
import { app } from "../../serverApp.js"
import {test_request as req} from "./request-body"
import {serializeJSONToHeaderString} from "./test-helpers"

process.env.NODE_ENV = "test"

test("test failed request validation", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	let headers = localReq.headers
	let body = localReq.body
	delete body.pdf417.barcodeString

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
		.expect(400)
		.then(response => {
			expect(response)
				.toHaveRequiredMitekResponseHeaders()
		})
})

test("test unauthorized api access", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])
	headers["Authorization"] = ""

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
		.expect(401)

	expect(response.body)
		.toHaveProperty("message", "The token is either invalid, malformed, inactive, or missing the required scopes")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("test api invalid url path", async () => {
	const response = await request(app)
		.post("/mock/invalid-path")
		.send()
		.expect(404)

	expect(response.body)
		.toHaveProperty("message", "Not found")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("test api invalid url path", async () => {
	const response = await request(app)
		.get("/mock/verify")
		.send()
		.expect(405)

	expect(response.body)
		.toHaveProperty("message", "Method not allowed")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})
