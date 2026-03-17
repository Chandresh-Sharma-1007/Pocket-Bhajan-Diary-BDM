// STEP 1: The Safety Net (Paste this in every file)
if (!window.appData["Bhajans"]) {
    window.appData["Bhajans"] = {
        icon: "<img src='bhajan.png' style='width: 150px;'>",
        subcategories: {}
    };
}

// STEP 2: The Specific Songs for THIS file
window.appData["Bhajans"].subcategories["Hanuman Bhajan"] = [
    {
        title: "Aa Laut Ke Aaja Hanuman",
        youtubeId: "LXb3EKWsInQ",
        lyrics: "..."
    }
];
// ... existing code ...

window.appData["Bhajans"].subcategories["Hanuman Bhajan"].push({
    title: "Anjani Sut Hari Man Bhayo",
    youtubeId: "dztgbdIDHI8", // <--- The ID from your screenshot
    lyrics: "Anjani Sut Hari Man Bhayo..."
});