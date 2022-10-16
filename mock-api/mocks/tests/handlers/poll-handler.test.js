/* eslint-disable no-undef */
import request from "supertest"
import {test} from "@jest/globals"

import {app} from "../../../serverApp.js"
import {test_request} from "../request-body.js"
import {
	findPollingRequest, serializeJSONToHeaderString
} from "../test-helpers.js"

process.env.NODE_ENV = "test"

test("polling before /verify returns empty array", async () => {
	let req = JSON.parse(JSON.stringify(test_request))

	await request(app)
		.get("/mock/poll")
		.set(req.headers)
		.expect(200)
		.then((response) => {
			response.body.length === 0
			expect(response).toHaveRequiredMitekResponseHeaders()
		})
})

test("polling only completed verifications", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.body.configuration.verification.agentReview = true
	req.headers["x-agent-time"] = 1

	const {body} = await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	expect(body)
		.toHaveProperty("requestId")
	expect(body)
		.toHaveProperty("customerReferenceId")

	await new Promise(resolve => setTimeout(resolve, 1000))

	await request(app)
		.get("/mock/poll?requestStatus=COMPLETE")
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
			expect(response).toHaveRequiredMitekResponseHeaders()
		})
})

test("polling return only retrieved ", async () => {
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

test("polling verifications with max count of 1", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.body.configuration.verification.agentReview = true
	req.headers["x-agent-time"] = 1

	await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)
	await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	await new Promise(resolve => setTimeout(resolve, 1000))

	await request(app)
		.get("/mock/poll?responseMaxCount=1")
		.set(req.headers)
		.expect(200)
		.then((response) => {
			expect(response.body).toHaveLength(1)
			expect(response).toHaveRequiredMitekResponseHeaders()
		})
})

test("polling verifications with start date", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.body.configuration.verification.agentReview = true
	req.headers["x-agent-time"] = 1

	const {body} = await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	await new Promise(resolve => setTimeout(resolve, 1000))

	await request(app)
		.get("/mock/poll?requestDateStart=2021-09-23T09%3A25%3A00.000Z")
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
			expect(response).toHaveRequiredMitekResponseHeaders()
		})
})

test("polling verifications with expiry start date", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.body.configuration.verification.agentReview = true
	req.headers["x-agent-time"] = 1

	await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	await new Promise(resolve => setTimeout(resolve, 1000))

	await request(app)
		.get("/mock/poll?requestExpiryStart=2021-09-23T09%3A25%3A00.000Z")
		.set(req.headers)
		.expect(200)
		.then((response) => {
			expect(response.body)
				.toHaveLength(0)
			expect(response).toHaveRequiredMitekResponseHeaders()
		})
})

test("polling verifications with expiry end date", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.body.configuration.verification.agentReview = true
	req.headers["x-agent-time"] = 1

	await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	await new Promise(resolve => setTimeout(resolve, 1000))

	await request(app)
		.get("/mock/poll?requestExpiryEnd=2021-09-23T09%3A25%3A00.000Z")
		.set(req.headers)
		.expect(200)
		.then((response) => {
			expect(response.body.length)
				.toBeGreaterThanOrEqual(1)
			expect(response).toHaveRequiredMitekResponseHeaders()
		})
})


test("polling only pending verifications", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.body.configuration.verification.agentReview = true
	req.headers["x-agent-time"] = 5

	const {body} = await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	expect(body)
		.toHaveProperty("requestId")
	expect(body)
		.toHaveProperty("customerReferenceId")

	await request(app)
		.get("/mock/poll?requestStatus=PENDING&responseRetrieved=false")
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
				.toHaveProperty("processingStatus", "PENDING")
			expect(polling_request)
				.toHaveProperty("retrievalId")
			expect(polling_request)
				.toHaveProperty("requestDate")
			expect(polling_request)
				.toHaveProperty("expiryDate")
			expect(polling_request)
				.toHaveProperty("responseRetrieved")
			expect(response).toHaveRequiredMitekResponseHeaders()
		})
})

test("response can be polled for after async response and retrieved", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.body.configuration.verification.agentReview = true
	req.headers["x-agent-time"] = 1

	const {body} = await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	expect(body)
		.toHaveProperty("requestId")
	expect(body)
		.toHaveProperty("customerReferenceId")

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
				.toHaveProperty("processingStatus", "PENDING")
			expect(polling_request)
				.toHaveProperty("retrievalId")
			expect(polling_request)
				.toHaveProperty("requestDate")
			expect(polling_request)
				.toHaveProperty("expiryDate")
			expect(polling_request)
				.toHaveProperty("responseRetrieved")
			expect(response).toHaveRequiredMitekResponseHeaders()
		})

	await new Promise(resolve => setTimeout(resolve, 1000))

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
				.toBeTruthy()
		})
})


