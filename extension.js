// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs");
const os = require("os")


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "fastapienvironment" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "fastapienvironment.createFastApiEnvironment",
    async function () {
      // The code you place here will be executed every time your command is executed

      const environmentName = await vscode.window.showInputBox({
        prompt: "Enter the name for the FastAPI environment",
        placeHolder: "myenv",
        ignoreFocusOut: true,
      });

      if (!environmentName) {
        return;
      }


	  // Check if the environment already exists
	  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	  if (workspaceFolder) {
		const environmentPath = `${workspaceFolder.uri.fsPath}/${environmentName}`;
		if (fs.existsSync(environmentPath)) {
		  const overwrite = await vscode.window.showQuickPick(['Yes', 'No'], {
			placeHolder: `The environment '${environmentName}' already exists. Do you want to overwrite it?`,
			ignoreFocusOut: true,
		  });
  
		  if (overwrite !== 'Yes') {
			return;
		  }
		}
	  }

	  // Check if main.py already exists
	  if (workspaceFolder) {
		const mainPyFilePath = `${workspaceFolder.uri.fsPath}/main.py`;
		if (fs.existsSync(mainPyFilePath)) {
		  const overwriteMainPy = await vscode.window.showQuickPick(['Yes', 'No'], {
			placeHolder: `The 'main.py' file already exists. Do you want to overwrite it?`,
			ignoreFocusOut: true,
		  });
  
		  if (overwriteMainPy !== 'Yes') {
			return;
		  }
		}
	  }

      // Open a terminal in the workspace
    const terminal = vscode.window.createTerminal('FastAPI Environment');
    terminal.show();

    // Run the commands to create a FastAPI environment
    terminal.sendText(`python -m venv ${environmentName}`);
    terminal.sendText(getActivateCommand(environmentName));
    terminal.sendText(`pip install fastapi uvicorn`);

    // Create main.py file with basic FastAPI code
    if (workspaceFolder) {
      const mainPyFilePath = `${workspaceFolder.uri.fsPath}/main.py`;
      const mainPyCode = `
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}
`;

        fs.writeFileSync(mainPyFilePath, mainPyCode);
      }

      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Fast API from fastApiEnvironment!"
      );
    }
  );

  context.subscriptions.push(disposable);
}


function getActivateCommand(environmentName) {
	// Get the current operating system
	const platform = os.platform();
  
	if (platform === 'win32') {
	  return `.\\${environmentName}\\Scripts\\activate`;
	}
  
	return `source ${environmentName}/bin/activate`;
  }

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
