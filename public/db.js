let db;
const DB_STORE_NAME = "pending";

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  // create obj store pending
  const db = event.target.result;
  db.createObjectStore("pending", {autoIncrement: true});
}

request.onsuccess = function(event) {
  db = event.target.result;

  // check if app is online
  if (navigator.onLine) {
    checkDatabase();
  }
}


request.onerror = function(event) {
  console.log("Error: ", event.target.errorCode);
}


// function called by index.js if post fetch to api/transaction fails
function saveRecord(record) {
  const store = getStore(DB_STORE_NAME, "readwrite");
  store.add(record);
}


function checkDatabase() {
  let store = getStore(DB_STORE_NAME, "readwrite");
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        // if successful, open a transaction on your pending db get store and clear all items
        const store = getStore(DB_STORE_NAME, "readwrite");
        
        var req = store.clear();

        req.onsuccess = () => {
          console.log("store cleared");
        }

        req.onerror = (error) => {
          console.log(error)
        }
      });
    }
  }
}

// returns the store
function getStore(storeName, mode) {  
  const transaction = db.transaction(storeName, mode);
  console.log("gettingstore");
  return transaction.objectStore(storeName);
}



// listen for app coming back online
window.addEventListener("online", checkDatabase);