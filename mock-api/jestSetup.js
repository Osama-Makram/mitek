import { expect } from "@jest/globals"
import { validateMitekHeaderForRequestId, validateMitekHeaderForServerProcessingTime } from "./mocks/tests/test-helpers.js"

// // add all extended jest matchers
// import * as matchers from "jest-extended"
// expect.extend(matchers)

// add custom matcher for required mitek response header
expect.extend(
	{
		toHaveRequiredMitekResponseHeaders(received) {
			const requestIdValidation = validateMitekHeaderForRequestId(received)
			if (!requestIdValidation.valid) {
				return {
					pass: false,
					message: () => `Expected ${requestIdValidation.value} to be a valid uuid (v4)`,
				}
			}
						
			const serverProcessingTimeValidation = validateMitekHeaderForServerProcessingTime(received)
			if(!serverProcessingTimeValidation.valid) {
				return {
					pass: false,
					message: () => `Expected ${serverProcessingTimeValidation.value} to be a valid integer`,
				}
			}

			return {pass: true}
		}
	})