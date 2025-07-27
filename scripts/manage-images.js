#!/usr/bin/env node

// Flexible Gallery Management Helper Script
// Usage: node scripts/manage-images.js [add|remove|list|reorder]

const fs = require('fs');
const path = require('path');

const IMAGES_FILE = path.join(__dirname, '../data/images.json');

// Read current gallery data
function readImages() {
  try {
    const data = fs.readFileSync(IMAGES_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Support both old and new format
    if (parsed.groups) {
      return parsed; // New flexible format
    } else if (parsed.images) {
      return parsed; // Old simple format
    } else {
      return { groups: [] }; // Default new format
    }
  } catch (error) {
    console.error('Error reading gallery file:', error.message);
    return { groups: [] };
  }
}

// Get all items from all groups (flattened)
function getAllItems(data) {
  if (data.groups) {
    return data.groups.reduce((allItems, group, groupIndex) => {
      return allItems.concat(group.items.map(item => ({
        ...item,
        groupIndex,
        groupId: group.id
      })));
    }, []);
  } else if (data.images) {
    return data.images;
  }
  return [];
}

// Get next available ID
function getNextId(data) {
  const allItems = getAllItems(data);
  return Math.max(...allItems.map(item => item.id), 0) + 1;
}

// Write gallery data to file
function writeImages(data) {
  try {
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(data, null, 2));
    console.log('Gallery file updated successfully!');
  } catch (error) {
    console.error('Error writing gallery file:', error.message);
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
  const newId = getNextId(data);

  console.log('\n📸 Add New Item to Gallery\n');

  // Show available groups
  if (data.groups && data.groups.length > 0) {
    console.log('Available groups:');
    data.groups.forEach((group, index) => {
      console.log(`  ${index + 1}. ${group.id} (${group.items.length} items)`);
    });
    console.log('');
  }

  rl.question('Type (image/video): ', (type) => {
    type = type.trim().toLowerCase() || 'image';
    
    if (type === 'video') {
      // Handle video input
      rl.question('YouTube Video URL: ', (url) => {
        const videoId = extractVideoId(url.trim());
        if (!videoId) {
          console.log('❌ Invalid YouTube URL.');
          rl.close();
          return;
        }
        
        rl.question('Description: ', (alt) => {
          rl.question('Category: ', (category) => {
            rl.question('Group ID (or "new" for new group): ', (groupInput) => {
              rl.question('Width (w-full, md:w-1/2, etc.): ', (width) => {
                
                const newItem = {
                  id: newId,
                  type: 'video',
                  videoId: videoId,
                  src: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                  alt: alt.trim(),
                  category: category.trim() || 'tutorial',
                  layout: { 
                    width: width.trim() || 'w-full',
                    position: 999 // Will be sorted to end
                  }
                };

                addItemToGroup(data, newItem, groupInput.trim());
                writeImages(data);
                
                console.log(`\n✅ Added video #${newId}: ${newItem.alt}`);
                rl.close();
              });
            });
          });
        });
      });
    } else {
      // Handle image input
      rl.question('Image URL: ', (src) => {
        rl.question('Alt text: ', (alt) => {
          rl.question('Category: ', (category) => {
            rl.question('Group ID (or "new" for new group): ', (groupInput) => {
              rl.question('Width (w-full, md:w-1/2, etc.): ', (width) => {
                
                const newItem = {
                  id: newId,
                  src: src.trim(),
                  alt: alt.trim(),
                  category: category.trim() || 'nature',
                  layout: { 
                    width: width.trim() || 'md:w-1/2',
                    position: 999 // Will be sorted to end
                  }
                };

                addItemToGroup(data, newItem, groupInput.trim());
                writeImages(data);
                
                console.log(`\n✅ Added image #${newId}: ${newItem.alt}`);
                rl.close();
              });
            });
          });
        });
      });
    }
  });
}

// Add item to specified group or create new group
function addItemToGroup(data, item, groupInput) {
  // Ensure we have groups array
  if (!data.groups) {
    data.groups = [];
  }

  if (groupInput === 'new' || !groupInput) {
    // Create new group
    const newGroupId = `group${data.groups.length + 1}`;
    const newGroup = {
      id: newGroupId,
      type: 'column',
      width: 'md:w-1/2',
      items: [item]
    };
    data.groups.push(newGroup);
    console.log(`Created new group: ${newGroupId}`);
  } else {
    // Add to existing group
    const group = data.groups.find(g => g.id === groupInput);
    if (group) {
      group.items.push(item);
    } else {
      console.log(`Group "${groupInput}" not found, creating new group.`);
      const newGroup = {
        id: groupInput,
        type: 'column',
        width: 'md:w-1/2',
        items: [item]
      };
      data.groups.push(newGroup);
    }
  }
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
  const allItems = getAllItems(data);
  
  if (allItems.length === 0) {
    console.log('No items to remove.');
    return;
  }

  console.log('\n🗑️  Current Items:');
  allItems.forEach(item => {
    const type = item.type === 'video' ? '🎥' : '🖼️';
    const groupInfo = item.groupId ? ` (${item.groupId})` : '';
    console.log(`   ${type} #${item.id}: ${item.alt}${groupInfo}`);
  });

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nEnter item ID to remove: ', (idStr) => {
    const id = parseInt(idStr);
    let removed = false;
    
    if (data.groups) {
      // Remove from flexible layout
      for (let group of data.groups) {
        const itemIndex = group.items.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          const removedItem = group.items.splice(itemIndex, 1)[0];
          const type = removedItem.type === 'video' ? 'video' : 'image';
          console.log(`✅ Removed ${type}: ${removedItem.alt} from ${group.id}`);
          removed = true;
          break;
        }
      }
    } else if (data.images) {
      // Remove from simple layout
      const itemIndex = data.images.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        const removedItem = data.images.splice(itemIndex, 1)[0];
        const type = removedItem.type === 'video' ? 'video' : 'image';
        console.log(`✅ Removed ${type}: ${removedItem.alt}`);
        removed = true;
      }
    }
    
    if (removed) {
      writeImages(data);
    } else {
      console.log(`❌ Item with ID ${id} not found.`);
    }
    
    rl.close();
  });
}

// List all images and videos
function listImages() {
  const data = readImages();
  const allItems = getAllItems(data);
  
  if (allItems.length === 0) {
    console.log('No items in gallery.');
    return;
  }

  console.log('\n📋 Gallery Layout:\n');
  
  if (data.groups) {
    // New flexible layout
    data.groups.forEach((group, groupIndex) => {
      console.log(`📁 Group: ${group.id} (${group.width || 'w-full'})`);
      
      group.items.forEach(item => {
        const type = item.type === 'video' ? '🎥 VIDEO' : '🖼️  IMAGE';
        const width = item.layout?.width || 'w-full';
        const position = item.layout?.position || '?';
        
        console.log(`   ${type} #${item.id}: ${item.alt}`);
        console.log(`      Category: ${item.category} | Width: ${width} | Pos: ${position}`);
        
        if (item.type === 'video') {
          console.log(`      Video ID: ${item.videoId}`);
        }
      });
      console.log('');
    });
  } else if (data.images) {
    // Old simple layout
    console.log('📋 Simple Layout:\n');
    data.images.forEach(item => {
      const type = item.type === 'video' ? '🎥 VIDEO' : '🖼️  IMAGE';
      console.log(`${type} #${item.id}: ${item.alt}`);
      console.log(`   Category: ${item.category} | Size: ${item.size || 'half'}`);
      
      if (item.type === 'video') {
        console.log(`   Video ID: ${item.videoId}`);
      }
      console.log('');
    });
  }
  
  const imageCount = allItems.filter(item => item.type !== 'video').length;
  const videoCount = allItems.filter(item => item.type === 'video').length;
  console.log(`Total: ${imageCount} images, ${videoCount} videos (${allItems.length} items)`);
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
    console.log('\n📸 Flexible Gallery Manager\n');
    console.log('Usage:');
    console.log('  node scripts/manage-images.js add     - Add a new image or video');
    console.log('  node scripts/manage-images.js remove  - Remove an image or video');
    console.log('  node scripts/manage-images.js list    - List all items with layout info');
    console.log('');
    console.log('Layout System:');
    console.log('  - Items are organized in groups/columns');
    console.log('  - Each item has flexible width and positioning');
    console.log('  - Supports complex multi-column layouts');
    console.log('');
}
