// Flexible Gallery Manager
class FlexibleGallery {
  constructor(containerSelector, dataPath) {
    this.container = document.querySelector(containerSelector);
    this.dataPath = dataPath;
    this.data = null;
  }

  // Load gallery data from JSON file
  async loadData() {
    try {
      const response = await fetch(this.dataPath);
      this.data = await response.json();
      return this.data;
    } catch (error) {
      console.error('Error loading gallery data:', error);
      return null;
    }
  }

  // Create image or video element
  createMediaElement(item) {
    const widthClass = item.layout?.width || 'w-full';
    
    if (item.type === 'video') {
      // Create video thumbnail with play button overlay
      return `
        <div class="${widthClass} p-1">
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
        <div class="${widthClass} p-1">
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

  // Create a layout group (column)
  createLayoutGroup(group) {
    const groupWidthClass = group.width || 'w-full';
    
    // Sort items by position if specified
    const sortedItems = group.items.sort((a, b) => {
      const posA = a.layout?.position || 0;
      const posB = b.layout?.position || 0;
      return posA - posB;
    });

    const itemsHTML = sortedItems.map(item => this.createMediaElement(item)).join('');
    
    return `
      <div class="flex ${groupWidthClass} flex-wrap">
        ${itemsHTML}
      </div>
    `;
  }

  // Render the flexible layout
  render() {
    if (!this.container || !this.data) {
      console.error('Gallery container or data not found');
      return;
    }

    // Check if we have the new layout structure
    if (this.data.groups && Array.isArray(this.data.groups)) {
      // New flexible layout system
      const groupsHTML = this.data.groups.map(group => this.createLayoutGroup(group)).join('');
      this.container.innerHTML = `
        <div class="flex flex-wrap w-full">
          ${groupsHTML}
        </div>
      `;
    } else if (this.data.images && Array.isArray(this.data.images)) {
      // Fallback to old simple system
      const itemHTML = this.data.images.map(item => {
        // Convert old size format to new layout format
        item.layout = {
          width: item.size === 'full' ? 'w-full' : 'w-full md:w-1/2'
        };
        return this.createMediaElement(item);
      }).join('');
      
      this.container.innerHTML = `
        <div class="flex flex-wrap w-full">
          ${itemHTML}
        </div>
      `;
    }

    // Trigger fade-in animation
    setTimeout(() => {
      const images = this.container.querySelectorAll('img');
      images.forEach(img => {
        img.classList.remove('opacity-0');
      });
    }, 100);
  }

  // Get all items for filtering (flattened from groups)
  getAllItems() {
    if (!this.data) return [];
    
    if (this.data.groups) {
      return this.data.groups.reduce((allItems, group) => {
        return allItems.concat(group.items);
      }, []);
    } else if (this.data.images) {
      return this.data.images;
    }
    
    return [];
  }

  // Filter items by category
  filterByCategory(category) {
    if (!this.data) return;
    
    const allItems = this.getAllItems();
    const filteredItems = category === 'all' 
      ? allItems 
      : allItems.filter(item => item.category === category);
    
    // For filtering, use simple layout
    const itemHTML = filteredItems.map(item => {
      item.layout = item.layout || { width: 'w-full md:w-1/2' };
      return this.createMediaElement(item);
    }).join('');
    
    this.container.innerHTML = `
      <div class="flex flex-wrap w-full">
        ${itemHTML}
      </div>
    `;

    // Re-trigger fade-in
    setTimeout(() => {
      const images = this.container.querySelectorAll('img');
      images.forEach(img => {
        img.classList.remove('opacity-0');
      });
    }, 100);
  }

  // Get all unique categories
  getCategories() {
    const allItems = this.getAllItems();
    const categories = [...new Set(allItems.map(item => item.category))];
    return ['all', ...categories];
  }

  // Initialize the gallery
  async init() {
    await this.loadData();
    this.render();
    
    // Re-initialize Fancybox after rendering
    if (typeof Fancybox !== 'undefined') {
      Fancybox.bind("[data-fancybox]", {});
    }
  }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const gallery = new FlexibleGallery('#gallery-container', './data/images.json');
  gallery.init();
});
