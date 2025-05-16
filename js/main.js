import dataService from './dataService.js';
import uiController from './uiController.js';

// Application entry point
async function bootstrap() {
  // Load data first
  const dataLoaded = await dataService.loadData();
  
  if (dataLoaded) {
    // Initialize UI components
    uiController.init();
  } else {
    console.error("Failed to initialize application due to data loading error");
    document.querySelector("#freeMarquee span").textContent = "載入課表失敗，請重新整理頁面";
  }
}

// Start the application
bootstrap();
