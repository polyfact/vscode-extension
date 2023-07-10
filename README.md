# Polyfact Extension

## Overview

The Polyfact Extension is a Visual Studio Code extension designed to streamline code comment management. This powerful tool harnesses the capabilities of OpenAI's GPT-4 to intelligently manage and process your code comments. By integrating with the Polyfact API, it ensures broad programming language compatibility.

## Current Version

As of the latest update, the project is at version 0.0.4.

## License

The Polyfact Extension is open-source software licensed under the terms of the MIT license, promoting reuse and further development by the coding community.

## Key Features

- **Command Activation**: The `polyfact-extension.commentFunctions` command, once executed, activates the extension.
- **Accessible Keybindings**: To invoke the command, use the keyboard shortcut `Ctrl+Shift+D` (`Cmd+Shift+D` on macOS) when the text editor is focused.
- **Context Menu Activation**: Users can also activate the Polyfact Extension by right-clicking in the editor and selecting 'Polyfact Extension' from the context menu.

## Configuration and Access Token Acquisition

The Polyfact Extension requires an access token for integration with the Polyfact API. Here's how to acquire an access token and configure the `polyfact-extension.accessToken`:

1. Visit [Polyfact's application](https://app.polyfact.com/) and click on 'Connect with Github'.
2. Once you're authenticated with Github, you will be able to see your access token.
3. Copy the provided access token.
4. Now, navigate to the Visual Studio Code settings (File > Preferences > Settings).
5. In the search bar at the top of the settings panel, type 'Polyfact Extension'.
6. Click on 'Edit in settings.json' under the 'Polyfact Extension' section.
7. In the settings.json file, add a new line within the JSON object: `"polyfact-extension.accessToken": "<your_access_token>"`
8. Replace `<your_access_token>` with the access token you copied from the Polyfact application.
9. Save the settings.json file to apply the changes.

## Repository

The source code for the Polyfact Extension is publicly accessible via [this GitHub repository](https://github.com/polyfact/polyfact-extension.git). We welcome contributors and users alike to explore the codebase, report issues, or even propose enhancements.

## Compatibility

The Polyfact Extension is compatible with Visual Studio Code version 1.79.0 or higher, ensuring it can seamlessly integrate with your existing development environment.

## Category

The Polyfact Extension falls under the "Other" category in Visual Studio Code extensions.
