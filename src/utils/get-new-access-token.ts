const REFRESH_TOKEN_MUTATION = `
  mutation refresh_token($refresh_token: String!) {
    auth_refresh_token(refresh_token: $refresh_token) {
      access_token
    }
  }
`;

export async function getNewAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch(
    process.env.REACT_APP_GRAPHQL_SERVER_ENDPOINT as string,
    {
      method: 'POST',
      headers: {
        'application-type': 'application/json',
      },
      body: JSON.stringify({
        query: REFRESH_TOKEN_MUTATION,
        variables: {
          refresh_token: refreshToken,
        },
      }),
    },
  );

  const { data, errors } = await response.json();

  if (errors && errors.length >= 1) {
    throw new Error(errors[0].message);
  }

  return data.auth_refresh_token.access_token;
}
