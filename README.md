# 📸 Photography Portfolio

A modern, responsive photography portfolio website showcasing the work of **Fatemeh Khanzadeh**. Built with clean, elegant design using Tailwind CSS and modern web technologies.

## ✨ Features

- Responsive design for all devices
- Image gallery with lightbox functionality
- Dark/light theme support  
- Smooth animations and transitions
- Contact form integration
- SEO optimized

## 🏗️ Project Architecture

```
photography-portfolio/
├── index.html              # Main portfolio page
├── dist/                   # Built files and additional pages
│   ├── about_me.html      # About page
│   ├── contact.html       # Contact page
│   ├── output.css         # Compiled Tailwind CSS
│   ├── gallery.js         # Gallery functionality
│   ├── menu.js           # Navigation menu
│   ├── fade_in.js        # Animation effects
│   └── assets/           # Images and static files
├── src/
│   └── input.css         # Source CSS file
├── data/
│   └── images.json       # Gallery image configuration
├── scripts/
│   └── manage-images.js  # Image management utilities
├── package.json          # Dependencies
└── tailwind.config.js    # Tailwind configuration
```

## � Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/alipga/photography-portfolio.git
   cd photography-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build CSS and start development**
   ```bash
   npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
   ```

4. **Serve the files**
   Use any local server like:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   
   # Using Live Server (VS Code extension)
   ```

5. **Open in browser**
   Navigate to `http://localhost:8000`

## � Adding Images

### Method 1: Using Google Drive (Current Setup)

1. Upload images to Google Drive
2. Right-click image → Get link → Change to "Anyone with the link"
3. Convert sharing URL to direct URL:
   ```
   From: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   To: https://drive.google.com/uc?export=view&id=FILE_ID
   ```

4. Update `data/images.json`:
   ```json
   {
     "id": 1,
     "group": "portraits",
     "src": "https://drive.google.com/uc?export=view&id=YOUR_FILE_ID",
     "alt": "Description of your image"
   }
   ```

### Method 2: Local Images

1. Add images to `dist/assets/`
2. Update `data/images.json`:
   ```json
   {
     "id": 1,
     "group": "portraits", 
     "src": "./dist/assets/your-image.jpg",
     "alt": "Description of your image"
   }
   ```

## 🌐 Deploy to Netlify

### One-Click Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alipga/photography-portfolio)

### Manual Deploy
1. Build the project:
   ```bash
   npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify
   ```

2. Create a `_redirects` file in the root:
   ```
   /*    /index.html   200
   ```

3. Deploy to Netlify:
   - Drag and drop the entire project folder to [Netlify](https://netlify.com)
   - Or connect your GitHub repository for automatic deployments

## 🛠️ Built With

- **HTML5** - Semantic markup
- **CSS3** - Custom styling
- **JavaScript** - Interactive functionality  
- **Tailwind CSS** - Utility-first CSS framework
- **Alpine.js** - Lightweight JavaScript framework
- **Fancybox** - Image lightbox library

## 👨‍💻 Credits

**Original Author:** [João Franco](https://www.linkedin.com/in/joão-franco-452161195/)  
**Customized by:** Fatemeh Khanzadeh

---

*This portfolio template was originally created by João Franco and has been customized for personal use.*

## � License

Distributed under the GPL-3.0 License. See `LICENSE` for more information.

## � Acknowledgments

- [FancyBox](https://fancyapps.com/fancybox/) - Image lightbox functionality
- [Alpine.js](https://alpinejs.dev/) - Lightweight JavaScript framework  
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Unsplash](https://unsplash.com/) - Beautiful stock photography
