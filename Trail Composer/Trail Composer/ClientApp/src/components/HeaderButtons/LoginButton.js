import React from "react";
import { Button } from 'reactstrap';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

export const LoginButton = () => {
    const { instance: pca } = useMsal();

    return (
        <React.Fragment> 
            <AuthenticatedTemplate>
                <Button size="sm" onClick={() => pca.logout()}>Wyloguj</Button>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <Button size="sm" onClick={() => pca.loginPopup({scopes:['openid', 'offline_access']})}>Zaloguj</Button>
            </UnauthenticatedTemplate>
        </React.Fragment>
    );
};

export default LoginButton