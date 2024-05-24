const fetchApi = (url) => {
    return fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
          return result
        },
        (error) => {
            console.log(error);
            return error;
        }
      );
  };

  export { fetchApi };