import axios from "axios";

const artifactoryUrl = "https://trial4p9gnn.jfrog.io";
let apiKey = "";

export async function Login(username, password) {
	apiKey = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

	try {
		const response = await axios.get(
			`${artifactoryUrl}/artifactory/api/system/version`,
			{
				headers: {
					Authorization: `${apiKey}`,
					"Content-Type": "application/json",
				},
			}
		);

		return true;
	} catch (error) {
		console.error("Error:", error.response?.data || error.message);
		return false;
	}
}

export async function GetRequest(url, passMessage, errorMessage, auth) {
	if (!auth) {
		try {
			const response = await axios.get(`${artifactoryUrl}${url}`);
			if (passMessage != "") {
				console.log(passMessage, response.data);
			}
			return response;
		} catch (error) {
			console.error(errorMessage, error.response?.data || error.message);
			return error.response;
		}
	} else {
		try {
			const response = await axios.get(`${artifactoryUrl}${url}`, {
				headers: {
					Authorization: `${apiKey}`,
					"Content-Type": "application/json",
				},
			});
			if (passMessage != "") {
				console.log(passMessage, response.data);
			}
			return response;
		} catch (error) {
			console.error(errorMessage, error.response?.data || error.message);
			return error.response;
		}
	}
}

export async function PutRequest(url, requestBody, passMessage, errorMessage) {
	try {
		const response = await axios.put(`${artifactoryUrl}${url}`, requestBody, {
			headers: {
				Authorization: `${apiKey}`,
				"Content-Type": "application/json",
			},
		});
		if (passMessage != "") {
			console.log(passMessage, response.data);
		}
		return response;
	} catch (error) {
		console.error(errorMessage, error.response?.data || error.message);
		return error.response;
	}
}

export async function PostRequest(url, requestBody, passMessage, errorMessage) {
	try {
		const response = await axios.post(`${artifactoryUrl}${url}`, requestBody, {
			headers: {
				Authorization: `${apiKey}`,
				"Content-Type": "application/json",
			},
		});
		if (passMessage != "") {
			console.log(passMessage, response.data);
		}
		return response;
	} catch (error) {
		console.error(errorMessage, error.response?.data || error.message);
		return error.response;
	}
}

export async function DeleteRequest(url, passMessage, errorMessage) {
	try {
		const response = await axios.delete(`${artifactoryUrl}${url}`, {
			headers: {
				Authorization: `${apiKey}`,
				"Content-Type": "application/json",
			},
		});
		if (passMessage != "") {
			console.log(passMessage, response.data);
		}
		return response;
	} catch (error) {
		console.error(errorMessage, error.response?.data || error.message);
		return error.response;
	}
}
