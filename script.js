// ============================================
// GLOBAL STATE VARIABLES
// ============================================
let navigationStack = [];
let currentView = "home";
let currentCategory = null;
let currentSubCategory = null;
let currentItem = null;
let searchActive = false;

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

function searchAppData(query) {
  const results = [];

  if (typeof appData !== "undefined") {
    Object.keys(appData).forEach((categoryName) => {
      const category = appData[categoryName];

      if (!category) return; // Skip empty stuff

      // 1. Match Main Category Name (e.g. "Aarti")
      if (categoryName.toLowerCase().includes(query)) {
        results.push({
          type: "category",
          category: categoryName,
          title: categoryName,
          path: "Main Category",
        });
      }

      // ============================================
      // SEARCH LOCATION A: Subcategories (Existing)
      // ============================================
      if (category.subcategories) {
        Object.keys(category.subcategories).forEach((subcatName) => {
          // Check Subcategory Name
          if (subcatName.toLowerCase().includes(query)) {
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
              if (item.title && item.title.toLowerCase().includes(query)) {
                results.push({
                  type: "item",
                  category: categoryName,
                  subcategory: subcatName, // Important for opening correct page
                  item: item,
                  title: item.title,
                  path: `${categoryName} > ${subcatName}`,
                });
              }
            });
          }
        });
      }

      // ============================================
      // SEARCH LOCATION B: Direct Items (The Fix for Aarti!) 🛠️
      // ============================================
      // Checks if the category has a direct "items" list
      if (category.items && Array.isArray(category.items)) {
        category.items.forEach((item) => {
          if (item.title && item.title.toLowerCase().includes(query)) {
            results.push({
              type: "item",
              category: categoryName,
              subcategory: null, // No subcategory
              item: item,
              title: item.title,
              path: `${categoryName}`,
            });
          }
        });
      }

      // ============================================
      // SEARCH LOCATION C: Flat Lists
      // ============================================
      // Checks if the category itself is just a list of songs
      if (Array.isArray(category)) {
        category.forEach((item) => {
          if (item.title && item.title.toLowerCase().includes(query)) {
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
    // Using the updated HTML/CSS structure
    card.innerHTML = `
                    <div class="category-icon">${appData[category].icon}</div>
                    <div class="category-name">${category}</div>
                `;
    card.addEventListener("click", function () {
      openCategory(category);
    });
    grid.appendChild(card);
  });

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
    // A. Define the Search Icon (Always present)
    const searchIconHtml = `<div class="search-icon" id="searchIcon" onclick="toggleSearch()">🔍</div>`;

    // B. Get the Video ID (Check BOTH names!)
    // Some files use 'video', some use 'youtubeId'. This handles both.
    const videoId = item.video || item.youtubeId;

    // C. Define Play Button
    let playButtonHtml = "";

    // Check if we found a valid ID
    if (videoId && videoId.trim() !== "") {
      playButtonHtml = `<div class="play-icon" style="margin-right: 15px; cursor: pointer;" onclick="playVideo('${videoId}')">▶ </div>`;
    }

    // D. Combine them
    headerRight.innerHTML = playButtonHtml + searchIconHtml;
  }
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

  if (page === "memories") {
    showPage("memoriesPage");
    updateHeader("Event Memories", "back");
  } else if (page === "feedback") {
    showPage("feedbackPage");
    updateHeader("Feedback", "back");
  } else if (page === "addBhajan") {
    showPage("addBhajanPage");
    updateHeader("Add Bhajan", "back");
  } else if (page === "credits") {
    // --- FIX: Added logic for Credits ---
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
  leftIcon.textContent = iconType === "menu" ? "☰" : "←";

  const headerRight = document.querySelector(".header-right");
  if (showPlayButton && currentItem && currentItem.youtubeId) {
    headerRight.innerHTML =
      '<button class="play-button" id="playVideoBtn">▶ Play</button>';
    document
      .getElementById("playVideoBtn")
      .addEventListener("click", playVideo);
  } else {
    headerRight.innerHTML = '<div class="search-icon" id="searchIcon">🔍</div>';
    document
      .getElementById("searchIcon")
      .addEventListener("click", toggleSearch);
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
