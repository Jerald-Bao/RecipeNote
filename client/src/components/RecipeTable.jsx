import React, { useState } from 'react';
import '../style/RecipesPage.css'
import { Link } from "react-router-dom";
import { RequestMyRecipes } from "./RecipeSearchTab";
import { useRecipes } from "./RecipesPageContext";
import { useAuth0 } from "@auth0/auth0-react";


function RecipeTable({ recipes, showOption }) {
  const { setRecipes } = useRecipes();
  const { getAccessTokenSilently } = useAuth0();
  const deleteRecipe = (id) => {
    // The search function
    const performDelete = async () => {
      const token = await getAccessTokenSilently();
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/recipe/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          console.error(response);
          throw new Error('Deletion failed');
        }
        const result = await response.json();
      } catch (e) {
        console.log(`Error when executing fetching my recipes: ${e}`);
      }
      const result = await RequestMyRecipes(token);
      setRecipes({ recipes: result, recipes3rdParty: [] });
    }
    performDelete();
  }

  const renderText = (recipe) => {
    let ingredientText = '';
    for (let i = 0; i <= 20; i++) {
      let data = recipe[`strIngredient${i}`];
      // console.log(data)
      if (data && data.trim() !== '') {
        ingredientText += data + ', ';
      }
    }
    return ingredientText;
  }
  return (
    <div>
      <table className='recipeTable'>
        <thead>
          <tr>
            <th>Recipe</th>
            <th>Ingredient</th>
            <th>Author</th>
            {showOption &&
              <th>Options</th>}
          </tr>
        </thead>
        <tbody>
          {recipes.recipes?.map((recipe, id) => (
            <tr key={id}>
              <td className='title'>
                <Link to={`/recipe/${recipe.id}`}>{recipe.title}</Link>
              </td>
              <td className='ingredients'>{recipe.ingredients.map(i => i.name).join(', ')}</td>
              <td className='creator'>{recipe.user.name}</td>
              {showOption &&
                <td>
                  <a href="" onClick={(event) => {
                    event.preventDefault();
                    const isConfirmed = window.confirm("Are you sure you want to delete this recipe?");
                    if (isConfirmed) {
                      deleteRecipe(recipe.id);
                    }
                  }} style={{ color: 'red', marginRight: '30px' }}>
                    Delete
                  </a>
                  <a href={`/recipeUpdate/${recipe.id}`}
                    onClick={(event) => {
                      console.log(recipe);
                    }}
                    style={{ color: 'blue' }}>
                    Update
                  </a>
                </td>}
            </tr>
          ))}
          {recipes.recipes3rdParty?.map((recipe, id) => (
            <tr key={recipe.idMeal}>
              <td className='title'>
                <Link to={`/recipe3rdParty/${recipe.idMeal}`}>{recipe.strMeal}</Link>
              </td>
              <td className='ingredients'>{renderText(recipe)
              }</td>
              <td className='creator'>{'3rd Party'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecipeTable;