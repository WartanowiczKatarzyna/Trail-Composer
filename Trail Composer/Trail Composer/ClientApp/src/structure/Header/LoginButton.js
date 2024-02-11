import React from "react";
import { Button } from 'reactstrap';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

export const LoginButton = () => {
    const { instance } = useMsal();

    return (
        <React.Fragment> 
            <AuthenticatedTemplate>
                <Button size="sm" onClick={() => instance.logout()}>Wyloguj</Button>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <Button size="sm" onClick={() => instance.loginPopup()}>Zaloguj</Button>
            </UnauthenticatedTemplate>
        </React.Fragment>
    );
};

export default LoginButton