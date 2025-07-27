#!/usr/bin/env node

// Image and Video Gallery Management Helper Script
// Usage: node scripts/manage-images.js [add|remove|list]

const fs = require('fs');
const path = require('path');

const IMAGES_FILE = path.join(__dirname, '../data/images.json');

// Read current images and videos
function readImages() {
  try {
    const data = fs.readFileSync(IMAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading images file:', error.message);
    return { images: [] };
  }
}

// Write images to file
function writeImages(data) {
  try {
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(data, null, 2));
    console.log('Images file updated successfully!');
  } catch (error) {
    console.error('Error writing images file:', error.message);
  }
}

// Add a new image or video
function addImage() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const data = readImages();
  const newId = Math.max(...data.images.map(img => img.id), 0) + 1;

  console.log('\n📸 Add New Item to Gallery\n');

  rl.question('Type (image/video): ', (type) => {
    type = type.trim().toLowerCase() || 'image';
    
    if (type === 'video') {
      // Handle video input
      rl.question('YouTube Video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID): ', (url) => {
        const videoId = extractVideoId(url.trim());
        if (!videoId) {
          console.log('❌ Invalid YouTube URL. Please provide a valid YouTube video URL.');
          rl.close();
          return;
        }
        
        rl.question('Alt text/Description: ', (alt) => {
          rl.question('Category (tutorial/behind-scenes/nature/landscape/portrait/urban/architecture/wildlife/event/street): ', (category) => {
            rl.question('Size (half/full): ', (size) => {
              
              const newItem = {
                id: newId,
                type: 'video',
                videoId: videoId,
                src: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                alt: alt.trim(),
                category: category.trim() || 'tutorial',
                size: size.trim() || 'full'
              };

              data.images.push(newItem);
              writeImages(data);
              
              console.log(`\n✅ Added video #${newId}:`);
              console.log(`   Description: ${newItem.alt}`);
              console.log(`   Category: ${newItem.category}`);
              console.log(`   Size: ${newItem.size}`);
              console.log(`   Video ID: ${newItem.videoId}`);
              
              rl.close();
            });
          });
        });
      });
    } else {
      // Handle image input (original logic)
      rl.question('Image URL: ', (src) => {
        rl.question('Alt text: ', (alt) => {
          rl.question('Category (nature/landscape/portrait/urban/architecture/wildlife/event/street): ', (category) => {
            rl.question('Size (half/full): ', (size) => {
              
              const newImage = {
                id: newId,
                src: src.trim(),
                alt: alt.trim(),
                category: category.trim() || 'nature',
                size: size.trim() || 'half'
              };

              data.images.push(newImage);
              writeImages(data);
              
              console.log(`\n✅ Added image #${newId}:`);
              console.log(`   Alt: ${newImage.alt}`);
              console.log(`   Category: ${newImage.category}`);
              console.log(`   Size: ${newImage.size}`);
              
              rl.close();
            });
          });
        });
      });
    }
  });
}

// Extract YouTube video ID from URL
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Remove an image or video
function removeImage() {
  const data = readImages();
  
  if (data.images.length === 0) {
    console.log('No items to remove.');
    return;
  }

  console.log('\n🗑️  Current Items:');
  data.images.forEach(item => {
    const type = item.type === 'video' ? '🎥' : '🖼️';
    console.log(`   ${type} #${item.id}: ${item.alt} (${item.category})`);
  });

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nEnter item ID to remove: ', (idStr) => {
    const id = parseInt(idStr);
    const itemIndex = data.images.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      console.log(`❌ Item with ID ${id} not found.`);
    } else {
      const removedItem = data.images.splice(itemIndex, 1)[0];
      writeImages(data);
      const type = removedItem.type === 'video' ? 'video' : 'image';
      console.log(`✅ Removed ${type}: ${removedItem.alt}`);
    }
    
    rl.close();
  });
}

// List all images and videos
function listImages() {
  const data = readImages();
  
  if (data.images.length === 0) {
    console.log('No items in gallery.');
    return;
  }

  console.log('\n📋 Gallery Items:\n');
  data.images.forEach(item => {
    const type = item.type === 'video' ? '🎥 VIDEO' : '🖼️  IMAGE';
    console.log(`${type} #${item.id}: ${item.alt}`);
    console.log(`   Category: ${item.category} | Size: ${item.size}`);
    
    if (item.type === 'video') {
      console.log(`   Video ID: ${item.videoId}`);
      console.log(`   YouTube URL: https://www.youtube.com/watch?v=${item.videoId}`);
    } else {
      console.log(`   URL: ${item.src.substring(0, 60)}...`);
    }
    console.log('');
  });
  
  const imageCount = data.images.filter(item => item.type !== 'video').length;
  const videoCount = data.images.filter(item => item.type === 'video').length;
  console.log(`Total: ${imageCount} images, ${videoCount} videos (${data.images.length} items)`);
}

// Main script logic
const command = process.argv[2];

switch (command) {
  case 'add':
    addImage();
    break;
  case 'remove':
    removeImage();
    break;
  case 'list':
    listImages();
    break;
  default:
    console.log('\n📸 Gallery Manager\n');
    console.log('Usage:');
    console.log('  node scripts/manage-images.js add     - Add a new image or video');
    console.log('  node scripts/manage-images.js remove  - Remove an image or video');
    console.log('  node scripts/manage-images.js list    - List all items');
    console.log('');
}
