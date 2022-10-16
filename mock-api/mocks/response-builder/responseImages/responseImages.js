class ResponseImages {

	constructor() {
		this.croppedPortrait = undefined
		this.croppedSignature = undefined
		this.croppedDocument = undefined
	}


	addCroppedPortrait() {
		this.croppedPortrait = {
			"referenceId": "4c52b0ef-aa28-4675-85d7-207b00486520",
			"data": "SGVsbG8sIFdvcmxkIQ=="
		}
	}

	addCroppedSignature() {
		this.croppedSignature = {
			"referenceId": "4c52b0ef-aa28-4675-85d7-207b00486520",
			"data": "SGVsbG8sIFdvcmxkIQ=="
		}
	}

	addCroppedDocument() {
		this.croppedDocument = [
			{
				"referenceId": "4c52b0ef-aa28-4675-85d7-207b00486520",
				"data": "SGVsbG8sIFdvcmxkIQ=="
			},
			{
				"referenceId": "4c52b0ef-aa28-4675-85d7-207b00486520",
				"data": "SGVsbG8sIFdvcmxkIQ=="
			}
		]
	}
}

export default ResponseImages
