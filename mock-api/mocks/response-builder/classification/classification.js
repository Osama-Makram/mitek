const DocumentType = {
	PASSPORT: "PASSPORT",
	DRIVERS_LICENSE: "DRIVERS_LICENSE",
	IDENTIFICATION_CARD: "IDENTITY_CARD",
	RESIDENCE_PERMIT: "RESIDENCE_PERMIT",
}

const DocumentFeatures = {
	ENHANCED_DRIVERS_LICENSE: "ENHANCED_DRIVERS_LICENSE",
	REAL_ID: "REAL_ID",
	UNDER_TWENTY_ONE: "UNDER_TWENTY_ONE",
}

class Classification {
	constructor() {
		this.idDocument = {
			documentType: DocumentType.DRIVERS_LICENSE,
			documentFeatures: [
				DocumentFeatures.ENHANCED_DRIVERS_LICENSE,
				DocumentFeatures.REAL_ID,
				DocumentFeatures.ENHANCED_DRIVERS_LICENSE,
			],
			issuingCountry: "USA",
			issuingStateProvince: "CA",
			circulationYear: "2017",
			pages: []
		}
	}

	addClassificationPage(pageId) {
		this.idDocument.pages.push(new Page(pageId))
	}
}

class Page {
	constructor(pageId) {
		this.pageId = pageId
		this.documentSection = "FRONT"
		this.documentType = undefined
		this.documentFeatures = [
			DocumentFeatures.ENHANCED_DRIVERS_LICENSE,
			DocumentFeatures.REAL_ID,
			DocumentFeatures.ENHANCED_DRIVERS_LICENSE,
		]
		this.issuingCountry = "USA"
		this.issuingStateProvince = "CA"
		this.circulationYear = "2017"
	}
}

export default Classification
