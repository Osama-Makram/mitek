/* eslint-disable no-undef */
import request from "supertest"
import { test } from "@jest/globals"
import { app } from "../../../serverApp.js"

// eslint-disable-next-line no-undef
process.env.NODE_ENV = "test"

test("health handler has expected http response", async () => {
	const response = await request(app)
		.get("/mock/health")
		.expect(200)

	expect(response.body).toHaveProperty("generated_at")
	expect(response.body).toHaveProperty("duration_millis")
	expect(response).toHaveRequiredMitekResponseHeaders()
})
