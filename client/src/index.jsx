import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import VerifyUser from "./components/VerifyUser";
import RecipeDetail from "./components/RecipeDetail";
import RecipeUpdate from "./components/RecipeUpdate";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { AuthTokenProvider } from "./AuthTokenContext";
import { RecipesProvider } from "./components/RecipesPageContext";
import "./style/normalize.css";
import "./style/index.css";

const container = document.getElementById("root");

const requestedScopes = ["profile", "email"];

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  // If the user is not authenticated, redirect to the home page
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, display the children (the protected page)
  return children;
}

const root = ReactDOMClient.createRoot(container);

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <RecipesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/verify-user" element={<VerifyUser />} />
              <Route path="/recipe/:recipeId" element={<RecipeDetail />} />
              <Route path="/recipe3rdParty/:recipe3rdId" element={<RecipeDetail />} />
              <Route path="/recipeUpdate/:recipeId" element={<RecipeUpdate />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RecipesProvider>
      </AuthTokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);
