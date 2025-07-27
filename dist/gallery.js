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

  // Create image or video element with proper classes and structure
  createImageElement(item) {
    const sizeClass = item.size === 'full' ? 'w-full' : 'w-full md:w-1/2';
    
    if (item.type === 'video') {
      // Create video thumbnail with play button overlay
      return `
        <div class="${sizeClass} p-1">
          <div class="overflow-hidden h-full w-full relative group">
            <a href="https://www.youtube.com/watch?v=${item.videoId}" data-fancybox="gallery" data-category="${item.category}">
              <img alt="${item.alt}"
                   class="block h-full w-full object-cover object-center opacity-0 animate-fade-in transition duration-500 transform scale-100 hover:scale-110"
                   src="${item.src}"
                   loading="lazy" />
              <!-- Video play button overlay -->
              <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300">
                <div class="bg-white bg-opacity-90 rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <!-- Video badge -->
              <div class="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                VIDEO
              </div>
            </a>
          </div>
        </div>
      `;
    } else {
      // Regular image
      return `
        <div class="${sizeClass} p-1">
          <div class="overflow-hidden h-full w-full">
            <a href="${item.src}" data-fancybox="gallery" data-category="${item.category}">
              <img alt="${item.alt}"
                   class="block h-full w-full object-cover object-center opacity-0 animate-fade-in transition duration-500 transform scale-100 hover:scale-110"
                   src="${item.src}"
                   loading="lazy" />
            </a>
          </div>
        </div>
      `;
    }
  }

  // Render all items (images and videos) to the container
  render() {
    if (!this.container) {
      console.error('Gallery container not found');
      return;
    }

    const itemHTML = this.images.map(item => this.createImageElement(item)).join('');
    this.container.innerHTML = itemHTML;

    // Trigger fade-in animation
    setTimeout(() => {
      const images = this.container.querySelectorAll('img');
      images.forEach(img => {
        img.classList.remove('opacity-0');
      });
    }, 100);
  }

  // Filter items by category
  filterByCategory(category) {
    const filteredItems = category === 'all' 
      ? this.images 
      : this.images.filter(item => item.category === category);
    
    const itemHTML = filteredItems.map(item => this.createImageElement(item)).join('');
    this.container.innerHTML = itemHTML;
  }

  // Get all unique categories
  getCategories() {
    const categories = [...new Set(this.images.map(item => item.category))];
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
