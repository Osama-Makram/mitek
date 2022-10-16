import { v4 as uuidv4 } from "uuid"

const FailureReasons = {
	IMAGE_NOT_SHARP: {
		201: "The image is not sharp."
	},
	BARCODE_NOT_PARSABLE: {
		502: "The barcode could not be parsed."
	},
	INVALID_ID_DOC: {
		206: "The type of ID document could not be determined."
	},
	FAILED_EXTRACTION: {
		520: "Extraction acceptance failed"
	}
}

class ProcessingInfo {
	constructor() {
		this.status = "COMPLETED"
		this.pages = []
		this.barcodes = undefined
		this.selfie = new Selfie()
	}

	addIdDocumentPage(customerReferenceId) {
		this.pages.push(new ImagePage(customerReferenceId))
	}

	addFailedImagePage() {
		let page = new ImagePage()
		page["failureReasons"] = FailureReasons.IMAGE_NOT_SHARP
		page.status = "FAILED"
		page.captureDetail = new CaptureDetail()

		this.selfie.status = "FAILED"
		this.selfie.failureReasons = FailureReasons.IMAGE_NOT_SHARP

		for (let i = 0; i < this.pages.length; i++) {
			this.pages[i] = page
		}
		if (this.pages.length === 0) {
			this.pages.push(page)
		}
		// this.pages.push(page)
	}

	addFailedIdDocumentPage() {
		let page = new ImagePage()
		page["failureReasons"] = FailureReasons.INVALID_ID_DOC
		page.status = "FAILED"
		page.captureDetail = new CaptureDetail()

		this.selfie.status = "FAILED"
		this.selfie.failureReasons = FailureReasons.INVALID_ID_DOC

		for (let i = 0; i < this.pages.length; i++) {
			this.pages[i] = page
		}
		if (this.pages.length === 0) {
			this.pages.push(page)
		}
		// this.pages.push(page)
	}

	addFailedExtractionPage() {
		let page = new ImagePage()
		page["failureReasons"] = FailureReasons.FAILED_EXTRACTION
		page.status = "FAILED"
		page.captureDetail = new CaptureDetail()

		this.selfie.status = "FAILED"
		this.selfie.failureReasons = FailureReasons.FAILED_EXTRACTION

		for (let i = 0; i < this.pages.length; i++) {
			this.pages[i] = page
		}
		if (this.pages.length === 0) {
			this.pages.push(page)
		}
		// this.pages.push(page)
	}

	addBarcode(customerReferenceId) {
		if (this.barcodes === undefined){
			this.barcodes = []
		}
		this.barcodes.push(new Barcode(customerReferenceId))
	}
}

class Selfie {
	constructor() {
		this.status = "COMPLETED"
		this.captureDetail = new CaptureDetail()
	}
}

class CaptureDetail {
	constructor() {
		this.method = "MISNAP"
		this.mode = "AUTO"
		this.platform = "MOBILE_WEB"
		this.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X)"
	}
}

class ImagePage {
	constructor(customerReferenceId) {
		this.pageId = uuidv4()
		this.customerReferenceId = customerReferenceId
		this.status = "COMPLETED"
		this.captureDetail = new CaptureDetail()
	}
}

class Barcode {
	constructor(customerReferenceId) {
		this.type = "PDF417"
		this.barcodeId = uuidv4()
		this.customerReferenceId = customerReferenceId
		this.status = "COMPLETED"
	}
}

export default ProcessingInfo
