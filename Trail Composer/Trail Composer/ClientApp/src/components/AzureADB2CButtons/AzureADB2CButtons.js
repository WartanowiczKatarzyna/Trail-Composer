import React from "react";
import {Button, Nav, NavLink} from 'reactstrap';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { InteractionStatus } from '@azure/msal-browser';
import { b2cPolicies } from '../../authConfig';
import {Link} from "react-router-dom";

export const AzureADB2CButtons = () => {
    const { instance: pca, inProgress } = useMsal();

  function signUp() {
    const signUpRequest = b2cPolicies.authorities.signUp;
    pca.loginPopup(signUpRequest).catch(error => { console.log(error); });
  }

  function editProfile() {
    if (inProgress === InteractionStatus.None) {
      const editProfileRequest = b2cPolicies.authorities.editProfile;
      pca.loginPopup(editProfileRequest).catch(error => { console.log(error); });
    }
  }

  function resetPassword() {
    const resetPasswordRequest = b2cPolicies.authorities.resetPassword;
    resetPasswordRequest.scopes = [];
    pca.loginPopup(resetPasswordRequest).catch(error => { console.log(error); });
  }

    return (
      <React.Fragment>

        <AuthenticatedTemplate>
          <Nav className="flex-row" navbar>
            <NavLink tag={Link} className="text-dark" to="/">
              <Button size="sm" onClick={editProfile}>Edytuj profil</Button>
            </NavLink>
            <NavLink tag={Link} className="text-dark" to="/">
              <Button size="sm" onClick={resetPassword}>Zmień Hasło</Button>
            </NavLink>
            <NavLink tag={Link} className="text-dark" to="/">
              <Button size="sm" onClick={() => pca.logout()}>Wyloguj</Button>
            </NavLink>
          </Nav>
        </AuthenticatedTemplate>

        <UnauthenticatedTemplate>
          <Nav className="flex-row" navbar>
            <NavLink tag={Link} className="text-dark" to="/">
              <Button size="sm" onClick={signUp}>Utwórz konto</Button>
            </NavLink>
            <NavLink tag={Link} className="text-dark" to="/">
              <Button size="sm" onClick={() => pca.loginPopup({scopes: ['openid', 'offline_access']})}>Zaloguj</Button>
            </NavLink>
          </Nav>
        </UnauthenticatedTemplate>

      </React.Fragment>
    );
};

export default AzureADB2CButtons
