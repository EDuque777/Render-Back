require('dotenv').config();
const axios = require("axios");
const Sequelize = require('sequelize');
const {Recipe, Diet} = require("../db");
const {API_KEY, URL} = process.env;


const getRecipesName = async (req, res) => {

    try {
        const {name} = req.query;

        if(!name){
            return res.status(400).send(`Parametro incorrecto`)
        }

        //const {data} = await axios(`${URL}/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true`);
        //const { data } = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=48f825ac985b4674927decbde47c5a2d&addRecipeInformation=true`);
        const { data } = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=d25d273ecba24220a41a201eb4be11b6&addRecipeInformation=true`);

        const apiRecipes = data.results.filter(coincidence => coincidence.title.toLowerCase().includes(name.toLowerCase())).map(recipe => {
            const instructions = recipe.analyzedInstructions && recipe.analyzedInstructions[0] ? recipe.analyzedInstructions[0].steps.map(step => step.step) : [];
            const diets = recipe.diets || recipe.Diets.map(diet => diet.name);
            return {   
              id: recipe.id,
              name: recipe.title,
              image: recipe.image,
              summary: recipe.summary.replace(/<[^>]*>/g, ''),
              healthScore: recipe.healthScore,
              steps: instructions,
              diets
            }
        });
        
        const dbRecipes = await Recipe.findAll({
            attributes: ['id', 'name', 'image', 'summary', 'healthScore', 'steps'],
            where: {name: {[Sequelize.Op.iLike]: `%${name}%`}},
            include: {model: Diet, attributes: ['name']}
        })
        const dbRecipesAll = dbRecipes.map(recipe => {
            const diets = recipe.diets || recipe.Diets.map(diet => diet.name);
            return {
              id: recipe.id,
              name: recipe.name,
              image: recipe.image,
              summary: recipe.summary,
              healthScore: recipe.healthScore,
              steps: recipe.steps,
              diets
            }
        });
        
        const allRecipes = apiRecipes.concat(dbRecipesAll);

        if (allRecipes.length === 0) {
            return res.status(400).send(`No hay recetas con el nombre: ${name}`)
        }
        
        return res.status(200).json(allRecipes);
        
    } catch (error) {
        
        res.status(404).send(error.message)

    }

}



module.exports = {
    getRecipesName
}