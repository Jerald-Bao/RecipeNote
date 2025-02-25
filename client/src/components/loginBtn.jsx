import React, { useState } from 'react';
import '../style/RecipesPage.css'
import { useAuth0 } from "@auth0/auth0-react";


const login = (loginWithRedirect) => {
    console.log("return to:" + window.location.origin);
    localStorage.setItem('postLoginRedirectUri', window.location.pathname);
    loginWithRedirect()
}
const LoginBtn = () => {
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
    return (<div>
        {
            !isAuthenticated ? (
                <button onClick={() =>
                    login(loginWithRedirect)
                }>
                    Log In
                </button>) : (
                <button onClick={() =>
                    logout({ logoutParams: { returnTo: window.location.origin } })
                } className="loginButton">
                    Log out
                </button>
            )
        }</div>);
}
export { LoginBtn, login };