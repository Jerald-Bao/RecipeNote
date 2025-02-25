import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import {RecipesProvider, useRecipes} from "../components/RecipesPageContext";
import RecipeTable from "../components/RecipeTable";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import {BrowserRouter} from "react-router-dom";


/*
The mock data for testing the interface layout
*/
const recipesMock = [
    { id: 1, title: 'recipe1', ingredients: [{ name: 'ingredient 1' }], user: { name: 'user1' } },
    { id: 2, title: 'recipe2', ingredients: [{ name: 'ingredient 2' }], user: { name: 'user2' } },
    { id: 3, title: 'recipe3', ingredients: [{ name: 'ingredient 3' }], user: { name: 'user3' } },
];
const recipesData =  {recipes:recipesMock,recipes3rdParty:[]};
jest.mock("@auth0/auth0-react");

const auth0Context = {
    isAuthenticated: true,
    user: { sub: '123456' },
    getAccessTokenSilently: jest.fn(() => 'fake_token')
};


describe('RecipeTable Component', () => {
    beforeEach(() => {
        useAuth0.mockReturnValue({
            isAuthenticated: true,
            user: { sub: '123456' },
            getAccessTokenSilently: jest.fn(() => Promise.resolve('fake_token'))
        });
    });

    test('should display delete options if showOption is true', () => {
        render(
            <BrowserRouter>
                <RecipesProvider>
                    <RecipeTable recipes={recipesData} showOption={true} />
                </RecipesProvider>
            </BrowserRouter>
        );
        const deletes = screen.queryAllByText('Delete');
        expect(deletes).not.toBeNull();
    });

    test('should show the title of recipe1', () => {
        render(
            <BrowserRouter>
                <RecipesProvider>
                    <RecipeTable recipes={recipesData} showOption={false} />
                </RecipesProvider>
            </BrowserRouter>
        );
        const title = screen.queryByText('recipe1');
        expect(title).toBeInTheDocument();
    });

    test('should show ingredient of recipe1', () => {
        render(
            <BrowserRouter>
                <RecipesProvider>
                    <RecipeTable recipes={recipesData} showOption={true} />
                </RecipesProvider>
            </BrowserRouter>
        );
        const ingredient = screen.queryByText('ingredient 2');
        expect(ingredient).toBeInTheDocument();
    });
});