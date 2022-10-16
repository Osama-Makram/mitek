// eslint-disable-next-line no-unused-vars
import AsyncHandler from "../response-builder/async-response.js"

async function retrieveHandler(c, req, res) {
	let retrievalId = c.request.params.retrievalId
	let response = AsyncHandler.getReadyResponse(retrievalId)
	if (!response) {
		return res.status(404).json({
			"message": "The result you attempted to retrieve does not exist."
		})
	}

	response = response.response
	return response
}

export const RetrieveHandler = retrieveHandler
