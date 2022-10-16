/* eslint-disable no-undef */
import request from "supertest"
import { test } from "@jest/globals"

import { app } from "../../../serverApp.js"

process.env.NODE_ENV = "test"

test("oauth2-handler returns token uaing query params", async () => {

	const response = await request(app)
		.post("/mock/oauth2/token?grant_type=client_credentials&client_id=80eccd06-f690-4cc1-afc7-cad76dcb85a3&client_secret=secret&scope=verify.v4.id-document.manual.write")
		.send()
		.expect(200)

	expect(response.body)
		.toHaveProperty("access_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiY2xpZW50SWQiOiI4MGVjY2QwNi1mNjkwLTRjYzEtYWZjNy1jYWQ3NmRjYjg1YTMiLCJpYXQiOjE2MjYwOTk2MjksImVhdCI6MTYyNjEwNjgyOX0.-DYPvekpIWV6jKqCF00cS8x0v-Yj6-wk6JBy3Quu0Lo")
	expect(response.body)
		.toHaveProperty("expires_in",3600)
	expect(response.body)
		.toHaveProperty("token_type","bearer")
	expect(response.body)
		.toHaveProperty("scope","verify.v4.id-document.manual.write")
	expect(response).toHaveRequiredMitekResponseHeaders()

})

test("oauth2-handler returns token uaing query req body", async () => {

	let reqBody = {
		"client_id": "80eccd06-f690-4cc1-afc7-cad76dcb85a3",
		"client_secret": "secret",
		"scope": "verify.v4.id-document.manual.write"
	}
	const response = await request(app)
		.post("/mock/oauth2/token")
		.send(reqBody)
		.expect(200)

	expect(response.body)
		.toHaveProperty("access_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiY2xpZW50SWQiOiI4MGVjY2QwNi1mNjkwLTRjYzEtYWZjNy1jYWQ3NmRjYjg1YTMiLCJpYXQiOjE2MjYwOTk2MjksImVhdCI6MTYyNjEwNjgyOX0.-DYPvekpIWV6jKqCF00cS8x0v-Yj6-wk6JBy3Quu0Lo")
	expect(response.body)
		.toHaveProperty("expires_in",3600)
	expect(response.body)
		.toHaveProperty("token_type","bearer")
	expect(response.body)
		.toHaveProperty("scope","verify.v4.id-document.manual.write")
	expect(response).toHaveRequiredMitekResponseHeaders()
})

test("given invalid client_id then returns bad request", async () => {

	let invalidClientId = "invalid_id"
	const response = await request(app)
		.post(`/mock/oauth2/token?grant_type=client_credentials&client_id=${invalidClientId}&client_secret=secret&scope=verify.v4.id-document.manual.write`)
		.send()
		.expect(401)

	expect(response.body)
		.toHaveProperty( "error", "invalid_client")
	expect(response.body)
		.toHaveProperty("error_description", "Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method).")
	expect(response).toHaveRequiredMitekResponseHeaders()
})

test("given invalid secret then returns bad request", async () => {

	let secret = "invalid_secret"
	const response = await request(app)
		.post(`/mock/oauth2/token?grant_type=client_credentials&client_id=80eccd06-f690-4cc1-afc7-cad76dcb85a3&client_secret=${secret}&scope=verify.v4.id-document.manual.write`)
		.send()
		.expect(401)

	expect(response.body)
		.toHaveProperty( "error", "invalid_client")
	expect(response.body)
		.toHaveProperty("error_description", "Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method).")
	expect(response).toHaveRequiredMitekResponseHeaders()
})

test("given invalid scope then return error 400", async () => {

	let invalidScope = "invalid_scope"
	const response = await request(app)
		.post(`/mock/oauth2/token?grant_type=client_credentials&client_id=80eccd06-f690-4cc1-afc7-cad76dcb85a3&client_secret=secret&scope=${invalidScope}`)
		.send()
		.expect(400)

	expect(response.body)
		.toHaveProperty( "error", "invalid_scope")
	expect(response.body)
		.toHaveProperty("error_description", "The requested scope is invalid, unknown, or malformed.")
	expect(response).toHaveRequiredMitekResponseHeaders()
})
