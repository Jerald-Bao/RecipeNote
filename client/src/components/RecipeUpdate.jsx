import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthToken } from "../AuthTokenContext";

import '../style/RecipeDetailPage.css'

export default function RecipeDetail() {
    const { accessToken } = useAuthToken();

    const [recipe, setRecipe] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const recipeId = useParams().recipeId;

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
            const resRecipe = await response.json();
            setRecipe(resRecipe);
            setTitle(resRecipe.title);
            setDescription(resRecipe.description);
        }
        getRecipeDetail();
    }, [recipeId]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };



    const handleUpdateRecipe = async (e) => {
        e.preventDefault();
        try {
            const updatedRecipe = await fetch(`${process.env.REACT_APP_API_URL}/recipe/${recipeId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ title, description }),
            });

            if (!updatedRecipe.ok) {
                throw new Error('Failed to update recipe');
            }

            if (updatedRecipe) {
                navigate('/');
                alert(`The recipe: ${title} is updated.`);
            }
        } catch (error) {
            console.log(error);
        }
    };


    if (recipe) {
        return (<div className="recipe-container">
                <form>
                    <button className='back-button' onClick={() => {
                        navigate('/')
                    }}> back
                    </button>
                    <div className="form-layout">
                        <div className='left-column'>
                            <div className="title-detail">
                                <label className="recipe-title" htmlFor="title-textarea">Title</label>
                                <textarea id="title-textarea" value={title} onChange={handleTitleChange} rows={1}>  </textarea>
                                <p className="recipe-author">By: {recipe.user.name}</p>
                            </div>
                            <div className="description-detail">
                                <label className="description-title" htmlFor="description-textarea">Instruction</label>
                                <textarea id="description-textarea" value={description} onChange={handleDescriptionChange} rows={10}>  </textarea>
                            </div>
                            <button type="submit" onClick={handleUpdateRecipe}>Update</button>
                        </div>
                        <div className="ingredients-detail">
                            <h1 className="ingredient-title">Ingredients</h1>
                            <div className="recipe-ingredients">
                                {recipe.ingredients.map((ingredient, index) => (
                                    <div key={index} className="ingredient">{ingredient.name}</div>
                                ))}
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        );
    } else {
        return (<div>Loading...</div>);
    }
}