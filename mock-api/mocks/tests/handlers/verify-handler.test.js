/* eslint-disable no-undef */
import request from "supertest"
import { expect, test } from "@jest/globals"
import { v4 as uuidv4 } from "uuid"

import { app } from "../../../serverApp.js"
import { test_request, test_request as req } from "../request-body.js"
import { verify_auto_with_only_required_fields_request as requestAutoRequiredOnly } from "../verify-auto-request-with-only-required-fields.js"
import {
	serializeJSONToHeaderString
} from "../test-helpers.js"

// eslint-disable-next-line no-undef
process.env.NODE_ENV = "test"

test("expect 200 \"OK\"", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])


	await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
		.expect(200)
		.then(response => {
			expect(response)
				.toHaveRequiredMitekResponseHeaders()
		})
})

test("expect 200 adsa", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.body.pages.splice(1, 1)
	localReq.body.pages[0].onDeviceClassification.documentType = "PASSPORT"
	localReq.body.pages[0].issuingCountry = "PRT"
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])


	await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
		.expect(200)
		.then(response => {
			expect(response)
				.toHaveRequiredMitekResponseHeaders()
		})
}, 5000) // set test timeout to short duration so it doesn't hang for now.

test("expect 200 \"OK\"", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])


	await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
		.expect(200)
		.then(response => {
			expect(response)
				.toHaveRequiredMitekResponseHeaders()
		})
})

test("expect 200 request has no selife", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	localReq.body.selfie = undefined
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])


	await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
		.expect(200)
		.then(response => {
			expect(response)
				.toHaveRequiredMitekResponseHeaders()
			expect(response.body.processingInfo.selfie)
				.toBe(undefined)
		})
}, 5000) // set test timeout to short duration so it doesn't hang for now.

test("expect 200 \"OK\" for auto only request with only required request fields", async () => {
	let localReq = JSON.parse(JSON.stringify(requestAutoRequiredOnly))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])


	await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
		.expect(200)
		.then(response => {
			expect(response)
				.toHaveRequiredMitekResponseHeaders()
		})
}, 5000) // set test timeout to short duration so it doesn't hang for now.

test("expect 200 \"OK\" for auto only request when optional extraction configuration is not provided", async () => {
	let localReq = JSON.parse(JSON.stringify(requestAutoRequiredOnly))
	// purposefully delete an optional configuration element to ensure mock server api handles it
	delete localReq.body.configuration.extraction
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])


	await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
		.expect(200)
		.then(response => {
			expect(response)
				.toHaveRequiredMitekResponseHeaders()
		})
}, 5000) // set test timeout to short duration so it doesn't hang for now.

test("test when x-simulated-content header is undefined", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	delete localReq.headers["x-simulated-content"]

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
	expect(response.body.extraction)
		.toHaveProperty("merged")
	expect(response.body.extraction)
		.toHaveProperty("sources")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("all possible responseImages will be included", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body)
		.toHaveProperty("responseImages.croppedPortrait")
	expect(response.body)
		.toHaveProperty("responseImages.croppedSignature")
	expect(response.body)
		.toHaveProperty("responseImages.croppedDocument")
	expect(response.body.responseImages.croppedDocument.length)
		.toBe(2)
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("test when there's only one page and pdf417 are included", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	localReq.body.pages.splice(1, 1)
	localReq.body.pages[0].onDeviceClassification.documentType = "DRIVERS_LICENSE"
	localReq.body.pages[0].onDeviceClassification.issuingCountry = "CAN"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.classification.idDocument.pages.length)
		.toBe(2)
	expect(response.body.classification.idDocument.pages[1].pageId)
		.toEqual(response.body.processingInfo.barcodes[0].barcodeId)
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})


test("required only responseImages will be included", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	let headers = localReq.headers
	localReq.body["configuration"].responseImages = ["CroppedPortrait"]

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body)
		.toHaveProperty("responseImages.croppedPortrait")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("no responseImages will be included", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	let headers = localReq.headers
	localReq.body["configuration"].responseImages = undefined

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body)
		.not.toHaveProperty("responseImages.croppedPortrait")
	expect(response.body)
		.not.toHaveProperty("responseImages.croppedSignature")
	expect(response.body)
		.not.toHaveProperty("responseImages.croppedDocument")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("configuration will be included", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body)
		.toHaveProperty("configuration.verification")
	expect(response.body)
		.toHaveProperty("configuration.extraction")
	expect(response.body)
		.toHaveProperty("configuration.responseImages")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("processingInfo.selfie will be included", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body)
		.toHaveProperty("processingInfo.selfie")
	expect(response.body)
		.toHaveProperty("processingInfo.selfie.status")
	expect(response.body)
		.toHaveProperty("processingInfo.selfie.captureDetail")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

// EVIDENCE

test("documentImageEvidence is included", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.processingInfo.pages.length)
		.toBe(2)
	expect(response.body.processingInfo.pages[0])
		.toHaveProperty("pageId")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("barcodeEvidence is included", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true

	localReq.headers["x-simulated-content"] = serializeJSONToHeaderString(localReq.headers["x-simulated-content"])
	localReq.body.pages[0].onDeviceClassification.documentType = "DRIVERS_LICENSE"

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.processingInfo.barcodes.length)
		.toBe(1)
	expect(response.body.processingInfo.barcodes[0])
		.toHaveProperty("barcodeId")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("all processingInfo is included", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])
	localReq.body.pages[0].onDeviceClassification.documentType = "DRIVERS_LICENSE"

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.processingInfo.pages.length)
		.toBe(2)
	expect(response.body.processingInfo.barcodes.length)
		.toBe(1)
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("no processingInfo is included", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.processingInfo.pages.length)
		.toBe(0)

	expect(response.body.processingInfo.barcodes)
		.toBe(undefined)

	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("wrong header value yields no change", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = "please"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.processingInfo.pages.length)
		.toBe(0)
	expect(response.body.processingInfo.barcodes)
		.toBe(undefined)
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

// DOC FRAUD

test("setting docFraudGeneralFraud results in false verification", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].docFraudGeneralFraud = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.verification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.confidence)
		.toBe(499)
	expect(response.body.verification.documentVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.documentVerification.fraudReasons[0])
		.toBe("GENERAL FRAUD")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("setting docFraudPortraitZone and docFraudSecurityFeatures results in lower confidence level", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].docFraudPortraitZone = true
	localReq.headers["x-simulated-content"].docFraudSecurityFeatures = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.verification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.confidence)
		.toBe(99)
	expect(response.body.verification.documentVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.documentVerification.fraudReasons[0])
		.toBe("PORTRAIT ZONE")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("setting docFraudPhotocopy and docFraudPortraitZone results in lower confidence level of 199", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].docFraudPhotocopy = true
	localReq.headers["x-simulated-content"].docFraudPortraitZone = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.verification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.confidence)
		.toBe(199)
	expect(response.body.verification.documentVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.documentVerification.fraudReasons[0])
		.toBe("PHOTOCOPY")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("setting docFraudBarcode results in confidence level of 0 fraudReasons includes BARCODE", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].docFraudBarcode = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.verification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.confidence)
		.toBe(0)
	expect(response.body.verification.documentVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.documentVerification.fraudReasons[0])
		.toBe("BARCODE")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("setting docFraudNfc results in confidence level of 0 fraudReasons includes NFC", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].docFraudNfc = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.verification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.confidence)
		.toBe(0)
	expect(response.body.verification.documentVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.documentVerification.fraudReasons[0])
		.toBe("NFC")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("setting docFraudDocStructure results in confidence level of 0 fraudReasons includes DOCUMENT STRUCTURE", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].docFraudDocStructure = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.verification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.confidence)
		.toBe(0)
	expect(response.body.verification.documentVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.documentVerification.fraudReasons[0])
		.toBe("DOCUMENT STRUCTURE")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("setting docFraudIncompleteEvidence results in false verification", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].docFraudIncompleteEvidence = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.verification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.confidence)
		.toBe(0)
	expect(response.body.verification.documentVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.documentVerification.fraudReasons[0])
		.toBe("INCOMPLETE EVIDENCE")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("setting docFraudBioData results in false verification", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].docFraudBioDataFonts = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.verification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.confidence)
		.toBe(300)
	expect(response.body.verification.documentVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.documentVerification.fraudReasons[0])
		.toBe("BIODATA FONTS")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

// eslint-disable-next-line no-undef
process.env.NODE_ENV = "test"

test("retieving an incorrect id returns 404", async () => {
	let req = JSON.parse(JSON.stringify(test_request))

	await request(app)
		.get(`/mock/verify/${uuidv4()}`)
		.set(req.headers)
		.expect(404)
})

test("expect async response when agentReview is true", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.body.configuration.verification.agentReview = true
	req.headers["x-agent-time"] = 0

	const response = await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	expect(response.body)
		.toHaveProperty("requestId")
	expect(response.body)
		.toHaveProperty("customerReferenceId")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("expect async response when verifyLevel > 1", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.body.configuration.verification.verifyLevel = 3
	req.headers["x-agent-time"] = 0

	const response = await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	expect(response.body)
		.toHaveProperty("requestId")
	expect(response.body)
		.toHaveProperty("customerReferenceId")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("expect async response when docFraudKnownFraud is true and agentReview is true", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.headers["x-simulated-content"].docFraudKnownFraud = true
	req.body.configuration.verification.agentReview = true
	req.headers["x-agent-time"] = 0
	req.headers["x-simulated-content"] =
		serializeJSONToHeaderString(req.headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	expect(response.body)
		.toHaveProperty("requestId")
	expect(response.body)
		.toHaveProperty("customerReferenceId")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("expect async response when docFraudMrzCheckDigit is true and agentReview is true", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.headers["x-simulated-content"].docFraudMrzCheckDigit = true
	req.body.configuration.verification.agentReview = true
	req.headers["x-agent-time"] = 0
	req.headers["x-simulated-content"] =
		serializeJSONToHeaderString(req.headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	expect(response.body)
		.toHaveProperty("requestId")
	expect(response.body)
		.toHaveProperty("customerReferenceId")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("expect async response when docFraudMrzFonts is true and agentReview is true", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.headers["x-simulated-content"].docFraudMrzFonts = true
	req.body.configuration.verification.agentReview = true
	req.headers["x-agent-time"] = 0
	req.headers["x-simulated-content"] =
		serializeJSONToHeaderString(req.headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(201)

	expect(response.body)
		.toHaveProperty("requestId")
	expect(response.body)
		.toHaveProperty("customerReferenceId")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("bad request returned with incorrect header and body values", async () => {
	let req = JSON.parse(JSON.stringify(test_request))
	req.body.configuration.verification.agentReview = "True"

	await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(400)

	req = JSON.parse(JSON.stringify(test_request))
	req.headers["x-agent-time"] = "two"

	await request(app)
		.post("/mock/verify")
		.set(req.headers)
		.send(req.body)
		.expect(400)
})

test("setting biometricFraudFaceComparison results in false verification", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].biometricFraudFaceComparison = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.verification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.confidence)
		.toBe(349)
	expect(response.body.verification.biometricVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.biometricVerification.fraudReasons[0])
		.toBe("FACE COMPARISON")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("setting biometricFraudFaceLiveness results in false verification", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].biometricFraudFaceLiveness = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.verification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.confidence)
		.toBe(249)
	expect(response.body.verification.biometricVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.biometricVerification.fraudReasons[0])
		.toBe("FACE LIVENESS")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("setting both fraud types results in false verification", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].docFraudBioDataConsistency = true
	localReq.headers["x-simulated-content"].biometricFraudFaceLiveness = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.verification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.confidence)
		.toBe(200)
	expect(response.body.verification.documentVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.documentVerification.fraudReasons[0])
		.toBe("BIODATA CONSISTENCY")
	expect(response.body.verification.biometricVerification.verified)
		.not.toBeTruthy()
	expect(response.body.verification.biometricVerification.fraudReasons[0])
		.toBe("FACE LIVENESS")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

// EXTRACTION - EXCLUDE

test("either extractionOperation with no item results in all", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["extractionOperation"] = "exclude"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	let response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged)
		.toHaveProperty("name")
	expect(response.body.extraction.merged)
		.toHaveProperty("address")
	expect(response.body.extraction.merged)
		.toHaveProperty("personalInfo")
	expect(response.body.extraction.merged)
		.toHaveProperty("documentInfo")

	localReq.headers["extractionOperation"] = "include"

	// eslint-disable-next-line no-unused-vars
	response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged)
		.toHaveProperty("name")
	expect(response.body.extraction.merged)
		.toHaveProperty("address")
	expect(response.body.extraction.merged)
		.toHaveProperty("personalInfo")
	expect(response.body.extraction.merged)
		.toHaveProperty("documentInfo")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("exclude extractionOperation with blank fields returns all fields excluded", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	let headers = localReq.headers
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	localReq.body.configuration.extraction.action = "EXCLUDE"
	localReq.body.configuration.extraction.fields = []

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged.personalInfo)
		.toHaveProperty("dateOfBirth", "REDACTED")
	expect(response.body.extraction.sources[0].personalInfo)
		.toHaveProperty("dateOfBirth", "REDACTED")
	expect(response.body.extraction.merged.documentInfo)
		.toHaveProperty("documentNumber", "REDACTED")
	expect(response.body.extraction.sources[0].documentInfo)
		.toHaveProperty("documentNumber", "REDACTED")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("exclude extractionOperation with \"dateOfBirth\" omits the field", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"]["extractionOperation"] = "exclude"
	localReq.headers["x-simulated-content"]["extractionItems"] = "dateOfBirth"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged)
		.toHaveProperty("name")
	expect(response.body.extraction.merged)
		.toHaveProperty("address")
	expect(response.body.extraction.merged)
		.toHaveProperty("personalInfo")
	expect(response.body.extraction.merged.personalInfo)
		.not.toHaveProperty("dateOfBirth")
	expect(response.body.extraction.merged)
		.toHaveProperty("documentInfo")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("exclude extractionOperation with \"name\" omits the field", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"]["extractionOperation"] = "exclude"
	localReq.headers["x-simulated-content"]["extractionItems"] = "name"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged)
		.not.toHaveProperty("name")
	expect(response.body.extraction.merged)
		.toHaveProperty("address")
	expect(response.body.extraction.merged)
		.toHaveProperty("personalInfo")
	expect(response.body.extraction.merged)
		.toHaveProperty("documentInfo")
})

test("exclude extractionOperation with \"documentNumber\" omits the field", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"]["extractionOperation"] = "exclude"
	localReq.headers["x-simulated-content"]["extractionItems"] = "documentNumber"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged)
		.toHaveProperty("name")
	expect(response.body.extraction.merged)
		.toHaveProperty("address")
	expect(response.body.extraction.merged)
		.toHaveProperty("personalInfo")
	expect(response.body.extraction.merged)
		.toHaveProperty("documentInfo")
	expect(response.body.extraction.merged.documentInfo)
		.not.toHaveProperty("documentNumber")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("exclude extractionOperation with each item exclude the fields", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	let headers = localReq.headers
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	localReq.body.configuration.extraction.action = "EXCLUDE"
	localReq.body.configuration.extraction.fields = ["dateOfBirth", "documentNumber"]

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged.personalInfo)
		.toHaveProperty("dateOfBirth", "REDACTED")
	expect(response.body.extraction.sources[0].personalInfo)
		.toHaveProperty("dateOfBirth", "REDACTED")
	expect(response.body.extraction.merged.documentInfo)
		.toHaveProperty("documentNumber", "REDACTED")
	expect(response.body.extraction.sources[0].documentInfo)
		.toHaveProperty("documentNumber", "REDACTED")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("exclude extractionOperation exclude everything", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	let headers = localReq.headers
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true

	localReq.body.configuration.extraction.action = "EXCLUDE"
	localReq.body.configuration.extraction.fields = []
	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged.personalInfo)
		.toHaveProperty("dateOfBirth", "REDACTED")
	expect(response.body.extraction.merged.documentInfo)
		.toHaveProperty("documentNumber", "REDACTED")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

// EXTRACTION - INCLUDE

test("include extractionOperation with blank fields returns all fields included", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	let headers = localReq.headers
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	localReq.body.configuration.extraction.action = "INCLUDE"
	localReq.body.configuration.extraction.fields = ["dateOfBirth", "documentNumber"]

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged.personalInfo)
		.toHaveProperty("dateOfBirth", "1980-05-31")
	expect(response.body.extraction.merged.documentInfo)
		.toHaveProperty("documentNumber", "123456789")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("include extractionOperation with \"all\" returns all", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"]["extractionOperation"] = "include"
	localReq.headers["x-simulated-content"]["extractionItems"] = "all"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged)
		.toHaveProperty("name")
	expect(response.body.extraction.merged)
		.toHaveProperty("address")
	expect(response.body.extraction.merged)
		.toHaveProperty("personalInfo")
	expect(response.body.extraction.merged)
		.toHaveProperty("documentInfo")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("include extractionOperation with \"dateOfBirth\" includes only that field", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"]["extractionOperation"] = "include"
	localReq.headers["x-simulated-content"]["extractionItems"] = "dateOfBirth"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged)
		.not.toHaveProperty("name")
	expect(response.body.extraction.merged)
		.not.toHaveProperty("address")
	expect(response.body.extraction.merged)
		.toHaveProperty("personalInfo")
	expect(response.body.extraction.merged.personalInfo)
		.not.toHaveProperty("gender")
	expect(response.body.extraction.merged.personalInfo)
		.toHaveProperty("dateOfBirth")
	expect(response.body.extraction.merged)
		.not.toHaveProperty("documentInfo")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("include extractionOperation with \"name\" includes only that field", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"]["extractionOperation"] = "include"
	localReq.headers["x-simulated-content"]["extractionItems"] = "name"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged)
		.toHaveProperty("name")
	expect(response.body.extraction.merged)
		.not.toHaveProperty("address")
	expect(response.body.extraction.merged)
		.not.toHaveProperty("personalInfo")
	expect(response.body.extraction.merged)
		.not.toHaveProperty("documentInfo")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("include extractionOperation with \"documentNumber\" includes only that field", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"]["extractionOperation"] = "include"
	localReq.headers["x-simulated-content"]["extractionItems"] = "documentNumber"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged)
		.not.toHaveProperty("name")
	expect(response.body.extraction.merged)
		.not.toHaveProperty("address")
	expect(response.body.extraction.merged)
		.not.toHaveProperty("personalInfo")
	expect(response.body.extraction.merged)
		.toHaveProperty("documentInfo")
	expect(response.body.extraction.merged.documentInfo)
		.toHaveProperty("documentNumber")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("include extractionOperation with each item includes only those fields", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"]["extractionOperation"] = "include"
	localReq.headers["x-simulated-content"]["extractionItems"] = "dateOfBirth, documentNumber, name"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged)
		.toHaveProperty("name")
	expect(response.body.extraction.merged)
		.not.toHaveProperty("address")
	expect(response.body.extraction.merged)
		.toHaveProperty("personalInfo")
	expect(response.body.extraction.merged.personalInfo)
		.not.toHaveProperty("gender")
	expect(response.body.extraction.merged)
		.toHaveProperty("documentInfo")
	expect(response.body.extraction.merged.documentInfo)
		.toHaveProperty("documentNumber")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("include extractionOperation with each item and all includes everything", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"]["extractionOperation"] = "include"
	localReq.headers["x-simulated-content"]["extractionItems"] = "dateOfBirth, documentNumber, name, all"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.extraction.merged)
		.toHaveProperty("name")
	expect(response.body.extraction.merged)
		.toHaveProperty("address")
	expect(response.body.extraction.merged)
		.toHaveProperty("personalInfo")
	expect(response.body.extraction.merged)
		.toHaveProperty("documentInfo")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

// FAILURES

test("acceptanceFailure set returns message", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].acceptanceFailure = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.processingInfo)
		.toHaveProperty("status", "FAILED")
	expect(response.body.processingInfo.pages[0])
		.toHaveProperty("status", "FAILED")
	expect(response.body.processingInfo.pages[0].failureReasons)
		.toHaveProperty("201", "The image is not sharp.")

	expect(response.body)
		.not.toHaveProperty("classification")
	expect(response.body)
		.not.toHaveProperty("extraction")
	expect(response.body)
		.not.toHaveProperty("verification")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("classificationFailure set returns message", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].classificationFailure = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)

	expect(response.body.processingInfo)
		.toHaveProperty("status", "FAILED")
	expect(response.body.processingInfo.pages[0])
		.toHaveProperty("status", "FAILED")
	expect(response.body.processingInfo.pages[0].failureReasons)
		.toHaveProperty("206", "The type of ID document could not be determined.")

	expect(response.body)
		.not.toHaveProperty("classification")
	expect(response.body)
		.not.toHaveProperty("extraction")
	expect(response.body)
		.not.toHaveProperty("verification")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("extractionFailure set returns message", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].extractionFailure = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
	expect(response.body.processingInfo)
		.toHaveProperty("status", "FAILED")
	expect(response.body.processingInfo.pages[0])
		.toHaveProperty("status", "FAILED")
	expect(response.body.processingInfo.pages[0].failureReasons)
		.toHaveProperty("520", "Extraction acceptance failed")

	expect(response.body)
		.toHaveProperty("classification")

	expect(response.body)
		.not.toHaveProperty("extraction")
	expect(response.body)
		.not.toHaveProperty("verification")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("USA PP combination returns OCR and MRZ", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
	expect(response.body.extraction.sources[0])
		.toHaveProperty("type", "OCR")
	expect(response.body.extraction.sources[1].mrzInfo)
		.toHaveProperty("mrzLine1", "P<USASMITH<<JOHN<P<<<<<<<<<<<<<<<<<<<<<<<<<<")
	expect(response.body.extraction.sources[1])
		.toHaveProperty("type", "MRZ")


	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("Test when condition 1 is ALWAYS and condition 2 value is NEVER", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].returnBarcodeEvidence = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	localReq.body.pages.splice(1, 1)
	localReq.body.pages[0].onDeviceClassification.documentType = "IDENTIFICATION_CARD"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
	expect(response.body.extraction.sources[0])
		.toHaveProperty("type", "OCR")
	expect(response.body.extraction.sources[1])
		.toHaveProperty("type", "BARCODE")
	// expect(response.body.extraction.sources[1].mrzInfo)
	// 	.toHaveProperty("mrzLine1", "P<USASMITH<<JOHN<P<<<<<<<<<<<<<<<<<<<<<<<<<<")

	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("Test when docType value equal RP and docCountry value equal PRT", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	localReq.body.pages[0].onDeviceClassification.documentType = "RESIDENCE_PERMIT"
	localReq.body.pages[0].onDeviceClassification.issuingCountry = "PRT"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
	expect(response.body.extraction.sources[1])
		.toHaveProperty("type", "MRZ")
	expect(response.body.extraction.sources[0])
		.toHaveProperty("type", "OCR")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("Test when docType and docCountry are omitted", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	localReq.body.pages[0].onDeviceClassification.documentType = undefined
	localReq.body.pages[0].onDeviceClassification.issuingCountry = undefined
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
	expect(response.body.extraction.sources[0])
		.toHaveProperty("type", "OCR")
	expect(response.body.extraction.sources[1])
		.toHaveProperty("type", "BARCODE")
	expect(response.body.extraction.sources.length)
		.toBe(2)
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("Test when docType and docCountry are set in headers and omitted from body", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	localReq.headers["documentCountry"] = "USA"
	localReq.headers["documentType"] = "DL"
	localReq.body.pages[0].onDeviceClassification.documentType = undefined
	localReq.body.pages[0].onDeviceClassification.issuingCountry = undefined
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
	expect(response.body.extraction.sources[0])
		.toHaveProperty("type", "OCR")
	expect(response.body.extraction.sources[1])
		.toHaveProperty("type", "BARCODE")
	expect(response.body.extraction.sources.length)
		.toBe(2)
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("Test invalid combination for docType and docCountry", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	localReq.headers["documentCountry"] = "USA"
	localReq.headers["documentType"] = "PR"
	localReq.body.pages[0].onDeviceClassification.documentType = undefined
	localReq.body.pages[0].onDeviceClassification.issuingCountry = undefined
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
	expect(response.body.extraction.sources[0])
		.toHaveProperty("type", "OCR")
	expect(response.body.extraction.sources[1])
		.toHaveProperty("type", "BARCODE")
	expect(response.body.extraction.sources.length)
		.toBe(2)
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("Test when docType value equal DL and docCountry value equal USA", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	localReq.body.pages[0].onDeviceClassification.documentType = "DRIVERS_LICENSE"
	localReq.body.pages[0].onDeviceClassification.issuingCountry = "USA"
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	const response = await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
	expect(response.body.extraction.sources[0])
		.toHaveProperty("type", "OCR")
	expect(response.body.extraction.sources[1])
		.toHaveProperty("type", "BARCODE")
	expect(response)
		.toHaveRequiredMitekResponseHeaders()
})

test("Test removing request required pages array", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].returnDocumentImageEvidence = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	delete localReq.body.pages
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
		.expect(400)
})

test("too many requests gets a 429 response", async () => {
	let localReq = JSON.parse(JSON.stringify(req))
	localReq.headers["x-simulated-content"].extractionFailure = true
	localReq.headers["x-simulated-content"].forceSynchronous = true
	let headers = localReq.headers

	headers["x-simulated-content"] = serializeJSONToHeaderString(headers["x-simulated-content"])

	for (let x = 0; x <= 100; x++) {
		await request(app)
			.post("/mock/verify")
			.set(localReq.headers)
			.send(localReq.body)
	}
	await request(app)
		.post("/mock/verify")
		.set(localReq.headers)
		.send(localReq.body)
		.expect(429)
})
