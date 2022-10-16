// eslint-disable-next-line no-unused-vars
import VerifyResponse from "../response-builder/verify-response.js"
import { v4 as uuidv4 } from "uuid"
import AsyncHandler from "../response-builder/async-response.js"
import jp from "jsonpath"
import { worksheet } from "../../serverApp.js"

async function verifyHandler(c, req, res) {
	try {
		let customerReferenceId = req.body.customerReferenceId

		let verifyResponse = new VerifyResponse(customerReferenceId, res.locals.requestId)
		let simulatedContentHeaders = req.headers["x-simulated-content"]
		let documentCountry = req.headers["documentcountry"]
		let documentType = req.headers["documenttype"]
		const docCombination = getDocumentCombination(req, documentCountry, documentType)
		let values = getContentMatrixCoulmnValues(worksheet, docCombination)
		let mrzAssociatedPage = values[141]
		let includeMrz = false
		if (mrzAssociatedPage == 0)
			includeMrz = true

		verifyResponse.buildResponse(simulatedContentHeaders, req.body, includeMrz, documentType)
		// content matrix handling
		verifyResponse = handleContentMatrix(worksheet, verifyResponse, req, values)

		verifyResponse = handleNotAvailableSources(verifyResponse, docCombination, req.body, includeMrz)

		verifyResponse = handleClassificationPages(verifyResponse)
		if (verifyResponse.processingInfo.status != "FAILED") {

			verifyResponse = handleExtrationReferenceId(verifyResponse, req.body, docCombination)
		}
		if (!req.body.selfie) {
			if (verifyResponse.processingInfo.selfie)
				verifyResponse.processingInfo.selfie = undefined

			if (verifyResponse.verification && verifyResponse.verification.biometricVerification)
				verifyResponse.verification.biometricVerification = undefined
		}

		if (req.body.configuration && req.body.configuration.verification && req.body.configuration.verification.verifyLevel) {
			verifyResponse.configuration.verification.verifyLevel = req.body.configuration.verification.verifyLevel
		}

		if (verifyResponse.processingInfo && verifyResponse.processingInfo.barcodes) {
			if (!req.body.pdf417 && !req.body.qr) {
				verifyResponse.processingInfo.barcodes = undefined
			}
			else if (!verifyResponse.processingInfo.barcodes[0].type && !verifyResponse.processingInfo.barcodes[0].status) {
				verifyResponse.processingInfo.barcodes = undefined
			}
		}

		let shouldAgent = (
			(req.body.configuration && req.body.configuration.verification) && (req.body.configuration.verification.agentReview ||
				req.body.configuration.verification.verifyLevel > values[1]) ||
			// (verifyResponse.verification && verifyResponse.verification.confidence < 900) ||
			isErrorOrInvalid(verifyResponse)
		)

		if (shouldAgent) agentBlock: {
			if (simulatedContentHeaders["forcesynchronous"] === "true")
				break agentBlock

			let retrievalId = uuidv4()
			let clientId = res.locals.clientId
			let requestId = res.locals.requestId
			let time = Number(req.headers["x-agent-time"])
			time = time >= 0 ? time : 30
			let expiryDateTime = new Date(verifyResponse.createdDateTime)
			expiryDateTime.setMinutes(expiryDateTime.getMinutes() + time)
			let timerVars = {
				clientId: clientId,
				retrievalId: retrievalId,
				requestId: requestId,
				customerReferenceId: customerReferenceId,
				time: time,
				createdDateTime: new Date(verifyResponse.createdDateTime),
				expiryDateTime: expiryDateTime
			}

			verifyResponse.setAgentReview(true)
			AsyncHandler.addVerifyResponse(retrievalId, verifyResponse)
			AsyncHandler.setPendingTimer(timerVars)

			AsyncHandler.setPendingStatus(verifyResponse)

			let agentResponse = JSON.parse(JSON.stringify(verifyResponse))
			delete agentResponse.verification
			return res.status(201).json(agentResponse)
		}

		return verifyResponse
	} catch (error) {
		let requestId = res.locals.requestId
		console.error(error)
		return res.status(500).json({
			requestId: requestId,
			message: "Internal Server Error"
		})
	}
}

function handleContentMatrix(worksheet, verifyResponse, req, values) {

	const fields = getContentMatrixCoulmnValues(worksheet, "Field")
	const conditions = getContentMatrixCoulmnValues(worksheet, "Condition 1")
	const conditions2 = getContentMatrixCoulmnValues(worksheet, "OR Condition 2")

	let rowIndex = 2
	while (rowIndex < fields.length) {
		if (values[rowIndex] !== "DYNAMIC") {
			if (values[rowIndex] === "NA") {
				values[rowIndex] = undefined
			}
			const path = "$." + fields[rowIndex]
			if (!isExcludedExtraction(req, path)) {

				values = handleFullNameAndRawAddress(values, rowIndex, path, verifyResponse)
				if (conditions[rowIndex] === "ALWAYS") {
					jp.apply(verifyResponse, path, function () { return values[rowIndex] })
				} else {
					verifyResponse = handleConditionalRow(conditions, rowIndex, req, conditions2, verifyResponse, path, values)
				}
			}
		}
		rowIndex++
	}
	return verifyResponse
}

function handleConditionalRow(conditions, rowIndex, req, conditions2, verifyResponse, path, values) {
	var con = "" + conditions[rowIndex]
	var exist = jp.query(req.body, con)
	// One conditions
	// special cases
	if (path.includes("barcodes")) {
		verifyResponse = handleBarcodes(verifyResponse, values, rowIndex, path, req)
	}
	if (exist.length > 0) {

		//source where type Barcode
		if (path.includes("sources[1]")) {

			if (req.body.pdf417 || exist.length > 1) {
				jp.apply(verifyResponse, path, function () { return values[rowIndex] })
			}
		}
		//source where type MRZ
		else if (path.includes("sources[-1:]")) {

			if (verifyResponse.extraction && verifyResponse.extraction.sources[verifyResponse.extraction.sources.length - 1].type == "MRZ") {
				jp.apply(verifyResponse, path, function () { return values[rowIndex] })
			}

		}
		else {
			jp.apply(verifyResponse, path, function () { return values[rowIndex] })
		}
	}

	if (conditions2[rowIndex] !== "NEVER") {	// condition two
		var con2 = "" + conditions2[rowIndex]
		let exist = jp.query(req.body, con2)
		if (exist.length > 0)
			jp.apply(verifyResponse, path, function () { return values[rowIndex] })
	}
	return verifyResponse
}

function handleBarcodes(verifyResponse, values, rowIndex, path, req) {

	let barcodePath = path.replace("barcodes", "barcodes[" + 0 + "]")
	if (path.includes("customerReferenceId")) {
		values[rowIndex] = req.body.customerReferenceId
	}
	jp.apply(verifyResponse, barcodePath, function () { return values[rowIndex] })

	return verifyResponse
}

function isErrorOrInvalid(response) {
	return (response.processingInfo.status === "ERROR"
		// || (response.verification && !response.verification.verified)
	)
}

function getContentMatrixCoulmnValues(worksheet, address_of_cell) {
	const values = []
	let columnName = Object.keys(worksheet).find(key => worksheet[key].v === address_of_cell)
	if (!columnName) {
		columnName = Object.keys(worksheet).find(key => worksheet[key].v === "USA DL")
	}

	for (let key in worksheet) {
		let rest = key.substring(columnName.length - 1, key.length)
		if (columnName.length === 2) {
			if (key.toString()[0] === columnName[0] && !isNaN(rest.toString())) {
				values.push(worksheet[key].v)
			}
		} else {
			if (key.toString()[0] === columnName[0] && key.toString()[1] === columnName[1] && !isNaN(rest.toString())) {
				values.push(worksheet[key].v)
			}
		}

	}

	return values
}

function getDocumentType(onDeviceClassification, headerDocumentType) {
	switch (onDeviceClassification.documentType) {
		case "PASSPORT":
			return "PP"
		case "DRIVERS_LICENSE":
			return "DL"
		case "IDENTIFICATION_CARD":
			return "ID"
		case "RESIDENCE_PERMIT":
			return "RP"
		default:
			if (headerDocumentType)
				return headerDocumentType
			return "DL"
	}
}

function getDocumentCombination(req, headerDocumentCountry, documentType) {
	let docType = undefined
	let docCountry = undefined
	if (req.body.pages[0] && req.body.pages[0].onDeviceClassification) {
		docType = getDocumentType(req.body.pages[0].onDeviceClassification, documentType)
		docCountry = req.body.pages[0].onDeviceClassification.issuingCountry
	}
	if (docCountry === undefined) {
		if (headerDocumentCountry)
			docCountry = headerDocumentCountry
		else
			docCountry = "USA"
	}
	if (docType === undefined) {
		if (documentType)
			docType = documentType
		else
			docType = "DL"
	}
	return docCountry + " " + docType
}

function handleNotAvailableSources(verifyResponse, docType, body, includeMrz) {
	if (!verifyResponse.extraction || !verifyResponse.extraction.sources) {
		return verifyResponse
	}
	var sources = verifyResponse.extraction.sources
	let length = sources.length
	for (let x = length - 1; x >= 0; x--) {
		if (!sources[x].type) {
			verifyResponse.extraction.sources.splice(x, 1)
		}
	}

	// remove MRZ when docType RP 
	if ((docType.includes("RP") || docType.includes("ID")) && sources.length > 1 && body.pages && body.pages.length == 1 && !includeMrz) {
		if (verifyResponse.extraction.sources[1].type != "BARCODE") {
			verifyResponse.extraction.sources.splice(1, 1)
		}
	}

	return verifyResponse
}


function handleFullNameAndRawAddress(values, rowIndex, path, verifyResponse) {
	if (values[rowIndex] != "CONCAT") {
		return values
	}

	if (path.includes("rawAddress") && verifyResponse.extraction) {
		// j = rowIndex - 7
		let address = verifyResponse.extraction.sources[0].address
		if (path.includes("merged")) {

			address = verifyResponse.extraction.merged.address
		}
		if (address) {

			let rawAddress = address.addressLine1 + " " +
				address.addressLine2 + " " +
				address.addressLine3 + " " +
				address.addressLine4 + " " +
				address.city + " " +
				address.stateProvince + " " +
				address.postalCode + " " +
				address.country
			rawAddress = rawAddress.replace(/test/gi, "")
			rawAddress = rawAddress.replace(/undefined/gi, "")
			values[rowIndex] = rawAddress.replace(/  +/g, " ").trim()
		}

	} else if (path.includes("fullName") && verifyResponse.extraction) {
		// j = rowIndex - 3
		let name = verifyResponse.extraction.sources[0].name
		if (path.includes("merged")) {

			name = verifyResponse.extraction.merged.name
		}
		if (name)
			values[rowIndex] = name.firstName + " " + name.middleName + " " + name.surname

	}

	return values
}

function isExcludedExtraction(req, path) {
	let fields = []
	if (req.body.configuration && req.body.configuration.extraction && req.body.configuration.extraction.action && req.body.configuration.extraction.action == "EXCLUDE") {
		fields = req.body.configuration.extraction.fields
	} else {
		return false
	}

	if (fields.length > 0) {
		for (let index = 0; index < fields.length; index++) {
			if (path.toLowerCase().includes(fields[index].toLowerCase())) {
				return true
			}
		}
	} else {
		return true
	}
	return false
}

function handleExtrationReferenceId(verifyResponse, requestBody, docCombination) {
	let pages = requestBody.pages
	for (let index = 0; index < pages.length; index++) {
		if (verifyResponse.processingInfo.pages[index])
			verifyResponse.processingInfo.pages[index].customerReferenceId = pages[index].customerReferenceId
	}

	if (requestBody.pdf417 && verifyResponse.processingInfo.barcodes) {
		verifyResponse.processingInfo.barcodes[0].customerReferenceId = requestBody.pdf417.customerReferenceId
	} else if (verifyResponse.processingInfo
		&& verifyResponse.processingInfo.pages
		&& verifyResponse.processingInfo.pages.length > 1
		&& verifyResponse.processingInfo.barcodes) {
		verifyResponse.processingInfo.barcodes[0].customerReferenceId = verifyResponse.processingInfo.pages[1].customerReferenceId
	}

	pages = verifyResponse.processingInfo.pages
	if (pages.length == 1
		&& verifyResponse.processingInfo.barcodes
		&& verifyResponse.classification.pages
		&& verifyResponse.classification.pages.length > 1) {
		verifyResponse.classification.pages[1].pageId = verifyResponse.processingInfo.barcodes[0].barcodeId
	}
	for (let index = 0; index < pages.length; index++) {
		if (verifyResponse.classification.pages) {
			verifyResponse.classification.pages[index].pageId = pages[index].pageId
		}

		if (verifyResponse.responseImages && verifyResponse.responseImages.croppedDocument) {
			verifyResponse.responseImages.croppedDocument[index].referenceId = pages[index].pageId
		}
	}

	if (verifyResponse.responseImages && pages && pages.length > 0) {
		if (verifyResponse.responseImages.croppedPortrait)
			verifyResponse.responseImages.croppedPortrait.referenceId = pages[0].pageId
		if (verifyResponse.responseImages.croppedSignature)
			verifyResponse.responseImages.croppedSignature.referenceId = pages[0].pageId
	}

	if (verifyResponse.extraction) {
		verifyResponse.extraction.merged.referenceId = undefined
		verifyResponse.extraction.merged.type = undefined
		let sources = verifyResponse.extraction.sources

		let pageIndex = 0
		if (sources.length > 0) {
			for (let index = 0; index < sources.length; index++) {
				if (sources[index].type === "OCR"
					&& verifyResponse.processingInfo
					&& verifyResponse.processingInfo.pages[0]) {
					sources[index].referenceId = verifyResponse.processingInfo.pages[0].pageId
				}
				if (sources[index].type == "BARCODE") {
					if (verifyResponse.processingInfo.barcodes
						&& verifyResponse.processingInfo.barcodes.length > 0) {
						sources[index].referenceId = verifyResponse.processingInfo.barcodes[0].barcodeId
						return verifyResponse
					}
					else {
						pageIndex = 1
					}
				} else if (sources[index].type == "MRZ") {
					let combinations = ["FRA DL", "FRA ID", "IRL DL", "NLD DL"]
					if (!(docCombination.includes("PP") || combinations.includes(docCombination))) {

						pageIndex = 1
					}
				}
				if (verifyResponse.processingInfo.pages[pageIndex])
					sources[index].referenceId = verifyResponse.processingInfo.pages[pageIndex].pageId

			}
		}

	}



	return verifyResponse

}

function handleClassificationPages(verifyResponse) {
	if ((verifyResponse.classification &&
		verifyResponse.classification.idDocument &&
		verifyResponse.classification.idDocument.pages.length > 1)) {
		let pages = verifyResponse.classification.idDocument.pages
		for (let index = 0; index < pages.length; index++) {
			if (pages[index].documentSection == undefined)
				pages.splice(index, 1)

		}
	}

	return verifyResponse
}
export const VerifyHandler = verifyHandler
