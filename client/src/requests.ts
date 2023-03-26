export const fetcher = (...args: any[]) =>
  fetch(...args).then((res) => res.json());

export async function createSpace(url: string, { arg }: { arg: any }) {
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });
}

export const createDocument = (url: string, { arg }: { arg: any }) =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  }).then((res) => res.json());

export const updateDocument = (url: string, { arg }: { arg: any }) =>
  fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  }).then((res) => res.json());
