
async function oauth2Token(c, req, res) {

	if (req.body.client_id == "80eccd06-f690-4cc1-afc7-cad76dcb85a3"
            && req.body.client_secret == "secret"
            && req.body.scope == "verify.v4.id-document.manual.write") {

		let token = {
			"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiY2xpZW50SWQiOiI4MGVjY2QwNi1mNjkwLTRjYzEtYWZjNy1jYWQ3NmRjYjg1YTMiLCJpYXQiOjE2MjYwOTk2MjksImVhdCI6MTYyNjEwNjgyOX0.-DYPvekpIWV6jKqCF00cS8x0v-Yj6-wk6JBy3Quu0Lo",
			"expires_in": 3600,
			"token_type": "bearer",
			"scope": req.body.scope
		}
		return res.status(200).json(token)
	}

	if (req.query.client_id != "80eccd06-f690-4cc1-afc7-cad76dcb85a3") {
		let error = {
			"error": "invalid_client",
			"error_description": "Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method).",
			"status_code": 401
		}
		return res.status(401).json(error)
	}

	if (req.query.client_secret != "secret") {
		let error = {
			"error": "invalid_client",
			"error_description": "Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method).",
			"status_code": 401
		}
		return res.status(401).json(error)
	}

	if (req.query.scope != "verify.v4.id-document.manual.write") {
		let error = {
			"error": "invalid_scope",
			"error_description": "The requested scope is invalid, unknown, or malformed.",
			"status_code": 400
		}
		return res.status(400).json(error)
	}

	let token = {
		"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiY2xpZW50SWQiOiI4MGVjY2QwNi1mNjkwLTRjYzEtYWZjNy1jYWQ3NmRjYjg1YTMiLCJpYXQiOjE2MjYwOTk2MjksImVhdCI6MTYyNjEwNjgyOX0.-DYPvekpIWV6jKqCF00cS8x0v-Yj6-wk6JBy3Quu0Lo",
		"expires_in": 3600,
		"token_type": "bearer",
		"scope": req.query.scope
	}
	return res.status(200).json(token)
}

export const Oauth2TokenHandler = oauth2Token
