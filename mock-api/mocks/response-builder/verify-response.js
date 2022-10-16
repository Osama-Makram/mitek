import ProcessingInfo from "./processingInfo/processingInfo.js"
import Verification, { DocFraudReason, BiometricFraudReason } from "./verification/verification.js"
import Classification from "./classification/classification.js"
import Extraction from "./extraction/extraction.js"
import ResponseImages from "./responseImages/responseImages.js"
import jp from "jsonpath"

class VerifyResponse {
	constructor(customerReferenceId, requestId) {

		this.requestId = requestId
		this.customerReferenceId = customerReferenceId
		this.createdDateTime = new Date().toISOString()

		this.processingInfo = new ProcessingInfo()

		this.verification = new Verification()

		this.extraction = new Extraction()

		this.classification = new Classification()

		this.configuration = {
			"verification": {
				docVerify: true,
				agentReview: false,
				verifyLevel: 1,
				faceComparison: true
			},
			"extraction": {
				fields: ["Surname", "City", "DateOfBirth"]
			}
		}

		this.responseImages = new ResponseImages()
	}

	setAgentReview(reviewed) {
		this.configuration.verification.agentReview = reviewed
	}

	addDocumentImageEvidence(customerReferenceId) {
		this.processingInfo.addIdDocumentPage(customerReferenceId)
	}

	addBarcodeEvidence(customerReferenceId) {
		this.processingInfo.addBarcode(customerReferenceId)
	}

	addDocFraud(reason, confidence) {
		this.verification.addDocFraudVerification(reason, confidence)
	}

	addBiometricFraud(reason, confidence) {
		this.verification.addBiometricFraudVerification(reason, confidence)
	}

	excludeAll() {
		this.extraction = undefined
	}

	excludeDateOfBirth() {
		this.extraction.excludeDateOfBirth()
	}

	excludeDocumentNumber() {
		this.extraction.excludeDocumentNumber()
	}

	excludeName() {
		this.extraction.excludeName()
	}

	includeAll() {
		this.extraction.includeAll()
	}

	includeDateOfBirth() {
		this.extraction.includeDateOfBirth()
	}

	includeDocumentNumber() {
		this.extraction.includeDocumentNumber()
	}

	includeName() {
		this.extraction.includeName()
	}

	processAcceptanceFailure() {
		this.processingInfo.status = "FAILED"
		this.processingInfo.addFailedImagePage()

		this.classification = undefined
		this.extraction = undefined
		this.verification = undefined
	}

	processClassificationFailure() {
		this.processingInfo.status = "FAILED"
		this.processingInfo.addFailedIdDocumentPage()

		this.classification = undefined
		this.extraction = undefined
		this.verification = undefined
	}

	processExtractionFailure() {
		this.processingInfo.status = "FAILED"
		this.processingInfo.addFailedExtractionPage()

		this.extraction = undefined
		this.verification = undefined
	}

	addResponseImageCroppedPortrait() {
		this.responseImages.addCroppedPortrait()
	}

	addResponseImageCroppedSignature() {
		this.responseImages.addCroppedSignature()
	}

	addResponseImageCroppedDocument() {
		this.responseImages.addCroppedDocument()
	}

	addClassificationPage(pageId) {
		this.classification.addClassificationPage(pageId)
	}

	buildResponse(headers, body, includeMrz, documentType) {
		if (headers === undefined) {
			this.includeAll()
			return
		}

		if (headers["returndocumentimageevidence"] === "true") {
			let i = 0
			do {
				this.addDocumentImageEvidence(this.customerReferenceId)
				this.addClassificationPage(this.processingInfo.pages[i].pageId)
				i++
			} while (i < body.pages.length)
		}

		if (headers["returnbarcodeevidence"] === "true"
			&& (body.pdf417 || body.pages.length > 1)) {
			this.addBarcodeEvidence()
			if (body.pages.length === 1 && body.pdf417) {
				this.addClassificationPage(this.processingInfo.barcodes[0].barcodeId)
			}
		}

		if (headers["acceptancefailure"] === "true") {
			this.processAcceptanceFailure()
			this.addExtractionAction(body)
			this.getConfigurationExtractedFields(body)
			return
		}

		if (headers["classificationfailure"] === "true") {
			this.processClassificationFailure()
			this.addExtractionAction(body)
			this.getConfigurationExtractedFields(body)
			return
		}

		if (headers["extractionfailure"] === "true") {
			this.processExtractionFailure()
			this.addExtractionAction(body)
			this.getConfigurationExtractedFields(body)
			return
		}

		if (headers["docfraudbarcode"] === "true") {
			this.addDocFraud(DocFraudReason.BARCODE, 0)
		}

		if (headers["docfraudbiodataconsistency"] === "true") {
			this.addDocFraud(DocFraudReason.BIODATA_CONSISTENCY, 200)
		}

		if (headers["docfraudbiodatafonts"] === "true") {
			this.addDocFraud(DocFraudReason.BIODATA_FONTS, 300)
		}

		if (headers["docfraudgeneralfraud"] === "true") {
			this.addDocFraud(DocFraudReason.GENERAL_FRAUD, 499)
		}

		if (headers["docfraudincompleteevidence"] === "true") {
			this.addDocFraud(DocFraudReason.INCOMPLETE_EVIDENCE, 0)
		}

		if (headers["docfraudknownfraud"] === "true") {
			this.addDocFraud(DocFraudReason.KNOWN_FRAUD, 0)
		}

		if (headers["docfraudmrzfonts"] === "true") {
			this.addDocFraud(DocFraudReason.MRZ_FONTS, 299)
		}

		if (headers["docfraudmrzcheckdigit"] === "true") {
			this.addDocFraud(DocFraudReason.MRZ_CHECK_DIGIT, 0)
		}

		if (headers["docfraudnfc"] === "true"
			&& body.nfc
			&& body.nfc.dataGroups
			&& body.nfc.dataGroups.dg1
			&& body.nfc.dataGroups.dg2) {
			this.addDocFraud(DocFraudReason.NFC, 0)
		}

		if (headers["docfraudphotocopy"] === "true") {
			this.addDocFraud(DocFraudReason.PHOTOCOPY, 199)
		}

		if (headers["docfraudportraitzone"] === "true") {
			this.addDocFraud(DocFraudReason.PORTRAIT_ZONE, 399)
		}

		if (headers["docfraudsecurityfeatures"] === "true") {
			this.addDocFraud(DocFraudReason.SECURITY_FEATURES, 99)
		}

		if (headers["docfrauddocstructure"] === "true") {
			this.addDocFraud(DocFraudReason.DOCUMENT_STRUCTURE, 0)
		}

		if (headers["biometricfraudfacecomparison"] === "true" && body.selfie) {
			this.addBiometricFraud(BiometricFraudReason.FACE_COMPARISON, 349)
		}

		if (headers["biometricfraudfaceliveness"] === "true" && body.selfie) {
			this.addBiometricFraud(BiometricFraudReason.FACE_LIVENESS, 249)
		}

		if (body.configuration && body.configuration.responseImages && body.configuration.responseImages.includes("CroppedPortrait")) {
			this.addResponseImageCroppedPortrait()
		}

		if (body.configuration && body.configuration.responseImages && body.configuration.responseImages.includes("CroppedSignature")) {
			this.addResponseImageCroppedSignature()
		}

		if (body.configuration && body.configuration.responseImages && body.configuration.responseImages.includes("CroppedDocument")) {
			this.addResponseImageCroppedDocument()
		}

		if (body.configuration
			&& body.configuration.responseImages
			&& body.configuration.responseImages.length > 0) {
			this.configuration.responseImages = body.configuration.responseImages
		}

		if (!body.configuration
			|| !body.configuration.verification
			|| body.configuration.verification.faceComparison === false) {
			this.verification.biometricVerification = undefined
			this.verification.confidence = 950
			this.verification.verified = true
		}

		if (headers["extractionoperation"] === "exclude") exclude: {
			if (headers["extractionitems"] === undefined) {
				this.includeAll()
				break exclude
			}

			let extractionItems = headers["extractionitems"]
			this.includeAll()

			if (extractionItems.includes("all")) {
				this.excludeAll()
				break exclude
			}

			if (extractionItems.includes("dateofbirth")) {
				this.excludeDateOfBirth()
			}

			if (extractionItems.includes("name")) {
				this.excludeName()
			}

			if (extractionItems.includes("documentnumber")) {
				this.excludeDocumentNumber()
			}
		}
		else if (headers["extractionoperation"] === "include") include: {
			if (headers["extractionitems"] === undefined) {
				this.includeAll()
				break include
			}

			let extractionItems = headers["extractionitems"]

			if (extractionItems.includes("all")) {
				this.includeAll()
				break include
			}

			if (extractionItems.includes("dateofbirth")) {
				this.includeDateOfBirth()
			}

			if (extractionItems.includes("name")) {
				this.includeName()
			}

			if (extractionItems.includes("documentnumber")) {
				this.includeDocumentNumber()
			}
		} else {
			this.includeAll()
		}

		const isBarcodeStringExist = jp.query(body, "$..barcodeString").length > 0
		const imagesPopulated = jp.query(body, "$.pages..image").length > 1

		if (isBarcodeStringExist || imagesPopulated) {
			this.extraction.addExtractedBarcode("test-barcode-reference-id")
		}

		if (imagesPopulated ||
			(body.pages[0].onDeviceClassification && body.pages[0].onDeviceClassification.documentType === "PASSPORT") ||
			documentType == "PP" ||
			includeMrz) {
			this.extraction.addExtractedMRZ("test-mrz-reference-id")
		}

		this.addExtractionAction(body)

		if (body.configuration
			&& body.configuration.extraction
			&& body.configuration.extraction.fields.length > 0) {
			if (this.configuration.extraction.action === "EXCLUDE") {
				let excludedFields = body.configuration.extraction.fields.map(key => key.toLowerCase())
				this.excludeFields(excludedFields)
			} else {
				let includedFields = body.configuration.extraction.fields.map(key => key.toLowerCase())
				this.includeFields(includedFields)
			}
			this.configuration.extraction.fields = body.configuration.extraction.fields
		} else {
			if (this.configuration.extraction.action === "EXCLUDE") {
				this.extraction = JSON.parse(JSON.stringify(this.extraction, (key, value) => {
					if (typeof value === "string") {
						return "REDACTED"
					} else {
						return value
					}
				}))
			}
			this.configuration.extraction.fields = ["ALL"]
		}

		if (body.configuration && body.configuration.verification && !body.configuration.verification.docVerify) {
			this.verification = undefined
		}
	}

	addExtractionAction(body) {
		if (body.configuration && body.configuration.extraction
			&& body.configuration.extraction.action
			&& body.configuration.extraction.action.toUpperCase() === "EXCLUDE") {
			this.configuration.extraction.action = "EXCLUDE"
		} else {
			this.configuration.extraction.action = "INCLUDE"
		}
	}

	getConfigurationExtractedFields(body) {
		if (body.configuration
			&& body.configuration.extraction
			&& body.configuration.extraction.fields) {
			this.configuration.extraction.fields = body.configuration.extraction.fields
		}
	}

	includeFields(includedFields) {
		for (let i = 0; i < includedFields.length; i++) {
			this.extraction = JSON.parse(JSON.stringify(this.extraction, (key, value) => {
				if (typeof value === "string") {
					if (!includedFields.includes(key.toLowerCase())) {
						return "REDACTED"
					} else {
						return value
					}
				} else {
					return value
				}
			}))
		}
	}

	excludeFields(excludedFields) {
		for (let i = 0; i < excludedFields.length; i++) {
			this.extraction = JSON.parse(JSON.stringify(this.extraction, (key, value) => {
				if (key.toLowerCase() === excludedFields[i]) {
					return "REDACTED"
				} else {
					return value
				}
			}))
		}
	}
}

export default VerifyResponse
