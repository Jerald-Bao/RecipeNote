import "../style/home.css";

import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import {RecipesPage} from "./RecipeSearchTab";
import {RecipesProvider} from "./RecipesPageContext";


export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const signUp = () => loginWithRedirect({ screen_hint: "signup" });

  return (
    <div className="home">
        <RecipesProvider>
        <RecipesPage></RecipesPage>
        </RecipesProvider>
    </div>
  );
}
