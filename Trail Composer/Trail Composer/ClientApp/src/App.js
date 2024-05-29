import React, { createContext, useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import PageLayout from './structure/PageLayout/PageLayout';
import { useTcStore } from './store/TcStore';
import './App.css';
import TcSpinner from "./components/TCSpinner/TCSpinner";
import { useMsal } from "@azure/msal-react";
import { EventType } from "@azure/msal-browser";
import { b2cPolicies } from "./authConfig";
import { compareIssuingPolicy } from "./utils/auth/claimUtils";
import { getAuthHeader } from './utils/auth/getAuthHeader.js';

export const AppContext = createContext(null);

const App = () => {
  const [appData, setAppData] = useState(null);
  const Countries = useTcStore(state => state.Countries);
  const CountryNamesMap = useTcStore(state => state.CountryNamesMap);
  const POITypes = useTcStore(state => state.POITypes);
  const POITypesMap = useTcStore(state => state.POITypesMap);
  const initDictionaries = useTcStore((state) => state.initDictionaries);
  const spinner = useTcStore((state) => state.spinner);

  const { instance } = useMsal();
  useEffect(() => {
    const callbackId = instance.addEventCallback((event) => {
      if (
        (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
        event.payload.account
      ) {
        /**
         * For the purpose of setting an active account for UI update, we want to consider only the auth
         * response resulting from SUSI flow. "tfp" claim in the id token tells us the policy (NOTE: legacy
         * policies may use "acr" instead of "tfp"). To learn more about B2C tokens, visit:
         * https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
         */
        if (event.payload.idTokenClaims['tfp'] === b2cPolicies.names.editProfile) {
          // retrieve the account from initial sing-in to the app
          const originalSignInAccount = instance
            .getAllAccounts()
            .find(
              (account) =>
                account.idTokenClaims.oid === event.payload.idTokenClaims.oid &&
                account.idTokenClaims.sub === event.payload.idTokenClaims.sub &&
                account.idTokenClaims['tfp'] === b2cPolicies.names.signUpSignIn
            );

          let signUpSignInFlowRequest = {
            authority: b2cPolicies.authorities.signUpSignIn.authority,
            account: originalSignInAccount,
          };

          // silently login again with the signUpSignIn policy
          instance.ssoSilent(signUpSignInFlowRequest);
        }

        /**
         * Below we are checking if the user is returning from the reset password flow.
         * If so, we will ask the user to reauthenticate with their new password.
         * If you do not want this behavior and prefer your users to stay signed in instead,
         * you can replace the code below with the same pattern used for handling the return from
         * profile edit flow
         */
        if (compareIssuingPolicy(event.payload.idTokenClaims, b2cPolicies.names.resetPassword)) {
          let signUpSignInFlowRequest = {
            authority: b2cPolicies.authorities.signUpSignIn.authority,
          };
          instance.loginRedirect(signUpSignInFlowRequest);
        }
      }

      if (event.eventType === EventType.SSO_SILENT_SUCCESS) {
       console.log('SSO SILENT_SUCCESS');

        // update userName in Back-end by sending updated token which contains updated userName
        const account = instance.getAllAccounts()[0] || {};
        getAuthHeader(instance, account).then(authorizationHeader => {
          fetch('tc-api/user', {
            method: 'PUT',
            headers: {
              Authorization: authorizationHeader
            }
          })
            .then(response => {
              if (response.ok) {
                if (response.status === 201 || response.status === 200) {
                  console.log('User name updated successfully');
                } else {
                  console.error('Unexpected response status:', response.status);
                }
              } else {
                console.error('Error updating user name:', response.status);
              }
            })
            .catch(error => {
              console.error('Error updating user name:', error);
            });
        });
      }

      if (event.eventType === EventType.LOGIN_FAILURE) {
        // Check for forgot password error
        // Learn more about AAD error codes at https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-aadsts-error-codes
        if (event.error && event.error.errorMessage.includes('AADB2C90118')) {
          const resetPasswordRequest = {
            authority: b2cPolicies.authorities.resetPassword.authority,
            scopes: [],
          };
          instance.loginRedirect(resetPasswordRequest);
        }
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
    // eslint-disable-next-line
  }, [instance]);

  useEffect(() => {
    initDictionaries();
  }, []);

  useEffect(() => {
    const initialData = {};
    initialData.Countries = Countries;
    initialData.CountryNamesMap = CountryNamesMap;
    initialData.POITypes = POITypes;
    initialData.PoiTypesMap = POITypesMap;
    setAppData(initialData);
  }, [Countries, CountryNamesMap, POITypes, POITypesMap]);

  return (
    <AppContext.Provider value={appData}>
      { spinner && <TcSpinner /> }
      <PageLayout>
        <Routes>
          {AppRoutes.map((route, index) => {
            const { element, key, ...rest } = route;
            return <Route key={key} {...rest} element={React.cloneElement(element, { key })} />;
          })}
        </Routes>
      </PageLayout>
    </AppContext.Provider>
  );
};

export default App;
