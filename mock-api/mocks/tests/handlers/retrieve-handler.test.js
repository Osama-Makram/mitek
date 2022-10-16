/* eslint-disable no-undef */
import request from "supertest"
import { test } from "@jest/globals"

import { app } from "../../../serverApp.js"
import {test_request, test_request as req} from "../request-body.js"
import {
	serializeJSONToHeaderString,
	findPollingRequest } from "../test-helpers.js"

// eslint-disable-next-line no-undef
process.env.NODE_ENV = "test"

test("fraud can be polled for after async response and retrieved", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.headers["x-agent-time"] = 0
	req.headers["x-simulated-content"].docFraudGeneralFraud = true
	req.body.configuration.verification.agentReview = true
	req.headers["x-simulated-content"] =
        serializeJSONToHeaderString(req.headers["x-simulated-content"])

	const {body} = await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	expect(body)
		.toHaveProperty("requestId")
	expect(body)
		.toHaveProperty("customerReferenceId")

	let retrievalId = undefined
	await request(app)
		.get("/mock/poll")
		.set(req.headers)
		.expect(200)
		.then((response) => {
			let polling_request = findPollingRequest(body.requestId, response.body)
			expect(polling_request)
				.toHaveProperty("service")
			expect(polling_request)
				.toHaveProperty("requestId", body.requestId)
			expect(polling_request)
				.toHaveProperty("customerReferenceId", body.customerReferenceId)
			expect(polling_request)
				.toHaveProperty("processingStatus", "COMPLETE")
			expect(polling_request)
				.toHaveProperty("retrievalId")
			expect(polling_request)
				.toHaveProperty("requestDate")
			expect(polling_request)
				.toHaveProperty("expiryDate")
			expect(polling_request)
				.toHaveProperty("responseRetrieved")
			retrievalId = polling_request.retrievalId
		})

	await request(app)
		.get(`/mock/verify/${retrievalId}`)
		.set(req.headers)
		.expect(200)
		.then((response) => {
			expect(response.body.verification.verified)
				.not.toBeTruthy()
			expect(response).toHaveRequiredMitekResponseHeaders()
		})
})

test("fraud can be polled for after async response and retrieved", async () => {

	let retrievalId = "f77cb33b-b49b-41da-9ead-14cecb3e9ac2"

	await request(app)
		.get(`/mock/verify/${retrievalId}`)
		.set(req.headers)
		.expect(404)
		.then((response) => {
			expect(response.body)
				.toHaveProperty("message", "The result you attempted to retrieve does not exist.")
			expect(response).toHaveRequiredMitekResponseHeaders()
		})
})
