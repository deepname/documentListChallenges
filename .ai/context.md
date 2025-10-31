First Prompt:

Develop a single-page web application using **Vanilla JavaScript with TypeScript**, utilizing **Vite** for the build process. The application must strictly follow the **Model-View-Controller (MVC) architectural pattern** and incorporate a **centralized state management** system for data consistency.

The core task is to display an interactive list of documents, where each document entity includes a **name**, a list of **collaborators**, a **version number**, and a list of **attachments**.

**Key Functional Requirements:**

1.  **Display:** Present the documents in a **grid view**, ordered by the most recently created first.
2.  **Real-Time:** Implement **real-time notifications** using the native **WebSocket API** to alert the user when new documents are added externally.
3.  **Data Management:** Enable users to **create new documents** and update the central state accordingly.
4.  **Sorting:** Provide controls to **sort** the document list by **name**, **version number**, or **creation date**.
5.  **Responsive Design:** Ensure the application is mobile-friendly and provides a seamless experience on both desktop and mobile devices.
6.  **Error Handling:** Implement proper error handling and user feedback for failed operations.
7.  **Testing:** Implement proper testing and user feedback for failed operations.
8.  **Documentation:** Provide clear documentation for the application, including setup instructions, API documentation, and usage instructions.
9. **KISS and DRY:** Implement the application using the **KISS and DRY** principles.

Last Prompt:

Create a complete web application project named "Document Manager - MVC Application" based on the following detailed description. The project should be a modern single-page application built with Vanilla TypeScript, Vite, strict MVC architecture, and adhere to KISS and DRY principles. Apply the AAA (Arrange, Act, Assert) testing pattern throughout. The application must support offline functionality, real-time notifications, document grid view, sorting, and responsive design.

Project Overview and Features
Architecture: Follow strict MVC pattern with Model (data structures), View (UI rendering), and Controller (business logic). Use centralized state management via a singleton Store with observer pattern and immutable state access.
Features:
Offline support with localStorage persistence.
Auto-sync and reconnection to server when available.
Document grid/list view with responsive card-based layout.
Real-time notifications via WebSocket.
Create new documents with collaborators.
Multi-field sorting (name, version, creation date) with ascending/descending toggles.
Mobile-friendly responsive design.
Technologies:
TypeScript for type safety.
Vite for build tool and dev server.
Native WebSocket API for real-time communication.
CSS3 with CSS variables for styling.
ES Modules for modern JavaScript.
Code Quality: Use ESLint and Prettier for linting and formatting. Include unit tests with Vitest and E2E tests with Playwright. Target last 2 versions of Chrome.
API Integration:
Fetch initial documents from http://localhost:8080/documents on startup. Example document JSON:

```json
{
  "Attachments": ["European Amber Lager", "Wood-aged Beer"],
  "Contributors": [
    {"ID": "1b41861e-51e2-4bf4-ba13-b20f01ce81ef", "Name": "Jasen Crona"},
    {"ID": "2a1d6ed0-7d2d-4dc6-b3ea-436a38fd409e", "Name": "Candace Jaskolski"},
    {"ID": "9ae28565-4a1c-42e3-9ae8-e39e6f783e14", "Name": "Rosemarie Schaden"}
  ],
  "CreatedAt": "1912-03-08T06:01:39.382278739Z",
  "ID": "69517c79-a4b2-4f64-9c83-20e5678e4519",
  "Title": "Arrogant Bastard Ale",
  "UpdatedAt": "1952-02-29T22:21:13.817038244Z",
  "Version": "5.3.15"
}
``

WebSocket for notifications on ws://localhost:8080/notifications. Example notification JSON:
```json
{
  "Timestamp": "2020-08-12T07:30:08.28093+02:00",
  "UserID": "3ffe27e5-fe2c-45ea-8b3c-879b757b0455",
  "UserName": "Alicia Wolf",
  "DocumentID": "f09acc46-3875-4eff-8831-10ccf3356420",
  "DocumentTitle": "Edmund Fitzgerald Porter"
}```

Handle connection failures with auto-reconnection (5 attempts, 3s delay).
Offline Behavior: Load from localStorage first, sync with API in background, preserve offline changes.
