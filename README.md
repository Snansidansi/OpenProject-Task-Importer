# OpenProject Task Importer

This browser extension simplifies the process of creating tasks in [OpenProject](https://www.openproject.org/) by automatically extracting information from PDF documents using Artificial Intelligence. This is NOT a official plugin!

## Overview

The OpenProject Task Importer allows you to upload a PDF document (like a meeting minutes, project brief, or specification document). It then uses an LLM (Large Language Model) via the OpenRouter API to analyze the text and intelligently create structured tasks and subtasks in your OpenProject instance, based on your predefined task templates. Available languages are German and English.

<img width="400" alt="image" src="https://github.com/user-attachments/assets/065abec1-4ac4-40ce-b9d6-9928731f0db8" />


## Features

- **PDF Analysis**: Extracts text from uploaded PDFs.
- **AI-Powered Task Creation**: Uses an LLM to understand the document content and map it to your OpenProject task structures.
- **Customizable Templates**: Define and manage your OpenProject task types (e.g., "Meeting", "User Story", "Bug") and their attributes within the extension settings.
- **Nested Tasks**: Supports creating hierarchical task structures (parent tasks with subtasks).
- **Configuration**: Set your OpenProject and OpenRouter API credentials, choose your preferred AI model, and customize the system prompt for the LLM.

## Prerequisites

- An OpenProject instance (cloud or self-hosted) with API access enabled.
- An OpenRouter API key. You can get one at [openrouter.ai](https://openrouter.ai/).
- A browser that supports Chrome Extensions (e.g., Chrome, Edge, Brave).

## Installation

1.  Clone or download this repository.
2.  Open your browser's extension management page (e.g., `chrome://extensions`).
3.  Enable "Developer mode".
4.  Click "Load unpacked" and select the `dist` folder (or the root folder if you are running it in development mode).
5.  Configure your API keys and settings via the extension's popup or options page.

## Services Used

- **OpenProject**: The project management platform where tasks will be created. The extension connects to its REST API.
- **OpenRouter**: A service that provides access to various Large Language Models (LLMs) like GPT-4, Claude, etc. The extension uses this API to process the PDF content.
- **UnPDF**: A library used for extracting text content from PDF files directly within the browser.

## How it Works (High-Level)

1.  **Setup**:
    - Enter your OpenProject URL and API key in the settings.
    - Enter your OpenRouter API key.
    - Select a default project in OpenProject that will be used as a reference for task creation.
    - Choose or add the task types (and their attributes) you want to be able to create from PDFs.

2.  **Import Process**:
    - Go to the "Import" tab.
    - Select the OpenProject project where tasks should be created.
    - Upload or drag & drop your PDF file.
    - Click "Start Import".

3.  **Background Processing**:
    - The extension extracts the text from your PDF.
    - It retrieves the latest schema information for your configured task types from OpenProject.
    - It builds a prompt for the LLM containing:
      - Instructions on how to structure the output (JSON format).
      - The available task types and their attributes (schema).
      - The extracted text from your PDF.
      - (Optional) Any custom instructions you've set in the advanced settings.
    - The prompt is sent to the OpenRouter API using your selected AI model.
    - The LLM analyzes the text and returns a JSON object representing the tasks and subtasks it identified, filling in the attributes according to the schema.

4.  **Task Creation**:
    - The extension parses the LLM's JSON response.
    - It sends API requests to your OpenProject instance to create the tasks and subtasks, populating the fields with the data provided by the LLM.

## Development

This project is built using:

- **Svelte** and **SvelteKit** for the user interface.
- **TypeScript** for type safety.
- **Tailwind CSS** for styling.
- **Vite** as the build tool.

To set up the development environment:

1.  Install dependencies: `npm install`
2.  Build the project: `npm run build`
3.  Load the `dist` folder in your browser as an unpacked extension.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
