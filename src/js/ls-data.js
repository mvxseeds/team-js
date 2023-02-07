// localStorage keys + synchronous get/set

// const keys for localStorage
export const lskeys = {
  CRT_USER: 'crt-user',
  TMP_QUEUE: 'temp-queue',
  TMP_WATCHED: 'temp-watched',
  HOME_CONTENT: 'home-page-content',
  CRT_CONTENT: 'crt-page-content',
  GENRES: 'mov-genres',
  STORAGE_USERS: 'app-users',
};


// get data by key
export function getStorageData(key) {
  try {
    const serializedData = localStorage.getItem(key);
    return serializedData === null ? undefined : JSON.parse(serializedData);
  } catch (error) {
    console.error('Get state error: ', error.message);
  }
}

// set data
export function setStorageData(key, data) {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error('Set state error: ', error.message);
  }
}

// remove data
export function removeStorageData(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Remove state error: ', err);
  }
}
