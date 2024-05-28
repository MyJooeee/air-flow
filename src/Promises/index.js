const fetchApi = (url, callback) => {
    return fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
          return result
        },
        (error) => {
            console.log(error);
            callback(error)
        }
      );
  };

  export { fetchApi };