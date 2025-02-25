import React, { useEffect, useState } from 'react';
import RecipeTable from './RecipeTable';
import '../style/RecipesPage.css'
import { useRecipes } from "./RecipesPageContext";
import { useAuth0 } from "@auth0/auth0-react";
import { LoginBtn, login } from "./loginBtn";
import { RecipePublishPage } from "./RecipePublish";
import Profile from "./Profile";

const MyRecipeTab = 'My Recipes';
const SearchTab = 'Search Recipes';
const RecipePublishTab = 'Publish Recipe';
const AuthDebugger = 'Auth Debugger';


// request all the recipes the user created
const RequestMyRecipes = async (token) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/recipes/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            console.error(response);
            throw new Error('Data fetching failed');
        }
        const result = await response.json();
        return result;
    } catch (e) {
        console.log(`Error when executing fetching my recipes: ${e}`);
    }
};

const RecipesPage = () => {

    // State to track the active tab
    const [activeTab, setActiveTab] = useState(SearchTab);
    const [searchTerm, setSearchTerm] = useState('');
    const [userName, setUserName] = useState('');
    const [recipeCount, setRecipeCount] = useState(0);
    const { recipes, setRecipes } = useRecipes();
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

    // Handler for the search input change
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // The async search function
    const performSearch = async () => {
        console.log(`Searching for: ${searchTerm}`);
        try {
            const serverResponse = await fetch(`${process.env.REACT_APP_API_URL}/recipes/search/${searchTerm}`);
            if (!serverResponse.ok) {
                console.error(serverResponse);
                throw new Error('Data fetching failed');
            }
            const serverResult = await serverResponse.json();
            if (!searchTerm || searchTerm.trim() === '') {
                setRecipes({ recipes: serverResult, recipes3rdParty: [] });
                return;
            }
            const thirdPartyResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
            if (!thirdPartyResponse.ok) {
                console.error(thirdPartyResponse);
                throw new Error('Data fetching failed');
            }
            const thirdPartyResult = await thirdPartyResponse.json();
            setRecipes({ recipes: serverResult, recipes3rdParty: thirdPartyResult.meals });
        } catch (e) {
            console.log(`Error when executing searching: ${e}`);
        }
    };

    // request user information
    const RequestMyUser = async (token) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/user/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                console.error(response);
                throw new Error('Data fetching failed');
            }
            const result = await response.json();
            return result;
        } catch (e) {
            console.log(`Error when executing fetching my recipes: ${e}`);
        }
    };

    // Handler for the key press event
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    };

    // initialize the recipe table.
    useEffect(() => {
        if (activeTab === SearchTab)
            performSearch()
    }, []);

    const requestMyRecipes = () => {
        // The search function
        const performRequestMyRecipes = async () => {
            const token = await getAccessTokenSilently();
            const result = await RequestMyRecipes(token);
            setRecipes({ recipes: result, recipes3rdParty: [] });
            const userResult = await RequestMyUser(token);
            setUserName(userResult.name);
            setRecipeCount(result.length);
        }

        // clear the table first.
        setRecipes({ recipes: [], recipes3rdParty: [] });
        performRequestMyRecipes();
    }

    useEffect(() => {
        setRecipeCount(recipes.recipes.length);
    }, [recipes]);


    return (
        <div>
            {/* Tab Bar */}
            <div className="tab-bar">
                <button onClick={() => {
                    performSearch()
                    setActiveTab(SearchTab)
                }} className={activeTab === SearchTab ? 'active' : ''}>
                    {SearchTab}
                </button>
                <button onClick={() => {
                    if (isAuthenticated) {
                        setActiveTab(MyRecipeTab)
                        requestMyRecipes();
                    } else {
                        login(loginWithRedirect)
                    }
                }}
                    className={activeTab === MyRecipeTab ? 'active' : ''}>
                    {MyRecipeTab}
                </button>
                <button onClick={() => {
                    if (isAuthenticated) {
                        setActiveTab(RecipePublishTab)
                    } else {
                        login(loginWithRedirect)
                    }
                }}
                    className={activeTab === RecipePublishTab ? 'active' : ''}>
                    {RecipePublishTab}
                </button>
                <button onClick={() => {
                    if (isAuthenticated) {
                        setActiveTab(AuthDebugger)
                    } else {
                        login(loginWithRedirect)
                    }
                }}
                    className={activeTab === AuthDebugger ? 'active' : ''}>
                    {AuthDebugger}
                </button>
                <LoginBtn></LoginBtn>
                {/*
                */}
            </div>

            {/* Conditional rendering of the Recipe Publish Bar based on the active tab */}
            {(activeTab === RecipePublishTab &&
                <RecipePublishPage></RecipePublishPage>
            )}
            {(activeTab === SearchTab &&
                <div className="search-bar">
                    <input type="text" placeholder="Search for recipes or ingridents"
                        value={searchTerm}
                        onKeyDown={handleKeyPress}
                        onChange={handleSearchChange}
                    />
                </div>
            )}
            {(activeTab === MyRecipeTab &&
                <div className="profile-container">
                    <h2>{userName}'s Profile</h2>
                    <p>Number of Recipes: {recipeCount}</p>
                </div>
            )}

            {(activeTab === AuthDebugger &&
                <Profile> </Profile>
            )}

            {/* Conditional rendering of the Recipe table based on the active tab */}
            {(activeTab !== RecipePublishTab && activeTab !== AuthDebugger &&
                <RecipeTable className="loginButton" recipes={recipes} showOption={activeTab === MyRecipeTab}>
                </RecipeTable>
            )}
        </div>
    );
};

export { RecipesPage, RequestMyRecipes };