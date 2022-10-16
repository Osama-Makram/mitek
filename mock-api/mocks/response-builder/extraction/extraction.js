class Extraction {
	constructor() {
		this.merged = new ExtractedData()
		this.sources = []
	}

	includeAll() {
		this.merged.includeAll()
		this.addExtractedOCR()
	}

	excludeDateOfBirth() {
		this.merged.excludeDateOfBirth()
		this.sources = [this.merged]
	}

	excludeDocumentNumber() {
		this.merged.excludeDocumentNumber()
		this.sources = [this.merged]
	}

	excludeName() {
		this.merged.excludeName()
		this.sources = [this.merged]
	}

	includeDateOfBirth() {
		this.merged.includeDateOfBirth()
		this.sources = [this.merged]
	}

	includeDocumentNumber() {
		this.merged.includeDocumentNumber()
		this.sources = [this.merged]
	}

	includeName() {
		this.merged.addName()
		this.sources = [this.merged]
	}

	addExtractedOCR() {
		let extractedOCR = new ExtractedData()
		extractedOCR.includeAll()
		this.sources.push(extractedOCR)
	}

	addExtractedBarcode() {
		let extractedBarcode = new ExtractedData()
		extractedBarcode.includeAll()
		extractedBarcode.type = "BARCODE"

		this.sources.push(extractedBarcode)
	}

	addExtractedMRZ(referenceId) {
		let extractedMRZ = new ExtractedData()
		extractedMRZ.includeAll(referenceId)
		extractedMRZ.type = "MRZ"
		extractedMRZ.addMRZInfo()

		this.sources.push(extractedMRZ)
	}
}

class ExtractedData {
	constructor() {
		this.referenceId = undefined
		this.name = undefined
		this.address = undefined
		this.personalInfo = undefined
		this.documentInfo = undefined
		this.mrzInfo = undefined
	}

	includeAll() {
		this.addReferenceId()
		this.addType()
		this.addName()
		this.addAddress()
		this.addPersonalInfo()
		this.addDocumentInfo()
	}

	excludeDateOfBirth() {
		this.addPersonalInfo()
		this.personalInfo.dateOfBirth = undefined
	}

	excludeDocumentNumber() {
		this.addDocumentInfo()
		this.documentInfo.documentNumber = undefined
	}

	excludeName() {
		this.name = undefined
	}

	includeDateOfBirth() {
		this.addPersonalInfo()
		this.personalInfo.gender = undefined
	}

	includeDocumentNumber() {
		this.documentInfo = { documentNumber: "99-765-4321" }
	}

	addReferenceId() {
		this.referenceId = "4c52b0ef-aa28-4675-85d7-207b00486520"
	}

	addType() {
		this.type = "OCR"
	}

	addName() {
		this.name = {
			"fullName": "John P Smith",
			"firstName": "John",
			"middleName": "P",
			"surname": "Smith",
		}
	}

	addAddress() {
		this.address = {
			addressLine1: "test",
			addressLine2: "test",
			addressLine3: "test",
			addressLine4: "test",
			rawAddress: "test",
			city: "test",
			stateProvince: "test",
			postalCode: "test",
			country: "test",
		}
	}

	addPersonalInfo() {
		this.personalInfo = {
			sex: "M",
			dateOfBirth: "1986-08-20",
			eyeColor: "BLU",
			hairColor: "BRN",
			height: "070 IN",
			nationality: "USA",
			placeOfBirth: "SAN DIEGO",
			personalGovId: "9876543210"
		}
	}

	addDocumentInfo() {
		this.documentInfo = {
			dateOfExpiry: "2026-05-31",
			dateOfIssue: "2021-06-01",
			countryCode: "USA",
			documentDiscriminator: "06/14/201951930/DDFD/22",
			documentNumber: "1234567890",
			inventoryControlNumber: "ABC123EFG456",
			issuingCountry: "USA",
			licenseClass: "C",

		}
	}

	addMRZInfo() {
		this.mrzInfo = {
			mrzLine1: "",
			mrzLine2: "",
			mrzLine3: ""
		}
	}
}

export default Extraction
