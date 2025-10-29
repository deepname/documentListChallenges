import './style.css';
import { DocumentController } from './controllers/documentController';
import { Store } from './store/store';
import { ApiService } from './services/apiService';

const apiService = new ApiService();

// Initialize the application
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = '<div id="document-container"></div>';

const controller = new DocumentController('document-container');

// Fetch documents from API (works offline with localStorage)
apiService
  .fetchDocuments()
  .then(documents => {
    const store = Store.getInstance();
    // Only add documents if localStorage is empty (first load)
    if (store.getDocuments().length === 0) {
      documents.forEach(doc => store.addDocument(doc));
    }
    controller.connect();
  })
  .catch(error => {
    console.warn('Server unavailable, running in offline mode:', error);
    // App continues to work with localStorage data
    controller.connect(); // Still attempt WebSocket connection
  });

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  controller.disconnect();
});
