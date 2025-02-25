import React, { useContext,useState } from 'react';

const RecipesContext = React.createContext();

function RecipesProvider({ children }) {
    const [recipes, setRecipes] =
        useState({recipes:[],recipes3rdParty:[]});
    const value = { recipes, setRecipes };
    return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}
const useRecipes = () => useContext(RecipesContext);

export { useRecipes, RecipesProvider};