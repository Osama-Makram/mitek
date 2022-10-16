// eslint-disable-next-line no-unused-vars
async function healthHandler(c, req, res) {
	// eslint-disable-next-line no-unused-vars
	const { _status, mock } = c.api.mockResponseForOperation(c.operation.operationId)
	mock.generated_at = req._startTime.toISOString()
	mock.duration_millis = new Date().getTime() - req._startTime.getTime()
	return mock
}

export const HealthHandler = healthHandler