// Image Gallery Manager
class ImageGallery {
  constructor(containerSelector, dataPath) {
    this.container = document.querySelector(containerSelector);
    this.dataPath = dataPath;
    this.images = [];
  }

  // Load image data from JSON file
  async loadImages() {
    try {
      const response = await fetch(this.dataPath);
      const data = await response.json();
      this.images = data.images;
      return this.images;
    } catch (error) {
      console.error('Error loading images:', error);
      return [];
    }
  }

  // Create image element with proper classes and structure
  createImageElement(image) {
    const sizeClass = image.size === 'full' ? 'w-full' : 'w-full md:w-1/2';
    
    return `
      <div class="${sizeClass} p-1">
        <div class="overflow-hidden h-full w-full">
          <a href="${image.src}" data-fancybox="gallery" data-category="${image.category}">
            <img alt="${image.alt}"
                 class="block h-full w-full object-cover object-center opacity-0 animate-fade-in transition duration-500 transform scale-100 hover:scale-110"
                 src="${image.src}"
                 loading="lazy" />
          </a>
        </div>
      </div>
    `;
  }

  // Render all images to the container
  render() {
    if (!this.container) {
      console.error('Gallery container not found');
      return;
    }

    const imageHTML = this.images.map(image => this.createImageElement(image)).join('');
    this.container.innerHTML = imageHTML;

    // Trigger fade-in animation
    setTimeout(() => {
      const images = this.container.querySelectorAll('img');
      images.forEach(img => {
        img.classList.remove('opacity-0');
      });
    }, 100);
  }

  // Filter images by category
  filterByCategory(category) {
    const filteredImages = category === 'all' 
      ? this.images 
      : this.images.filter(image => image.category === category);
    
    const imageHTML = filteredImages.map(image => this.createImageElement(image)).join('');
    this.container.innerHTML = imageHTML;
  }

  // Get all unique categories
  getCategories() {
    const categories = [...new Set(this.images.map(image => image.category))];
    return ['all', ...categories];
  }

  // Initialize the gallery
  async init() {
    await this.loadImages();
    this.render();
    
    // Re-initialize Fancybox after rendering
    if (typeof Fancybox !== 'undefined') {
      Fancybox.bind("[data-fancybox]", {});
    }
  }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const gallery = new ImageGallery('#gallery-container', './data/images.json');
  gallery.init();
});
