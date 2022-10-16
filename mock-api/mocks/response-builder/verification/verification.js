export const DocFraudReason = {
	BARCODE: "BARCODE",
	MRZ: "MRZ",
	BIODATA: "Biodata",
	BIODATA_CONSISTENCY: "BIODATA CONSISTENCY",
	BIODATA_FONTS: "BIODATA FONTS",
	DOCUMENT_STRUCTURE: "DOCUMENT STRUCTURE",
	GENERAL_FRAUD: "GENERAL FRAUD",
	INCOMPLETE_EVIDENCE: "INCOMPLETE EVIDENCE",
	KNOWN_FRAUD: "KNOWN FRAUD",
	MRZ_FONTS: "MRZ FONTS",
	MRZ_CHECK_DIGIT: "MRZ CHECK DIGIT",
	NFC: "NFC",
	PHOTOCOPY: "PHOTOCOPY",
	PORTRAIT_ZONE: "PORTRAIT ZONE",
	SECURITY_FEATURES: "SECURITY FEATURES",
	SIGNATURE: "Signature",
	STRUCTURE: "Structure"
}

export const BiometricFraudReason = {
	FACE_COMPARISON: "FACE COMPARISON",
	FACE_LIVENESS: "FACE LIVENESS"
}

class Verification {
	constructor() {
		this.verified = true
		this.confidence = 950

		let docVerification = new SubVerification()
		docVerification.verified = true
		docVerification.fraudReasons = []
		this.documentVerification = docVerification

		let biometricVerification = new SubVerification()
		biometricVerification.verified = true
		biometricVerification.fraudReasons = []
		this.biometricVerification = biometricVerification
	}

	addDocFraudVerification(reason, confidence) {
		this.verified = false
		if (this.confidence === undefined || confidence < this.confidence){
			this.confidence = confidence
		}
        
		this.documentVerification.verified = false
		if (!this.documentVerification.fraudReasons.includes(reason)) {
			this.documentVerification.fraudReasons.push(reason)
		}
	}

	addBiometricFraudVerification(reason, confidence) {
		this.verified = false
		if (this.confidence === undefined || confidence < this.confidence){
			this.confidence = confidence
		}

		this.biometricVerification.verified = false
		this.biometricVerification.fraudReasons.push(reason)
	}
}

class SubVerification {
	constructor() {
		this.verified = true
		this.fraudReasons = undefined
	}
}

export default Verification
