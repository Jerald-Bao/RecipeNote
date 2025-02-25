import React, { useState } from 'react';
import '../style/RecipesPublishPage.css'
import { useAuthToken } from "../AuthTokenContext";

export default function RecipePublishPage() {
    const { accessToken } = useAuthToken();

    const [currentIngredient, setCurrentIngredient] = useState('');
    const isIngredientEmpty = currentIngredient.trim() === '';

    const [ingredients, setIngredients] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    async function addIngredient(ingredientName) {
        const data = await fetch(`${process.env.REACT_APP_API_URL}/ingredient`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                name: ingredientName,
            }),
        });
        if (data.ok) {
            const ingredient = await data.json();
            return ingredient;
        } else {
            return null;
        }
    }

    async function addRecipe(title, description, ingredients) {
        const data = await fetch(`${process.env.REACT_APP_API_URL}/recipe`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                title: title,
                description: description,
                ingredients: ingredients,
            }),
        });
        if (data.ok) {
            const recipe = await data.json();
            setCurrentIngredient("");
            setIngredients([]);
            setDescription("");
            setTitle("");
            return recipe;
        } else {
            return null;
        }
    }

    const handleAddIngredient = async (e) => {
        e.preventDefault();
        if (isIngredientEmpty) return;
        if (ingredients.includes(currentIngredient)) {
            setCurrentIngredient('');
            return;
        }
        const newIngredient = await addIngredient(currentIngredient.toLowerCase());
        if (newIngredient) {
            setIngredients([...ingredients, currentIngredient.toLowerCase()]);
            setCurrentIngredient('');
        }
    };

    const handlePublishRecipe = async (e) => {
        e.preventDefault();
        const newRecipe = await addRecipe(title, description, ingredients);
        if (newRecipe) {
            alert(`New recipe: ${newRecipe.title} is published.`);
        }
    };

    const handleDeleteIngredient = (e) => {
        const ingredient = e.target.value;
        e.preventDefault();
        setIngredients(ingredients.filter(item => item !== ingredient));
    }

    return (<div>
        <form>
            <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input type="text" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="ingredients">Ingredients:</label>
                <textarea id="ingredients" name="ingredients" rows="1" value={currentIngredient} onChange={(e) => setCurrentIngredient(e.target.value)}></textarea>
                <button type="button" className='add-button' disabled={isIngredientEmpty} onClick={handleAddIngredient}>Add Ingredient</button>
            </div>
            <ul className="ingredient-list">
                {ingredients.map((ingredient) => {
                    return (
                        <li key={ingredient} className="ingredient-item">
                            <span className="ingredient-name">{ingredient}</span>
                            <button value={ingredient} onClick={handleDeleteIngredient}>
                                X
                            </button>
                        </li>
                    );
                })}
            </ul>
            <div className="form-group">
                <label htmlFor="content">Content:</label>
                <textarea id="content" name="content" rows="8" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
            </div>
            <div className="publish-form">
            <button type="submit" className='publish-button' onClick={handlePublishRecipe}>Publish Recipe</button>
            </div>
        </form>
    </div>);
}

export { RecipePublishPage };