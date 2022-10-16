import uuid from "uuid"

export function serializeJSONToHeaderString(json) {
	let headerString = ""
	for (const [key, value] of Object.entries(json)) {
		headerString = headerString + `${key}=${value},`
	}
	headerString = headerString.slice(0, -1)
    
	return headerString
}

export function findPollingRequest(requestId, response) {
	return response.filter(r => {
		return r.requestId === requestId
	})[0]
}

export function validateMitekHeaderForRequestId(res) {
	const headerValue = res.headers["mitek-request-id"]
	const valid = uuid.validate(headerValue)
	return {
		"valid": valid,
		"value": headerValue
	}
}

export function validateMitekHeaderForServerProcessingTime(res) {
	const headerValue = res.headers["mitek-server-processing-time"]
	const valid = /[0-9]+/.test(headerValue)
	return {
		"valid": valid,
		"value": headerValue
	}
}
