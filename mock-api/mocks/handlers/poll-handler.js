// eslint-disable-next-line no-unused-vars
import AsyncHandler from "../response-builder/async-response.js"

async function pollHandler(c, req, res) {

	let clientId = res.locals.clientId
	let timers = AsyncHandler.getPendingTimers(clientId)
	let status = req.query.requestStatus

	let startDate = req.query.requestDateStart ? new Date(req.query.requestDateStart) : undefined
	let endDate = req.query.requestDateEnd ? new Date(req.query.requestDateEnd) : undefined
	let expiryStartDate = req.query.requestExpiryStart ? new Date(req.query.requestExpiryStart) : undefined
	let expiryEndDate = req.query.requestExpiryEnd ? new Date(req.query.requestExpiryEnd) : undefined

	let maxCount = req.query.responseMaxCount === undefined || req.query.responseMaxCount === null || req.query.responseMaxCount === "" ? undefined : req.query.responseMaxCount
	let isResponseRetrieved = req.query.responseRetrieved

	let response = timers.filter(timer => {
		if(status === "COMPLETE") {
			return timer.pendingTimer.isComplete()
		} else if (status === "PENDING") {
			return !timer.pendingTimer.isComplete()
		} else {
			return status === "" || status === undefined
		}
	})
		.filter(timer => (startDate <= timer.createdDateTime || startDate === undefined))
		.filter(timer => (endDate >= timer.createdDateTime || endDate === undefined))
		.filter(timer => (expiryStartDate >= timer.expiryDateTime || expiryStartDate === undefined))
		.filter(timer => (expiryEndDate <= timer.expiryDateTime || expiryEndDate === undefined))
		.filter(timer => {
			if(isResponseRetrieved === true) {
				return timer.pendingTimer.isResponseRetrieved()
			} else if (isResponseRetrieved === false) {
				return !timer.pendingTimer.isResponseRetrieved()
			} else {
				return true
			}
		})
		.sort(timer => timer.createdDateTime)
		.slice(0, maxCount)
		.map(timer => (
			{
				service: "VERIFY",
				requestId: timer.requestId,
				customerReferenceId: timer.customerReferenceId,
				retrievalId: timer.retrievalId,
				processingStatus: timer.pendingTimer.isComplete() ? "COMPLETE" : "PENDING",
				requestDate: timer.createdDateTime.toISOString(),
				expiryDate:  timer.expiryDateTime.toISOString(),
				responseRetrieved: timer.pendingTimer.isError() || timer.pendingTimer.isResponseRetrieved()
			}))

	return response
}

export const PollHandler = pollHandler
