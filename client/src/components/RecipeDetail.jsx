import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import '../style/RecipeDetailPage.css'

export default function RecipeDetail() {

    const [recipe, setRecipe] = useState(null);
    const recipeId = useParams().recipeId;
    const recipe3rdId = useParams().recipe3rdId;

    const navigate = useNavigate();

    useEffect(() => {
        async function getRecipeDetail() {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/recipe/${recipeId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return;
                } else {
                    throw new Error('Failed to fetch recipe');
                }
            }
            const recipe = await response.json();
            setRecipe(recipe);
        }

        async function get3rdRecipeDetail() {
            const thirdPartyResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe3rdId}`);
            if (!thirdPartyResponse.ok) {
                console.error(thirdPartyResponse);
                throw new Error('Data fetching failed');
            }
            const thirdPartyRecipeList = await thirdPartyResponse.json();
            const thirdPartyRecipeRaw = thirdPartyRecipeList.meals[0];

            const ingredients = [];
            for (let i=0;i<=20;i++) {
                let data = thirdPartyRecipeRaw[`strIngredient${i}`];
                if (data && data.trim() !== '') {
                    ingredients.push({name: data});
                }
            }
            const thirdPartyRecipe = {
                title: thirdPartyRecipeRaw.strMeal,
                user: {name : "Third Party"},
                ingredients: ingredients,
                description: thirdPartyRecipeRaw.strInstructions
            }
            setRecipe(thirdPartyRecipe);
        }

        if (recipeId) {        
            getRecipeDetail();
        } else {
            get3rdRecipeDetail();
        }

    }, [recipeId, recipe3rdId]);


    if (recipe) {
        return (<div className="recipe-container">
            <div className='form-layout'>
                <div className='left-column'>
                    <button className='back-button' onClick={() => {
                        navigate('/')
                    }}> back
                    </button>
                    <div className='title-detail'>
                        <h1 className="recipe-title"> {recipe.title} </h1>
                        <p className="recipe-author">By: {recipe.user.name}</p>
                    </div>
                    <h1 className="description-title">Instruction</h1>
                    <p className="recipe-description">{recipe.description}</p>
                </div>
                <div className='ingredients-detail'>
                    <h1 className="ingredient-title">Ingredients</h1>
                    <div className="recipe-ingredients">
                        {recipe.ingredients.map((ingredient, index) => (
                            <div key={index} className="ingredient">{ingredient.name}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>);
    } else {
        return (<div>Loading...</div>);
    }
}