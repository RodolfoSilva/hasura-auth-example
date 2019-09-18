import { createClient } from 'urql';

const client = createClient({
  url: process.env.REACT_APP_GRAPHQL_SERVER_ENDPOINT as string,
  fetchOptions: () => {
    const token = window.sessionStorage.getItem('access-token');

    if (!token) {
      return {};
    }

    return {
      headers: {
        'X-Hasura-role': process.env.REACT_APP_AUTHENTICATED_ROLE as string,
        Authorization: `Bearer ${token}`,
      },
    };
  },
});

export default client;
