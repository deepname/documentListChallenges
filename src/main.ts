import './style.css';
import { DocumentController } from './controllers/DocumentController';
import { Store } from './store/Store';
import { ApiService } from './services/ApiService';

const apiService = new ApiService();

// Initialize the application
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = '<div id="document-container"></div>';

const controller = new DocumentController('document-container');

// Fetch documents from API
apiService.fetchDocuments()
  .then(documents => {
    const store = Store.getInstance();
    documents.forEach(doc => store.addDocument(doc));
    controller.connect();
  })
  .catch(error => {
    console.error('Failed to load documents:', error);
  });

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  controller.disconnect();
});
