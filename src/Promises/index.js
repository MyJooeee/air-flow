// OpenWeather répond { cod, message } en cas d'erreur (clé invalide, quota…) :
// on lève une erreur explicite au lieu de laisser passer une réponse inexploitable
const fetchApi = async (url) => {
  const res = await fetch(url);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(body?.message ? `${res.status} - ${body.message}` : `HTTP ${res.status}`);
  }

  return body;
};

export { fetchApi };
