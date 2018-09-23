export const sendLoginSignedMessage = async (signed, username) => {
  const uri = `${document.location.origin}/radiks/auth/login`;
  const data = {
    username,
    ...signed,
    origin: document.location.origin,
  };
  console.log(data);
  const request = await fetch(uri, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(data),
  });
  const { success } = await request.json();
  return success;
};
