export const verify_auto_with_only_required_fields_request = {
	method: "POST",
	path: "/verify",
	headers: {
		"x-simulated-content": {
			"returnDocumentImageEvidence": "false",
			"returnBarcodeEvidence": "false",
			"docFraudPortrait": "false",
			"docFraudStructure": "false",
			"docFraudBioData": "false",
			"biometricFraudFaceComparison": "false",
			"biometricFraudFaceLiveness": "false",
			"acceptanceFailure": "false",
			"extractionFailure": "false",
			"classificationFailure": "false",
			"forceSynchronous": "false"
		},
		"Content-Type": "application/json",
		"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiY2xpZW50SWQiOiI4MGVjY2QwNi1mNjkwLTRjYzEtYWZjNy1jYWQ3NmRjYjg1YTMiLCJpYXQiOjE2MjYwOTk2MjksImVhdCI6MTYyNjEwNjgyOX0.-DYPvekpIWV6jKqCF00cS8x0v-Yj6-wk6JBy3Quu0Lo",
	},
	query: { "format": "json" },
	body: {
		"customerReferenceId": "2fa85f64-5717-4562-b3fc-2c963f66afa6",
		"pages": [
			{
				"customerReferenceId": "6fa85f64-5717-4562-b3fc-2c963f66afa6",
				"image": "SGVsbG8sIFdvcmxkIQ==",
			},
			{
				"customerReferenceId": "8fa85f64-5717-4562-b3fc-2c963f66afa6",
				"image": "SGVsbG8sIFdvcmxkIQ==",
			}
		],
		"selfie": "SSBhbSBhIGZha2Ugc2VsZmll",
		"configuration": {
			"verification": {
				"docVerify": true,
				"verifyLevel": 1,
				"agentReview": false,
				"faceComparison": true
			},
			"extraction": {
				"action": "EXCLUDE",
				"fields": [
					"Surname",
					"City",
					"DateOfBirth"
				]
			},
		}
	}
}
