import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import './charList.scss';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import MarvelService from '../../services/MarvelService';

const CharList = (props) => {
  const [charList, setCharList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemsLoading, setNewItemsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offset, setOffset] = useState(210);
  const [isEnd, setIsEnd] = useState(false);

  const marvelService = new MarvelService();

  useEffect(() => {
    if (newItemsLoading && !isEnd) {
      onRequest();
    }
  }, [newItemsLoading]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  });

  const onScroll = () => {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
      setNewItemsLoading(true);
    }
  };

  const onRequest = () => {
    onCharactersLoading();
    marvelService
      .getAllCharacters(offset)
      .then(onCharactersLoaded)
      .catch(onError)
      .finally(() => setNewItemsLoading(false));
  };

  const onCharactersLoading = () => {
    setNewItemsLoading(true);
  };

  const onCharactersLoaded = (newCharList) => {
    setCharList((charList) => [...charList, ...newCharList]);
    setLoading(false);
    setError(false);
    setOffset((offset) => offset + 9);
    setIsEnd(newCharList.length < 9 ? true : false);
  };

  const onError = () => {
    setLoading(false);
    setError(true);
  };

  const itemRefs = useRef([]);

  const onFocusItem = (id) => {
    itemRefs.current.forEach((item) => item.classList.remove('char__item_selected'));
    itemRefs.current[id].classList.add('char__item_selected');
  };

  const renderItems = () => {
    const { onCharSelected } = props;

    return (
      <>
        <ul className='char__grid'>
          {charList.map((item, i) => {
            let pathArr, imgStyle;
            if (item.thumbnail) {
              pathArr = item.thumbnail.split('/');
              imgStyle =
                pathArr[pathArr.length - 1] === 'image_not_available.jpg'
                  ? { objectFit: 'fill' }
                  : null;
            }

            return (
              <li
                ref={(el) => (itemRefs.current[i] = el)}
                tabIndex={0}
                className='char__item'
                key={item.id}
                onClick={() => {
                  onCharSelected(item.id);
                  onFocusItem(i);
                }}
                onKeyPress={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    onCharSelected(item.id);
                    onFocusItem(i);
                  }
                }}
              >
                <img style={imgStyle} src={item.thumbnail} alt={item.name} />
                <div className='char__name'>{item.name}</div>
              </li>
            );
          })}
        </ul>
        <button
          className='button button__main button__long'
          disabled={newItemsLoading}
          onClick={() => onRequest(offset)}
          style={{ display: isEnd ? 'none' : 'block' }}
        >
          <div className='inner'>load more</div>
        </button>
      </>
    );
  };

  const spinner = loading ? <Spinner /> : null;
  const errorMessage = error ? <ErrorMessage /> : null;
  const content = !(loading || errorMessage) ? renderItems() : null;

  return (
    <div className='char__list'>
      {spinner}
      {error}
      {content}
    </div>
  );
};

CharList.propTypes = {
  onCharSelected: PropTypes.func.isRequired,
};

export default CharList;
