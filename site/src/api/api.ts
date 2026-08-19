export const request = (url: string, options?: RequestInit) =>
  fetch(`/api${url}`, options).then((res) => {
    if (!res.ok) {
      return res.json().then((err) => Promise.reject(err));
    }
    return res.json();
  });
