#!/usr/bin/env node

// Image Management Helper Script
// Usage: node scripts/manage-images.js [add|remove|list]

const fs = require('fs');
const path = require('path');

const IMAGES_FILE = path.join(__dirname, '../data/images.json');

// Read current images
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

// Add a new image
function addImage() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const data = readImages();
  const newId = Math.max(...data.images.map(img => img.id), 0) + 1;

  console.log('\n📸 Add New Image to Gallery\n');

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

// Remove an image
function removeImage() {
  const data = readImages();
  
  if (data.images.length === 0) {
    console.log('No images to remove.');
    return;
  }

  console.log('\n🗑️  Current Images:');
  data.images.forEach(img => {
    console.log(`   #${img.id}: ${img.alt} (${img.category})`);
  });

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nEnter image ID to remove: ', (idStr) => {
    const id = parseInt(idStr);
    const imageIndex = data.images.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      console.log(`❌ Image with ID ${id} not found.`);
    } else {
      const removedImage = data.images.splice(imageIndex, 1)[0];
      writeImages(data);
      console.log(`✅ Removed image: ${removedImage.alt}`);
    }
    
    rl.close();
  });
}

// List all images
function listImages() {
  const data = readImages();
  
  if (data.images.length === 0) {
    console.log('No images in gallery.');
    return;
  }

  console.log('\n📋 Gallery Images:\n');
  data.images.forEach(img => {
    console.log(`#${img.id}: ${img.alt}`);
    console.log(`   Category: ${img.category} | Size: ${img.size}`);
    console.log(`   URL: ${img.src.substring(0, 60)}...`);
    console.log('');
  });
  
  console.log(`Total: ${data.images.length} images`);
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
    console.log('\n📸 Image Gallery Manager\n');
    console.log('Usage:');
    console.log('  node scripts/manage-images.js add     - Add a new image');
    console.log('  node scripts/manage-images.js remove  - Remove an image');
    console.log('  node scripts/manage-images.js list    - List all images');
    console.log('');
}
