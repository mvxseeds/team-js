import { lskeys } from "./ls-data";
import { getUpdatedData } from './page-content-loader';
import { onSpinnerDisabled, onSpinnerEnabled } from './loader-spinner';
import { container } from './search-movies';

export const galleryList = document.querySelector('.movieList');
export const textError = document.querySelector('.input__error');
export const footer = document.querySelector('.footer');


// try map genres first, generate markup second
// mapped genres are added to markup 
export function getDataMoviesTrend() {
  footer.classList.add('footer-active');
  container.classList.add('visually-hidden');
  onSpinnerEnabled();
  getUpdatedData(lskeys.HOME_CONTENT)
    .then((data) => {
      const markup = createMarkupOfTrendingMovies(data);
      container.classList.remove('visually-hidden');
      onSpinnerDisabled();
    })
    .catch(err => console.log(err));
};
getDataMoviesTrend();

export function createMarkupOfTrendingMovies(obj) {
  if (obj.results.length) {
    const markup = obj.results
      .map(({
          id,
          title,
          name,
          poster_path,
          genre_names,
          release_date,
          first_air_date,
          vote_average,
        }) => 
        `<li class="movieCard" data="${id}">
      <div class="movieCard__img-wrapper">
      <img src="https://image.tmdb.org/t/p/w500/${poster_path}"
        alt="${title || name} movie poster"
        loading="lazy"
        class="movieCard__img"
      />
      </div>
      <div class="movieCard__text">
        <h2 class="movieCard__title">${(title || name).toUpperCase()}</h2>
        <p class="movieCard__info"> ${genre_names} | ${new Date(
          release_date || first_air_date
        ).getFullYear()}
          <span class="movieCard__rate">${vote_average.toFixed(1)}</span></p>
      </div>
      </li>
` 
      )
      .join('');
    galleryList.insertAdjacentHTML('afterBegin', markup);
    footer.classList.remove('footer-active');
  } else {
    textError.classList.add('is-active');
    setTimeout(() => {
      textError.classList.remove('is-active');
    }, 2000);
  }
}

export function onFooterFixed() {
  footer.classList.add('footer-active');
  container.classList.add('visually-hidden');
}

export function onFooterNoFixed() {
  footer.classList.remove('footer-active');
  container.classList.remove('visually-hidden');
}