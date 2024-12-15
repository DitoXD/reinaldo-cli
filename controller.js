import inquirer from "inquirer";
import * as _router from "./routes.js";

let newUser = {};
let updatedConfig = {};
let currentUser = {};

let repositoryConfig = {
	key: "",
	rclass: "", // "local", "remote", "virtual"
	packageType: "", //"alpine"|"cargo"|"composer"|"bower"|"chef"|"cocoapods"|"conan"|"conda"|"cran"|"debian"|"docker"|"helm"|"helmoci"|"huggingfaceml"|"gems"|"gitlfs"|"go"|"gradle"|"ivy"|"maven"|"npm"|"nuget"|"oci"|"opkg"|"pub"|"puppet"|"pypi"|"rpm"|"sbt"|"swift"|"terraform"|"terraformbackend"|"vagrant"|"yum"|"generic"
	description: "",
};

let packageTypes = [
	"alpine",
	"cargo",
	"composer",
	"bower",
	"chef",
	"cocoapods",
	"conan",
	"conda",
	"cran",
	"debian",
	"docker",
	"helm",
	"helmoci",
	"huggingfaceml",
	"gems",
	"gitlfs",
	"go",
	"gradle",
	"ivy",
	"maven",
	"npm",
	"nuget",
	"oci",
	"opkg",
	"pub",
	"puppet",
	"pypi",
	"rpm",
	"sbt",
	"swift",
	"terraform",
	"terraformbackend",
	"vagrant",
	"yum",
	"generic",
];

async function menu() {
	inquirer
		.prompt([
			{
				type: "list",
				name: "menuSelection",
				choices: [
					"System Ping",
					"System Version",
					"Create User",
					"Delete User",
					"Get Storage Info",
					"Create Repository",
					"Update Repository",
					"List repositories",
					"Exit",
				],
				message:
					"★ Welcome to the CompuZign CLI Take Home Project ★\n\nSelect an option from the menu below:\n",
				default: "System Ping",
			},
		])
		.then(async (answer) => {
			console.clear();
			if (answer.menuSelection == "System Ping") {
				await SystemPing();
			} else if (answer.menuSelection == "System Version") {
				await SystemVersion();
			} else if (answer.menuSelection == "Get Storage Info") {
				await GetStorageInfo();
			} else if (answer.menuSelection == "Create Repository") {
				await CreateRepository();
			} else if (answer.menuSelection == "Create User") {
				await CreateUser();
			} else if (answer.menuSelection == "Delete User") {
				await DeleteUser();
			} else if (answer.menuSelection == "Update Repository") {
				await UpdateRepository();
			} else if (answer.menuSelection == "List repositories") {
				await ListRepositories();
			} else if (answer.menuSelection == "Exit") {
				console.log("Thanks for using the Compuzign CLI Take Home Project.");
				setTimeout(() => {
					process.exit(0);
				}, 1500);
			}

			setTimeout(() => {
				console.log("Returning to menu in 5 seconds.");
			}, 2000);
			setTimeout(menu, 5000);
		});
}

async function ListRepositories() {
	await _router.GetRequest(
		`/artifactory/api/repositories`,
		"Repositories:",
		"Error fetching repositories:",
		true
	);
}

async function SystemPing() {
	await _router.GetRequest(
		`/artifactory/api/system/ping`,
		"System Ping responding:",
		"Error performing system ping:",
		false
	);
}

async function SystemVersion() {
	await _router.GetRequest(
		`/artifactory/api/system/version`,
		"System Version:",
		"Error fetching system version:",
		true
	);
}

async function GetStorageInfo() {
	await _router.GetRequest(
		`/artifactory/api/storageinfo`,
		"Storage Information:",
		"Error fetching storage information:",
		true
	);
}

async function getRepoKey() {
	await inquirer
		.prompt([
			{
				type: "input",
				name: "key",
				message: "Please enter the key (name) for the repository",
			},
		])
		.then(async (answer) => {
			repositoryConfig["key"] = answer.key;
			await getRepoClass();
		});
}

async function getRepoClass() {
	await inquirer
		.prompt([
			{
				type: "list",
				name: "class",
				choices: ["local", "remote", "virtual"],
				message: "Please select a repository classification",
				default: "local",
			},
		])
		.then(async (answer) => {
			repositoryConfig["rclass"] = answer.class;
			if (answer.class == "local") {
				await getRepoPType();
			} else if (answer.class == "remote") {
				await getRepoURL();
			} else if (answer.class == "virtual") {
				await getRepoRepositories();
			}
		});
}

async function getRepoURL() {
	await inquirer
		.prompt([
			{
				type: "input",
				name: "url",
				message: "Please enter the URL for the remote repository",
			},
		])
		.then(async (answer) => {
			repositoryConfig["url"] = answer.url;
			await getRepoPType();
		});
}

async function getRepoRepositories() {
	let choices = [];

	const response = await _router.GetRequest(
		`/artifactory/api/repositories`,
		"Repositories:",
		"Error fetching repositories:",
		true
	);

	response.data.forEach((repo) => {
		choices.push(repo.key);
	});

	if (choices == []) {
		console.log(
			"No repositories to be added to this virtual Repository. Moving to next step."
		);
		await getRepoPType();
	}

	await inquirer
		.prompt([
			{
				type: "checkbox",
				name: "repos",
				choices: choices,
				message:
					"Please select the repositories to be virtual. Press enter to select none.",
				required: true,
			},
		])
		.then(async (answer) => {
			repositoryConfig["repositories"] = answer.repos;
			await getRepoPType();
		});
}

async function getRepoPType() {
	await inquirer
		.prompt([
			{
				type: "list",
				name: "type",
				choices: packageTypes,
				message: "Please select a repository package type",
				default: "generic",
			},
		])
		.then(async (answer) => {
			repositoryConfig["packageType"] = answer.type;
			await getRepoDescription();
		});
}

async function getRepoDescription() {
	await inquirer
		.prompt([
			{
				type: "input",
				name: "desc",
				message: "Please enter a description for repository",
			},
		])
		.then((answer) => {
			repositoryConfig["description"] = answer.desc;
		});
}

async function CreateRepository() {
	await getRepoKey();

	await _router.PutRequest(
		`/artifactory/api/repositories/${repositoryConfig.key}`,
		repositoryConfig,
		"Repository created successfully:",
		"Error creating repository:"
	);
}

async function getRepoToUpdate() {
	let choices = [];
	let repoList = [];

	let count = 1;

	const response = await _router.GetRequest(
		`/artifactory/api/repositories`,
		"",
		"Error fetching repositories:",
		true
	);

	repoList = response.data;
	response.data.forEach((repo) => {
		choices.push(count + ". " + repo.key);
		count++;
	});

	if (choices == []) {
		console.log("No repositories found. Returning to menu.");
	}

	await inquirer
		.prompt([
			{
				type: "list",
				name: "repo",
				choices: choices,
				message: "Please select the repositories to be updated",
				default: choices[0],
			},
		])
		.then(async (answer) => {
			let repoString = answer.repo.split(".")[0];
			updatedConfig = repoList[parseInt(repoString) - 1];
			console.clear();
			console.log(updatedConfig);
			await getUpdatedDescription();
		});
}

async function getUpdatedDescription() {
	await inquirer
		.prompt([
			{
				type: "input",
				name: "desc",
				message:
					"Current version only supports Description update. Please enter a new description",
			},
		])
		.then((answer) => {
			updatedConfig["description"] = answer.desc;
		});
}

async function UpdateRepository() {
	await getRepoToUpdate();

	await _router.PostRequest(
		`/artifactory/api/repositories/${updatedConfig.key}`,
		updatedConfig,
		`Repository '${updatedConfig.key}' updated successfully:`,
		"Error updating repository:"
	);
}

async function getUsername() {
	await inquirer
		.prompt([
			{
				type: "input",
				name: "name",
				message: "Please enter a username",
			},
		])
		.then(async (answer) => {
			newUser["username"] = answer.name;
			await getEmail();
		});
}

async function getEmail() {
	await inquirer
		.prompt([
			{
				type: "input",
				name: "email",
				message: "Please enter a email",
			},
		])
		.then(async (answer) => {
			newUser["email"] = answer.email;
			await getPassword();
		});
}

async function getPassword() {
	await inquirer
		.prompt([
			{
				type: "password",
				name: "pass",
				message: "Please enter a password",
				mask: true,
			},
		])
		.then(async (answer) => {
			newUser["password"] = answer.pass;

			if (answer.password == "") {
				console.log("Password empty, try again");
				await getPassword();
			}

			await getConfirmPassword();
		});
}

async function getConfirmPassword() {
	await inquirer
		.prompt([
			{
				type: "password",
				name: "pass",
				message: "Please re-enter the password",
				mask: true,
			},
		])
		.then(async (answer) => {
			if (newUser["password"] == answer.pass) {
				console.log("Passwords match");
				await getAdmin();
			} else if (answer.pass == "") {
				console.log("Password empty, try again");
				await getPassword();
			} else {
				console.log("Passwords do not match");
				await getPassword();
			}
		});
}

async function getAdmin() {
	await inquirer
		.prompt([
			{
				type: "list",
				name: "admin",
				message: "Is this account admin?",
				choices: ["True", "False"],
			},
		])
		.then((answer) => {
			if (answer.admin == "True") {
				newUser["admin"] = true;
			} else {
				newUser["admin"] = false;
			}
		});
}

async function CreateUser() {
	await getUsername();

	await _router.PostRequest(
		`/access/api/v2/users`,
		newUser,
		`User '${newUser.name}' created successfully:`,
		"Error creating user:"
	);
}

async function getUserToDelete() {
	let choices = [];
	let userList = [];
	let userSelected = {};

	const response = await _router.GetRequest(
		`/artifactory/api/security/users`,
		"List of Users:",
		"Error fetching users:",
		true
	);

	let count = 1;
	userList = response.data;
	response.data.forEach((user) => {
		if (
			user.realm != "oauth" &&
			user.name != "reinaldopino4@gmail.com" &&
			user.name != "testadmin"
		) {
			choices.push(count + ". " + user.name);
			count++;
		}
	});

	if (choices == []) {
		console.log("No eligible users for deletion. Returning to menu.");
		//go back to menu
	}

	await inquirer
		.prompt([
			{
				type: "list",
				name: "user",
				choices: choices,
				message:
					"Please select the user to be deleted. Super accounts are not permitted to be deleted.",
				default: choices[0],
			},
		])
		.then(async (answer) => {
			let userString = answer.user.split(".")[0];
			userSelected = userList[parseInt(userString) - 1];
			console.clear();
		});

	return userSelected;
}

async function DeleteUser() {
	let userSelected = await getUserToDelete();

	await _router.DeleteRequest(
		`/artifactory/api/security/users/${userSelected.name}`,
		`Deletion successful.`,
		"Error deleting user:"
	);
}

async function getCurrentUserName() {
	await inquirer
		.prompt([
			{
				type: "input",
				name: "name",
				message:
					"★ Welcome to the CompuZign CLI Take Home Project ★\n\nPlease enter your username",
			},
		])
		.then(async (answer) => {
			currentUser["username"] = answer.name;
			await getCurrentUserPassword();
		});
}

async function getCurrentUserPassword() {
	await inquirer
		.prompt([
			{
				type: "password",
				name: "pass",
				message: "Please enter your password",
				mask: true,
			},
		])
		.then(async (answer) => {
			currentUser["password"] = answer.pass;
		});
}

export async function UserLogin() {
	await getCurrentUserName();

	let isLoggedIn = await _router.Login(
		currentUser.username,
		currentUser.password
	);
	console.clear();

	if (isLoggedIn) {
		console.log(`${currentUser.username} has logged in successfully.\n`);
		setTimeout(menu, 2000);
	} else {
		console.log(`Error in Logging In. Please try again.`);
		setTimeout(UserLogin, 2000);
	}
}
