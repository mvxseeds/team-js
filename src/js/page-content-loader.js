// *** PAGE CONTENT LOAD *** //

// import localStorage getter, setter and keys
import { getStorageData, setStorageData  } from "./ls-data";
import { lskeys } from "./ls-data";
const { GENRES, HOME_CONTENT, CRT_CONTENT, CRT_USER, TMP_QUEUE, TMP_WATCHED, STORAGE_USERS } = lskeys;

// import movie content fetch fn
import { getTrendMovies, getGenresMovies, getQueryMovies } from "./api-fetch";



// load critical data for page rendering
// if storage is empty
if (localStorage.length === 0) {
    onFirstLoad();
} 
// load stored page content otherwise
else {
    onPageReload();
}

async function onFirstLoad() {
    // repeating keyval setting may be replaced with config for ls-data
    const genres = await getGenresMovies();
    setStorageData(GENRES, genres);

    let trends = await getTrendMovies();
    trends = await addGenreNames(trends);

    setStorageData(HOME_CONTENT, trends);
    setStorageData(CRT_CONTENT, trends);
    setStorageData(CRT_USER, 0);
    setStorageData(STORAGE_USERS, []);
    setStorageData(TMP_QUEUE, []);
    setStorageData(TMP_WATCHED, []);

    location.reload();
}


function onPageReload() {
    if (isOnHomePage) {
        const content = getStorageData(HOME_CONTENT);
        setStorageData(CRT_CONTENT, content);
    }
}


export async function onLoadTrendsPage(page) {
    try {
        let movies = await getTrendMovies(page);
        movies = await addGenreNames(movies);
        setStorageData(CRT_CONTENT, movies);
        return movies;
    } 
    catch (err) {
        return console.error(err);
    }
}


export async function onSearchMovies(query, page=1) {
    try {
        let movies = await getQueryMovies(query, page);
        movies = await addGenreNames(movies);
        setStorageData(CRT_CONTENT, movies);
    } 
    catch (err) {
        return console.error(err);
    }
}


export async function getUpdatedData(key) {
    try {
        const data = await getStorageData(key);
        return data;
    }
    catch (err) {
        return console.error(err);
    }
}






// check if current page is home page
export function isOnHomePage() {
    const currentPageURL = window.location.href;
    // home page urls and analogs
    const HOME_URLS = [
        // if hosted locally
        'http://localhost:1234/', 
        'http://localhost:1234/index.html',
        // if deployed
        'https://humbubahumbuba.github.io/team-js/',
        'https://humbubahumbuba.github.io/team-js/index.html'
    ];

    return HOME_URLS.includes(currentPageURL);
}



// add genre names 
async function addGenreNames(obj) {
  const g = await getUpdatedData(GENRES);

  obj.results.map(data => {
    const ids = data.genre_ids;
    const movieGenres = [];

    g.forEach(genre => {
      if (ids.includes(genre.id)) {
        movieGenres.push(genre.name);
      }
    });

    if (movieGenres.length > 2) {
      data.genre_names = `${movieGenres[0]}, ${movieGenres[1]}, Other`;
    } else {
      data.genre_names = movieGenres.join(', ');
    }

  });

  return obj;
}




// IMPORT TEMP QUEUE/WATCHED IF LOGGED-IN
// check if any user
function isLoggedIn() { 
    let currentUser = getStorageData(CRT_USER);
    return currentUser;
}


// import fn
export async function importTempLibrary() {
    let currentUserId = await getPromisedData(CRT_USER);
    let usersData = await getPromisedData(STORAGE_USERS);

    try {
        await new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, 500);
        });

        if (isLoggedIn()) {
            const params = [ TMP_QUEUE, TMP_WATCHED ];

            params.forEach(key => {
                if(getStorageData(key)) {
                    const param = key.slice(5, key.length);
                    const arr = getStorageData(key);

                    // find user index in data
                    const userIndex = usersData.findIndex((u) => u.userid === currentUserId);

                    // overwrite users data
                    usersData[userIndex][param].concat(arr);
                    setStorageData(key, []);
                }
            });

            updateKeys();
        }
    }
    catch (err) {
        console.error(err);
    }
};



// ADD-REMOVE DATA FROM QUEUE-WATCHED //
// export functions
export function addMovieToQueue(movie) {
    addMovie(movie, TMP_QUEUE);
}

export function addMovieToWatched(movie) {
    addMovie(movie, TMP_WATCHED);
}

export function removeMovieFromQueue(movieId) {
    removeMovie(movieId, TMP_QUEUE);
}

export function removeMovieFromWatched(movieId) {
    removeMovie(movieId, TMP_WATCHED);
}


// add data to ls (query/watched)
async function addMovie(movie, key) {
    let data = getStorageData(key);
    let currentUserId = getStorageData(CRT_USER);
    let usersData = getStorageData(STORAGE_USERS);

    try {
        await new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, 100);
        });

        // check if any user currently logged in
        if (!isLoggedIn()) {
            data = getStorageData(key);

            // do this if no logged in user
            if (isDuplicate(data, movie)) {
                console.log("Item already in the list!");
            } else {
                data.push(movie);
            }

            setStorageData(key, data);
        } else {
            // do this if user logged in
            data = getStorageData(key);
            currentUserId = getStorageData(CRT_USER);
            usersData = getStorageData(STORAGE_USERS);

            // find user index in data
            const userIndex = usersData.findIndex((u) => u.userid === currentUserId);

            // get key param and list of objects
            const param = key.slice(5, key.length);
            const userList = usersData[userIndex][param];

            // overwrite users data if not changed
            if (isDuplicate(userList, movie)) {
                console.log("Item already in the list!");
            } else {
                userList.push(movie);
            }

            // and pass it as storage value
            setStorageData(STORAGE_USERS, usersData);
        }
    }
    catch (err) {
        console.error(err);
    }
}


// remove data from ls (query/watched)
async function removeMovie(movieId, key) {
    let data = getStorageData(key);
    let currentUserId = getStorageData(CRT_USER);
    let usersData = getStorageData(STORAGE_USERS);

    try {
        await new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, 100);
        });

        if (!isLoggedIn()) {
            data = getStorageData(key);

            removeItemByIndex(data, "id", movieId);
            setStorageData(key, data);
        } else {
            data = getStorageData(key);
            currentUserId = getStorageData(CRT_USER);
            usersData = getStorageData(STORAGE_USERS);

            const param = key.slice(5, key.length);
            const userIndex = usersData.findIndex((u) => u.userid === currentUserId);

            removeItemByIndex(usersData[userIndex][param], "id", movieId);

            setStorageData(STORAGE_USERS, usersData);
        }
    }
    catch (err) {
        console.error(err);
    }
}



function removeItemByIndex(arr, itemId, searchedId) {
    // find item index by id
    const objWithIdIndex = arr.findIndex((item) => item[itemId] === searchedId);

    // if found - remove from list
    if (objWithIdIndex > -1) {
        arr.splice(objWithIdIndex, 1);
    }
}


function isDuplicate(arr, item) {
    return arr.find(el => el.id === item.id);
}
