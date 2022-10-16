export const test_request = {
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
				"onDeviceClassification": {
					"documentSection": "FRONT",
					"documentType": "PASSPORT",
					"documentFeatures": [
						"REAL_ID",
						"UNDER_TWENTY_ONE"
					],
					"issuingCountry": "USA",
					"issuingStateProvince": "DL",
					"circulationYear": "2004"
				}
			},
			{
				"customerReferenceId": "8fa85f64-5717-4562-b3fc-2c963f66afa6",
				"image": "SGVsbG8sIFdvcmxkIQ==",
				"onDeviceClassification": {
					"documentSection": "BACK",
					"documentType": "DRIVERS_LICENSE",
					"documentFeatures": [
						"REAL_ID",
						"UNDER_TWENTY_ONE"
					],
					"issuingCountry": "USA",
					"issuingStateProvince": "DL",
					"circulationYear": "2004"
				}
			}
		],
		"pdf417": {
			"customerReferenceId": "13a85f64-5717-4562-b3fc-2c963f66afa6",
			"barcodeString": "I AM A FAKE BARCODE STRING",
			"onDeviceClassification": {
				"documentSection": "BACK",
				"documentType": "DRIVERS_LICENSE",
				"documentFeatures": [],
				"issuingCountry": "USA",
				"issuingStateProvince": "AL",
				"circulationYear": "2004"
			}
		},
		"qr": {
			"customerReferenceId": "13a85f64-5717-4562-b3fc-2c963f66afa6",
			"barcodeString": "I AM A FAKE BARCODE STRING",
		},
		"nfc": {
			"sod": "A312E205468697320697320612074657374205468697320697320612074657374",
			"portrait": "ZmFrZSBuZmMgcG9ydHJhaXQ=",
			"dataGroups": {
				"dg1": "322E205365642075742070657273706963696174697320756E6465206F6D6E6973",
				"dg2": "332E207175616520616220696C6C6F20696E76656E746F726520766572697461746973206574",
				"dg15": "342E2061737065726E6174757220617574206F646974206175742066756769742C20736564"
			},
			"activeAuthInput": {
				"ecdsaPublicKey": "352E206573742C2071756920646F6C6F72656D20697073756D207175696120646F6C6F72",
				"signature": "362E20646F6C6F7265206D61676E616D20616C697175616D2071756165726174",
				"challenge": "372E206C61626F72696F73616D"
			}
		},
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
			"responseImages": [
				"CroppedPortrait",
				"CroppedSignature",
				"CroppedDocument"
			]
		}
	}
}
