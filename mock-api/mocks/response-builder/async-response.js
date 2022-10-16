class SingletonAsyncHandler {
	constructor() {
		this.verifyResponses = []
		this.readyResponses = []
		this.pendingTimers = []
	}

	addVerifyResponse(retrievalId, response) {
		let taggedResponse = {
			retrievalId: retrievalId,
			response: response
		}
		this.verifyResponses.push(taggedResponse)
	}

	setPendingTimer(timerVars) {
		timerVars["pendingTimer"] = new PendingTimer(timerVars.time)
		this.pendingTimers.push(timerVars)

		let readyRes = this.verifyResponses.filter(res => res.retrievalId === timerVars.retrievalId)[0]
		const verification = JSON.parse(JSON.stringify(readyRes.response.verification))
		readyRes.response.verification = undefined
		this.readyResponses.push(readyRes)
		timerVars.pendingTimer.startCountDown(() => {
			let response = this.verifyResponses.filter(response => {
				timerVars.pendingTimer.setIsError(
					response.response.processingInfo.status === "ERROR"
					|| (response.response.verification && !response.response.verification.verified)
				)
				return response.retrievalId === timerVars.retrievalId
			})[0]
			this.setCompleteStatus(response)
			response.response.verification = verification
		})
	}

	setCompleteStatus(response) {
		response.response.processingInfo.status = "COMPLETED"
		if (response.response.processingInfo.pages)
			response.response.processingInfo.pages.every(page => page.status = "COMPLETED")
		if (response.response.processingInfo.barcodes)
			response.response.processingInfo.barcodes.every(barcode => barcode.status = "COMPLETED")
		response.response.processingInfo.selfie.status = "COMPLETED"
	}

	setPendingStatus(response) {
		response.processingInfo.status = "PENDING"
		if (response.processingInfo.pages)
			response.processingInfo.pages.every(page => page.status = "PENDING")
		if (response.processingInfo.barcodes)
			response.processingInfo.barcodes.every(barcode => barcode.status = "PENDING")
		response.processingInfo.selfie.status = "PENDING"
	}

	getReadyResponse(retrievalId) {
		let response = this.readyResponses.filter(response => {
			return response.retrievalId === retrievalId
		})[0]
		let timer = this.pendingTimers.filter(timer => timer.retrievalId === retrievalId)
		if (timer.length > 0 && timer[0].pendingTimer.isComplete()) {
			this.pendingTimers.filter(timer => timer.retrievalId === retrievalId)[0].pendingTimer.responseRetrieved = true
		}
		return response
	}

	getPendingTimers(clientId) {
		return this.pendingTimers.filter(timer => {
			return timer["clientId"] === clientId
		})
	}
}

class PendingTimer {
	constructor(time) {
		this.timeLeft = time
		this.complete = false
		this.error = false
		this.responseRetrieved = false
	}

	async startCountDown(callback) {
		while (this.timeLeft > 0) {
			this.timeLeft = this.timeLeft - 1
			await this.sleep(1000)
		}
		this.complete = true
		callback()
	}

	isComplete() {
		return this.complete
	}

	isResponseRetrieved() {
		return this.responseRetrieved
	}

	setIsError(isError) {
		this.error = isError
	}

	isError() {
		return this.error
	}

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms))
	}
}

const instance = new SingletonAsyncHandler()
Object.freeze(instance)

export default instance
