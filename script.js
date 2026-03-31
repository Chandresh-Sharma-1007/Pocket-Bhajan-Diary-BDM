// ============================================
// GLOBAL STATE VARIABLES
// ============================================
let navigationStack = [];
let currentView = "home";
let currentCategory = null;
let currentSubCategory = null;
let currentItem = null;
let searchActive = false;
let currentPlaylist = [];
let currentSongIndex = 0;
let currentFontSize = 15; // Default starting size
// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded - Initializing App");

  // Remove splash screen after 3 seconds
  setTimeout(() => {
    const splash = document.getElementById("splashScreen");
    if (splash) splash.style.display = "none";
  }, 3800);

  initializeApp();
  attachEventListeners();
});

function initializeApp() {
  console.log("Initializing App...");
  renderHome();
  console.log("Home page rendered");
}

function attachEventListeners() {
  // Left icon click
  const leftIcon = document.getElementById("leftIcon");
  if (leftIcon) leftIcon.addEventListener("click", handleLeftIcon);

  // Search icon click
  const searchIcon = document.getElementById("searchIcon");
  if (searchIcon) searchIcon.addEventListener("click", toggleSearch);

  // Search close button
  const searchClose = document.getElementById("searchClose");
  if (searchClose) searchClose.addEventListener("click", closeSearch);

  // Search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", handleSearch);

  // Drawer overlay click
  const drawerOverlay = document.getElementById("drawerOverlay");
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);

  // Video close button
  const videoCloseBtn = document.getElementById("videoCloseBtn");
  if (videoCloseBtn) videoCloseBtn.addEventListener("click", closeVideo);

  // Drawer menu items
  const drawerItems = document.querySelectorAll(".drawer-item");
  drawerItems.forEach((item) => {
    item.addEventListener("click", function () {
      const page = this.getAttribute("data-page");
      openFeaturePage(page);
    });
  });

  // Submit buttons (Check if they exist first to avoid errors)
  const feedbackBtn = document.getElementById("submitFeedbackBtn");
  if (feedbackBtn) feedbackBtn.addEventListener("click", submitFeedback);

  const bhajanBtn = document.getElementById("submitBhajanBtn");
  if (bhajanBtn) bhajanBtn.addEventListener("click", submitBhajan);
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function toggleSearch() {
  searchActive = !searchActive;
  const searchBar = document.getElementById("searchBar");
  const searchResults = document.getElementById("searchResults");

  if (searchActive) {
    searchBar.classList.add("active");
    searchResults.classList.add("active");
    document.getElementById("searchInput").focus();
  } else {
    closeSearch();
  }
}

function closeSearch() {
  searchActive = false;
  document.getElementById("searchBar").classList.remove("active");
  document.getElementById("searchResults").classList.remove("active");
  document.getElementById("searchInput").value = "";
  document.getElementById("searchResultsContainer").innerHTML = "";
}

// function handleSearch(e) {
//     const query = e.target.value.toLowerCase().trim();
//     const resultsContainer = document.getElementById('searchResultsContainer');

//     if (query.length === 0) {
//         resultsContainer.innerHTML = '';
//         return;
//     }

//     // Ensure appData exists before searching
//     if (typeof appData !== 'undefined') {
//         const results = searchAppData(query);
//         displaySearchResults(results);
//     }
// }

// ============================================
// SMART SEARCH (HINDI + ENGLISH) 🧠
// ============================================

// 1. Dictionary: Add more words here if needed!
const hindiToEnglishMap = {
  हनुमान: "hanuman",
  शिव: "shiv",
  शंकर: "shiv",
  भोले: "shiv",
  गणेश: "ganesh",
  गणपति: "ganesh",
  राम: "ram",
  कृष्ण: "krishna",
  विष्णु: "vishnu",
  दुर्गा: "durga",
  लक्ष्मी: "laxmi",
  सरस्वती: "saraswati",
  साईं: "sai",
  शनि: "shani",
  चालीसा: "chalisa",
  आरती: "aarti",
  भजन: "bhajan",
};

function handleSearch(e) {
  // Get text from the box
  // Check if e.target exists (for typing) or use e.target.value directly (for voice)
  let query = "";
  if (e.target && e.target.value) {
    query = e.target.value.toLowerCase().trim();
  } else if (e.value) {
    query = e.value.toLowerCase().trim();
  }

  // 2. Translator: Convert Hindi words to English words
  Object.keys(hindiToEnglishMap).forEach((hindiWord) => {
    if (query.includes(hindiWord)) {
      query = query.replace(hindiWord, hindiToEnglishMap[hindiWord]);
    }
  });

  console.log("Searching for:", query); // Check Console to see translation

  // 3. Run the search
  const searchResultsContainer = document.getElementById(
    "searchResultsContainer",
  );

  if (query.length === 0) {
    searchResultsContainer.innerHTML = "";
    return;
  }

  if (typeof appData !== "undefined") {
    const results = searchAppData(query); // Search using the English word
    displaySearchResults(results);
  }
}

function searchAppData(rawQuery) {
    const results = [];

    // ==========================================
    // THE MAGIC CLEANER
    // This removes newlines, commas, and double spaces so matches are perfect
    // ==========================================
    function cleanText(text) {
        if (!text) return "";
        return text.toLowerCase()
                   .replace(/[\n\r]+/g, ' ')      // Turn invisible line breaks into spaces
                   .replace(/[,.?!।॥|'"\-]/g, '') // Remove all punctuation and Hindi pipes
                   .replace(/\s+/g, ' ')          // Turn double spaces into single spaces
                   .trim();
    }

    // Clean the user's search query
    const query = cleanText(rawQuery);
    if (query.length === 0) return results;

    if (typeof appData !== "undefined") {
        Object.keys(appData).forEach((categoryName) => {
            const category = appData[categoryName];

            if (!category) return; // Skip empty stuff

            // 1. Match Main Category Name
            if (cleanText(categoryName).includes(query)) {
                results.push({
                    type: "category",
                    category: categoryName,
                    title: categoryName,
                    path: "Main Category",
                });
            }

            // ==========================================
            // SEARCH LOCATION A: Subcategories
            // ==========================================
            if (category.subcategories) {
                Object.keys(category.subcategories).forEach((subcatName) => {
                    // Check Subcategory Name
                    if (cleanText(subcatName).includes(query)) {
                        results.push({
                            type: "subcategory",
                            category: categoryName,
                            subcategory: subcatName,
                            title: subcatName,
                            path: `${categoryName}`,
                        });
                    }

                    // Check Items inside Subcategory
                    const items = category.subcategories[subcatName];
                    if (Array.isArray(items)) {
                        items.forEach((item) => {
                            if (cleanText(item.title).includes(query) || cleanText(item.lyrics).includes(query)) {
                                results.push({
                                    type: "item",
                                    category: categoryName,
                                    subcategory: subcatName,
                                    item: item,
                                    title: item.title,
                                    path: `${categoryName} > ${subcatName}`,
                                });
                            }
                        });
                    }
                });
            }

            // ==========================================
            // SEARCH LOCATION B: Direct Items 
            // ==========================================
            if (category.items && Array.isArray(category.items)) {
                category.items.forEach((item) => {
                    if (cleanText(item.title).includes(query) || cleanText(item.lyrics).includes(query)) {
                        results.push({
                            type: "item",
                            category: categoryName,
                            subcategory: null, 
                            item: item,
                            title: item.title,
                            path: `${categoryName}`,
                        });
                    }
                });
            }

            // ==========================================
            // SEARCH LOCATION C: Flat Lists
            // ==========================================
            if (Array.isArray(category)) {
                category.forEach((item) => {
                    if (cleanText(item.title).includes(query) || cleanText(item.lyrics).includes(query)) {
                        results.push({
                            type: "item",
                            category: categoryName,
                            subcategory: null,
                            item: item,
                            title: item.title,
                            path: `${categoryName}`,
                        });
                    }
                });
            }
        });
    }

    return results;
}

function displaySearchResults(results) {
  const container = document.getElementById("searchResultsContainer");

  if (results.length === 0) {
    container.innerHTML =
      '<div class="search-no-results">No results found</div>';
    return;
  }

  container.innerHTML = "";

  results.forEach((result) => {
    const div = document.createElement("div");
    div.className = "search-result-item";
    div.innerHTML = `
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-path">${result.path}</div>
                `;

    div.addEventListener("click", () => handleSearchResultClick(result));
    container.appendChild(div);
  });
}

function handleSearchResultClick(result) {
  closeSearch();

  if (result.type === "category") {
    openCategory(result.category);
  } else if (result.type === "subcategory") {
    currentCategory = result.category;
    openSubCategory(result.subcategory);
  } else if (result.type === "item") {
    currentCategory = result.category;
    currentSubCategory = result.subcategory;
    openLyrics(result.item);
  }
}

// ============================================
// RENDER HOME PAGE
// ============================================OPEN
function renderHome() {
  console.log("Rendering home page...");
  const grid = document.getElementById("categoryGrid");

  if (!grid) {
    console.error("Category grid element not found!");
    return;
  }

  grid.innerHTML = "";

  // Check if appData is loaded
  if (typeof appData === "undefined") {
    console.error("appData is not loaded. Check data.js");
    return;
  }

  const categories = Object.keys(appData);

  categories.forEach((category) => {
    const card = document.createElement("div");
    card.className = "category-card";
// 1. ADD THE SMART ICON INTERCEPTOR HERE
    let smartIcon = appData[category].icon;
    if (smartIcon && smartIcon.includes("<img") && !smartIcon.includes("loading=")) {
        smartIcon = smartIcon.replace("<img", "<img loading='lazy'");
    }

    // 2. UPDATE THE HTML TO USE smartIcon INSTEAD OF appData[category].icon
    card.innerHTML = `
        <div class="category-icon">${smartIcon}</div>
        <div class="category-name">${category}</div>
    `;
    card.addEventListener("click", function () {
      openCategory(category);
    });
    grid.appendChild(card);
  });

  currentCategory = null;
    currentSubCategory = null;

  showPage("homePage");
  updateHeader("Pocket Bhajan Diary", "menu");
  currentView = "home";
  navigationStack = [];
  closeVideo();
  closeSearch();
}

// ============================================
// CATEGORY NAVIGATION
// ============================================

function openCategory(category) {
  console.log("Opening category:", category);
  currentSubCategory = null;
  currentCategory = category;
  const categoryData = appData[category];

  // Check if category data exists to prevent crashes
  if (!categoryData) {
    console.error("Category data not found:", category);
    return;
  }

  // CASE 1: Flat list (No grouping - e.g., Aarti, Chalisa)
  if (categoryData.items) {
    const list = document.getElementById("itemList");
    list.innerHTML = "";

    categoryData.items.forEach((item) => {
      const listItem = document.createElement("div");
      listItem.className = "list-item";
      listItem.innerHTML = `<div class="list-item-title">${item.title}</div>`;
      listItem.addEventListener("click", function () {
        openLyrics(item);
      });
      list.appendChild(listItem);
    });

    navigationStack.push({ view: "home" });
    showPage("listPage");
    updateHeader(category, "back");
    currentView = "list";
  }
  // CASE 2: Grouped list (With subcategories - e.g., Bhajan)
  else if (categoryData.subcategories) {
    const subcategories = categoryData.subcategories;

    if (Object.keys(subcategories).length === 0) {
      alert("Content coming soon!");
      return;
    }

    const list = document.getElementById("subCategoryList");
    list.innerHTML = "";

    Object.keys(subcategories).forEach((subcat) => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `<div class="list-item-title">${subcat}</div>`;
      item.addEventListener("click", function () {
        openSubCategory(subcat);
      });
      list.appendChild(item);
    });

    navigationStack.push({ view: "home" });
    showPage("subCategoryPage");
    updateHeader(category, "back");
    currentView = "subcategory";
  }

  closeVideo();
  closeSearch();
}

function openSubCategory(subcat) {
  console.log("Opening subcategory:", subcat);
  currentSubCategory = subcat;
  const items = appData[currentCategory].subcategories[subcat];

  const list = document.getElementById("itemList");
  list.innerHTML = "";

  items.forEach((item) => {
    const listItem = document.createElement("div");
    listItem.className = "list-item";
    listItem.innerHTML = `<div class="list-item-title">${item.title}</div>`;
    listItem.addEventListener("click", function () {
      openLyrics(item);
    });
    list.appendChild(listItem);
  });

  navigationStack.push({ view: "subcategory", category: currentCategory });
  showPage("listPage");
  updateHeader(subcat, "back");
  currentView = "list";
  closeVideo();
  closeSearch();
}

function openLyrics(item) {
  console.log("Opening lyrics for:", item.title);
  currentItem = item;

// --- NEW: SAVE THE PLAYLIST SO NEXT/PREV KNOWS WHERE WE ARE ---
    if (currentSubCategory) {
        currentPlaylist = appData[currentCategory].subcategories[currentSubCategory];
    } else if (currentCategory && appData[currentCategory].items) {
        currentPlaylist = appData[currentCategory].items;
    } else {
        currentPlaylist = [item]; // Fallback for search results
    }
    // Find the exact number (index) of the song we clicked
    currentSongIndex = currentPlaylist.findIndex(song => song.title === item.title);
    updateNavButtons(); // Turns buttons on or off
    // -------------------------------------------------------------
  
  // Set Title and Lyrics
  document.getElementById("lyricsTitle").textContent = item.title;

  // Using innerText ensures the \n line breaks show up correctly
  const lyricsContainer = document.getElementById("lyricsText");
  if (lyricsContainer) {
    lyricsContainer.innerText = item.lyrics;
  }

  // Handle View Navigation
  if (currentView === "list") {
    navigationStack.push({
      view: "list",
      category: currentCategory,
      subcat: currentSubCategory,
    });
  } else {
    navigationStack.push({ view: "home", category: currentCategory });
  }

  showPage("lyricsPage");

  // 1. Setup basic header
  updateHeader(item.title, "back", true);

  // ============================================================
  // 🧠 SMART PLAY BUTTON LOGIC (Added Here)
  // ============================================================
  const headerRight = document.querySelector(".header-right");

if (headerRight) {
        // Force them into a perfect row so they don't overlap
        headerRight.style.display = "flex";
        headerRight.style.alignItems = "center";
        headerRight.style.gap = "15px";

        // A. Define the Search Icon AND the Gear Icon
        const searchIconHtml = `<div id="searchIcon" onclick="toggleSearch()" style="cursor: pointer; font-size: 16px;">🔍</div>`;
        const settingsIconHtml = `<div onclick="toggleSettings()" style="cursor: pointer; font-size: 18px; margin-right: 15px;">⚙️</div>`;

        // B. Get the Video ID (Check BOTH names!)
        const videoId = item.video || item.youtubeId;

        // C. Define Play Button
        let playButtonHtml = "";
        if (videoId && videoId.trim() !== "") {
            playButtonHtml = `<div style="cursor: pointer; color: #d4af37; font-size: 16px;" onclick="playVideo('${videoId}')">►</div>`;
        }

        // D. Combine ALL THREE of them
        headerRight.innerHTML = playButtonHtml + searchIconHtml + settingsIconHtml;
    }

  // if (headerRight) {
  //   // A. Define the Search Icon (Always present)
  //   const searchIconHtml = `<div class="search-icon" id="searchIcon" onclick="toggleSearch()">🔍</div>`;

  //   // B. Get the Video ID (Check BOTH names!)
  //   // Some files use 'video', some use 'youtubeId'. This handles both.
  //   const videoId = item.video || item.youtubeId;

  //   // C. Define Play Button
  //   let playButtonHtml = "";

  //   // Check if we found a valid ID
  //   if (videoId && videoId.trim() !== "") {
  //     playButtonHtml = `<div class="play-icon" style="margin-right: 15px; cursor: pointer;" onclick="playVideo('${videoId}')">▶ </div>`;
  //   }

  //   // D. Combine them
  //   headerRight.innerHTML = playButtonHtml + searchIconHtml;
  // }
  // ============================================================
  // ============================================================

  currentView = "lyrics";
  closeSearch();
}
// ============================================
// VIDEO PLAYER FUNCTIONS
// ============================================
function playVideo() {
  // 1. Safety Check
  if (!currentItem || !currentItem.youtubeId) {
    alert("Video not available");
    return;
  }

  // 2. Clean the ID
  const cleanID = currentItem.youtubeId.trim();
  console.log("Attempting to play:", cleanID);

  // 3. Get the Container
  const videoWrapper = document.getElementById("videoWrapper");

  // 4. Inject Player
  videoWrapper.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube-nocookie.com/embed/${cleanID}?autoplay=1&rel=0&modestbranding=1" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
        </iframe>
    `;

  // 5. Show Player and fix cropping
  document.getElementById("videoContainer").classList.add("active");

  // This line pushes the lyrics down so they don't get hidden behind the video
  const lyricsPage = document.getElementById("lyricsPage");
  if (lyricsPage) {
    lyricsPage.classList.add("video-playing");
  }
}

function closeVideo() {
  console.log("Closing video");
  document.getElementById("videoContainer").classList.remove("active");

  // This line moves the lyrics back up to the top
  const lyricsPage = document.getElementById("lyricsPage");
  if (lyricsPage) {
    lyricsPage.classList.remove("video-playing");
  }

  document.getElementById("videoWrapper").innerHTML = "";
}

// ============================================
// FEATURE PAGES (Updated for Credits)
// ============================================


function openFeaturePage(page) {
  console.log("Opening feature page:", page);
  closeDrawer();
  navigationStack.push({ view: currentView });

  document.getElementById("homePage").classList.add("hidden");

  // --- FIX: Force hide ALL feature pages first so they don't stack ---
    ['memoriesPage', 'feedbackPage', 'aboutPage', 'sevaPage', 'creditsPage'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    });
    // -------------------------------------------------------------------

  if (page === "memories") {
        showPage("memoriesPage");
        updateHeader("Event Memories", "back");
    } else if (page === "feedback") {
        showPage("feedbackPage");
        updateHeader("Feedback", "back");
    } else if (page === "about") {
        showPage("aboutPage");
        updateHeader("About", "back");
    } else if (page === "seva") {
        showPage("sevaPage");
        updateHeader("Mandir Seva", "back");
    } else if (page === "credits") {
        showPage("creditsPage");
        updateHeader("Credits", "back");
    }

  currentView = page;
  closeVideo();
  closeSearch();
}

function submitFeedback() {
  const name = document.getElementById("feedbackName").value;
  const text = document.getElementById("feedbackText").value;

  if (name && text) {
    alert("Thank you for your feedback!");
    document.getElementById("feedbackName").value = "";
    document.getElementById("feedbackText").value = "";
  } else {
    alert("Please fill all fields");
  }
}

function submitBhajan() {
  const title = document.getElementById("bhajanTitle").value;
  const lyrics = document.getElementById("bhajanLyrics").value;

  if (title && lyrics) {
    alert("Bhajan added successfully!");
    document.getElementById("bhajanTitle").value = "";
    document.getElementById("bhajanLyrics").value = "";
  } else {
    alert("Please fill all fields");
  }
}

// ============================================
// NAVIGATION HELPERS (Updated for Credits)
// ============================================
function showPage(pageId) {
  console.log("Showing page:", pageId);

  // --- FIX: Added 'creditsPage' to this list ---
const pages = [
            "homePage",
            "subCategoryPage",
            "listPage",
            "lyricsPage",
            "memoriesPage",
            "feedbackPage",
            "addBhajanPage",
            "creditsPage",
            "aboutPage",
            "sevaPage"
        ];
  pages.forEach((page) => {
    const element = document.getElementById(page);
    if (element) {
      element.classList.add("hidden");
    }
  });

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.remove("hidden");
  } else {
    console.error("Page not found:", pageId);
  }
}

function updateHeader(title, iconType, showPlayButton = false) {
    console.log("Updating header:", title, iconType, showPlayButton);
    document.getElementById("headerTitle").textContent = title;
    
    const leftIcon = document.getElementById("leftIcon");
    if (leftIcon) {
        leftIcon.textContent = iconType === "menu" ? "☰" : "←";
    }

    const headerRight = document.querySelector(".header-right");

    if (headerRight) {
        // Force them into a perfect row with 15px of space between them!
        headerRight.style.display = "flex";
        headerRight.style.alignItems = "center";
        headerRight.style.gap = "15px";
        
        let playButtonHtml = "";

        // Define the Play button
        if (showPlayButton && currentItem) {
            const videoId = currentItem.video || currentItem.youtubeId;
            if (videoId && videoId.trim() !== "") {
                playButtonHtml = `<div id="playVideoBtn" style="cursor: pointer; color: #d4af37; font-size: 16px;">►</div>`;
            }
        }

        // Combine them using pure HTML/inline-styles so CSS can't force them to overlap
        headerRight.innerHTML = 
            playButtonHtml + 
            `<div id="searchIcon" style="cursor: pointer; font-size: 16px;">🔍</div>` + 
            `<div onclick="toggleSettings()" style="cursor: pointer; font-size: 18px;">⚙️</div>`;

        // Attach the click features safely
        const searchBtn = document.getElementById("searchIcon");
        if (searchBtn) searchBtn.addEventListener("click", toggleSearch);

        const playBtn = document.getElementById("playVideoBtn");
        if (playBtn) playBtn.addEventListener("click", playVideo);
    }
}


function handleLeftIcon() {
  const icon = document.getElementById("leftIcon").textContent;
  if (icon === "☰") {
    openDrawer();
  } else {
    goBack();
  }
}

function goBack() {
  if (navigationStack.length === 0) return;

  const prevState = navigationStack.pop();

  if (prevState.view === "home") {
    renderHome();
  } else if (prevState.view === "subcategory") {
    currentCategory = prevState.category;
    openCategory(currentCategory);
    navigationStack.pop(); // Prevent double-stacking
  } else if (prevState.view === "list") {
    currentCategory = prevState.category;

    // FIX: Check if it's a grouped category (has subcat) or flat category
    if (prevState.subcat) {
      currentSubCategory = prevState.subcat;
      openSubCategory(currentSubCategory);
    } else {
      // If no subcategory, go back to category list (Aarti style)
      openCategory(currentCategory);
    }
    navigationStack.pop(); // Prevent double-stacking
  } else {
    renderHome();
  }

  closeVideo();
  closeSearch();
}

// ============================================
// DRAWER FUNCTIONS
// ============================================
function openDrawer() {
  document.getElementById("drawer").classList.add("active");
  document.getElementById("drawerOverlay").classList.add("active");
}

function closeDrawer() {
  document.getElementById("drawer").classList.remove("active");
  document.getElementById("drawerOverlay").classList.remove("active");
}

console.log("Script loaded successfully");

// ============================================
// VOICE SEARCH FEATURE 🎤
// ============================================
const voiceBtn = document.getElementById("voiceSearchBtn");
const searchInput = document.getElementById("searchInput");

// Check if browser supports speech recognition
if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();

  // Settings
  recognition.continuous = false;
  recognition.lang = "hi-IN"; // Default to Hindi (India)
  // recognition.lang = 'en-IN';  // <--- Changed from 'hi-IN' to 'en-IN' (English India)
  recognition.interimResults = false;

  // When you click the Mic
  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      try {
        recognition.start();
        voiceBtn.style.color = "red"; // Visual cue
        searchInput.placeholder = "Listening... Boliyie...";
      } catch (e) {
        console.log("Mic already active");
      }
    });
  }

  // When you stop speaking
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript; // Put text in box
    voiceBtn.style.color = ""; // Reset color
    searchInput.placeholder = "Search Bhajans, Aarti...";

    // Auto-trigger search
    if (typeof handleSearch === "function") {
      // Create a fake event to pass to your existing search function
      handleSearch({ target: { value: transcript } });
    }
  };

  // If error or stopped
  recognition.onend = () => {
    voiceBtn.style.color = "";
    searchInput.placeholder = "Search Bhajans, Aarti...";
  };
} else {
  if (voiceBtn) voiceBtn.style.display = "none"; // Hide mic if browser is old
  console.log("Voice search not supported in this browser");
}

// ==========================================
// PREVIOUS / NEXT BUTTON LOGIC (SMART VERSION)
// ==========================================

function goPrevious() {
    if (currentSongIndex > 0) {
        currentSongIndex--;
        const prevItem = currentPlaylist[currentSongIndex];
        changeLyricsOnScreen(prevItem);
    }
}

function goNext() {
    if (currentSongIndex < currentPlaylist.length - 1) {
        currentSongIndex++;
        const nextItem = currentPlaylist[currentSongIndex];
        changeLyricsOnScreen(nextItem);
    }
}

function changeLyricsOnScreen(item) {
    // 1. Update current item
    currentItem = item;
    
    // 2. Change the text on the screen
    document.getElementById("lyricsTitle").textContent = item.title;
    const lyricsContainer = document.getElementById("lyricsText");
    if (lyricsContainer) {
        lyricsContainer.innerText = item.lyrics;
    }

    // 3. Update the header (Play button & Title)
    updateHeader(item.title, "back", true);
    
    // 4. Update the buttons with the new smart names!
    updateNavButtons();
}

function updateNavButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    // --- 1. HANDLE PREVIOUS BUTTON ---
    if (prevBtn) {
        if (currentSongIndex > 0) {
            prevBtn.disabled = false;
            let title = currentPlaylist[currentSongIndex - 1].title;
            if (title.length > 12) title = title.substring(0, 12) + "...";
            prevBtn.innerHTML = `&#8592; ${title}`;
        } else {
            prevBtn.disabled = true;
            prevBtn.innerHTML = `&#8592; Previous`;
        }
    }
    
    // --- 2. HANDLE NEXT BUTTON ---
    if (nextBtn) {
        if (currentSongIndex < currentPlaylist.length - 1) {
            nextBtn.disabled = false;
            let title = currentPlaylist[currentSongIndex + 1].title;
            if (title.length > 12) title = title.substring(0, 12) + "...";
            nextBtn.innerHTML = `${title} &#8594;`;
        } else {
            nextBtn.disabled = true;
            nextBtn.innerHTML = `Next &#8594;`;
        }
    }
}

// ==========================================
// ZOOM IN / ZOOM OUT LOGIC
// ==========================================
function changeFontSize(changeAmount) {
    const lyricsText = document.getElementById("lyricsText");
    
    // Add or subtract from the current size
    currentFontSize += changeAmount;
    
    // Safety check: Don't let it get extremely tiny or massively huge!
    if (currentFontSize < 12) currentFontSize = 12;
    if (currentFontSize > 40) currentFontSize = 40;
    
    // Apply the new size to the lyrics
    lyricsText.style.fontSize = currentFontSize + "px";
    lyricsText.style.lineHeight = "1.8"; // Keeps line spacing readable when big
}

// ==========================================
// PINCH-TO-ZOOM GESTURE LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const lyricsBox = document.getElementById("lyricsText");
    let initialPinchDistance = null;

    // 1. Detect when two fingers touch the screen
    lyricsBox.addEventListener("touchstart", function(e) {
        if (e.touches.length === 2) {
            // Calculate the distance between the two fingers
            initialPinchDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
        }
    });

    // 2. Detect when the fingers move (pinching in or out)
    lyricsBox.addEventListener("touchmove", function(e) {
        if (e.touches.length === 2 && initialPinchDistance !== null) {
            // Prevent the screen from scrolling while zooming
            e.preventDefault(); 

            const currentDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );

            const distanceDifference = currentDistance - initialPinchDistance;

            // If fingers move apart, zoom IN (+1)
            if (distanceDifference > 15) {
                changeFontSize(1);
                initialPinchDistance = currentDistance; // Reset for smooth continuous zooming
            } 
            // If fingers squeeze together, zoom OUT (-1)
            else if (distanceDifference < -15) {
                changeFontSize(-1);
                initialPinchDistance = currentDistance;
            }
        }
    }, { passive: false }); // 'passive: false' is required to use e.preventDefault()

    // 3. Reset when fingers leave the screen
    lyricsBox.addEventListener("touchend", function(e) {
        initialPinchDistance = null;
    });
});

// ==========================================
// SETTINGS MENU LOGIC
// ==========================================
function toggleSettings() {
    const dropdown = document.getElementById("settingsDropdown");
    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
}
