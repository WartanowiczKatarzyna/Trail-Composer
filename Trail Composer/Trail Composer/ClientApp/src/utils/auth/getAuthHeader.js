export async function getAuthHeader(pca, account) {
  var request = {
    account: account,
    scopes:['openid', 'offline_access', pca.getConfiguration().auth.clientId]
  }
  var response = await pca.acquireTokenSilent(request);
  const authorizationHeader = `Bearer ${response.accessToken}`;
  return authorizationHeader;
}