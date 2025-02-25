import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

// this is a middleware that will validate the access token sent by the client
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});

// requireAuth middleware will validate the access token sent by the client and will return the user information within req.auth
app.get("/recipes", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        userId: user.id,
      },
      select: {
        title: true,  // Only fetch the 'name' field
        id: true,
        description: true,
        user: {
          select: {
            name: true
          }
        },
        ingredients: {
          select: {
            name: true
          }
        }
      }
    });
    res.json(recipes);
  } catch (e) {
    // if the query fails...
    res.send(500);
    console.error(e);
  }
});

app.get("/recipes/search/:search", async (req, res) => {
  const searchTerm = req.params.search;
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [{
          title: {
            contains: searchTerm,
          }},
          {
          ingredients: {
            some: {
              name: {
                contains: searchTerm,
              }
            }
          }
        }]
      },
      select: {
        title: true,  // Only fetch the 'name' field
        id: true,
        user: {
          select: {
            name: true
          }
        },
        ingredients: {
          select: {
            name: true
          }
        }
      }
    });

    res.json(recipes);
  } catch (e) {
    // if the query fails...
    res.send(500);
    console.error(e);
  }
});

app.get("/recipes/search/", async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      select: {
        title: true,  // Only fetch the 'name' field
        id: true,
        user: {
          select: {
            name: true
          }
        },
        ingredients: {
          select: {
            name: true
          }
        }
      }
    });
    res.json(recipes);
  } catch (e) {
    // if the query fails...
    res.send(500);
    console.error(e);
  }
});


// requireAuth middleware will validate the access token sent by the client and will return the user information within req.auth
app.post("/ingredient", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  try {
    const { name } = req.body;
    const existed_ingredient = await prisma.ingredient.findUnique({
      where: {
        name: name,
      },
    });
    if (existed_ingredient) return res.json(name);

    const ingredient = await prisma.ingredient.create({
      data: {
        name
      }
    });
    res.json(ingredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// requireAuth middleware will validate the access token sent by the client and will return the user information within req.auth
app.post("/recipe", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  try {
    const { title, description, ingredients } = req.body;
    const recipe = await prisma.recipe.create({
      data: {
        title: title,
        description: description,
        userId: user.id,
        ingredients: {
          connectOrCreate: ingredients.map(name => ({
            where: { name },
            create: { name }
          }))
        }
      }
    });
    res.json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// Get recipe details by ID
app.get("/recipe/:id", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const recipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
      select: {
        title: true,
        id: true,
        description: true,
        userId: true,
        user: {
          select: {
            name: true
          }
        },
        ingredients: {
          select: {
            name: true
          }
        }
      }
    });

    if (recipe){
      res.json(recipe);
    } else {
      res.send(404);
    }
  } catch (e) {
    res.send(500);
    console.error(e);
  }
});

// Delete a recipe
app.delete("/recipe/:id", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const recipeId = parseInt(req.params.id);

    const recipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
      select: {
        user: {
          select: {
            auth0Id: true
          }
        }
      }
    });

    if (auth0Id === recipe.user.auth0Id) {
      await prisma.recipe.delete({
        where: {
          id: recipeId,
        },
      })
      res.send(200);
    } else {
      // otherwise send 401
      res.send(401);
    }
  } catch (e) {
    // if the query fails...
    res.send(500);
    console.error(e);
  }
});

// Get current user details
app.get("/user", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });

    if (user){
      res.json(user);
    } else {
      res.send(404);
    }
  } catch (e) {
    res.send(500);
    console.error(e);
  }
});

// Update recipe route
app.put('/recipe/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Update recipe
    const updatedRecipe = await prisma.recipe.update({
      where: { id: parseInt(id) },
      data: { title, description }
    });

    res.json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// this endpoint is used by the client to verify the user status and to make sure the user is registered in our database once they signup with Auth0
// if not registered in our database we will create it.
// if the user is already registered we will return the user information
app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];

  // console.log(req.auth.payload)

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user) {
    res.json(user);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        auth0Id,
        name,
      },
    });

    res.json(newUser);
  }
});

const PORT = parseInt(process.env.PORT) || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} `);
});
