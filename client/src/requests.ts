export const fetcher = (...args: any[]) =>
  fetch(...args).then((res) => res.json());

export const poster = (url: string, { arg }: { arg: any }) =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  }).then((res) => res.json());

export const patcher = (url: string, { arg }: { arg: any }) =>
  fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  }).then((res) => res.json());
