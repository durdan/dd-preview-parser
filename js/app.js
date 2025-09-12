// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const exportManager = new ExportManager();
    const exportUI = new ExportUI(exportManager);
    
    exportUI.init();
});