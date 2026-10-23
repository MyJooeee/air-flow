// OpenWeather répond { cod, message } en cas d'erreur (clé invalide, quota…) :
// on lève une erreur qui garde le statut HTTP, pour que l'appelant explique la cause
const fetchApi = async (url) => {
  const res = await fetch(url);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(body?.message ?? `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return body;
};

export { fetchApi };
