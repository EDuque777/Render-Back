require('dotenv').config();
const axios = require("axios");
const {Recipe, Diet}= require("../db");
const {API_KEY, URL} = process.env;


const getRecipesId = async (req, res) => {

    try {
        
        const {idRecipe} = req.params;

        if(idRecipe.toString().includes("-")){
            const searchDatabaseRecipe = await Recipe.findOne({
                where: { id: idRecipe },
                include: { model: Diet, attributes: ['name'] },
            });

            if(searchDatabaseRecipe){

                const { id, name, image, summary, healthScore, steps} = searchDatabaseRecipe;

                const associatedDiet = {
                    id: id,
                    name: name,
                    image: image,
                    summary: summary,
                    healthScore: healthScore,
                    steps: steps,
                    diets: searchDatabaseRecipe.Diets.map((diet) => diet.name)
                }
                return res.status(200).json(associatedDiet);
            }
        }



        //const {data} = await axios(`${URL}/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true`);
        //const { data } = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=48f825ac985b4674927decbde47c5a2d&addRecipeInformation=true`);
        const { data } = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=d25d273ecba24220a41a201eb4be11b6&addRecipeInformation=true`);

        const filteredRecipe = data.results.find(diet => diet.id === +idRecipe)

        if(!filteredRecipe){
            return res.status(400).send(`No hay recetas con el id: ${idRecipe}`)
        }

        const deleteTags = filteredRecipe.summary.replace(/<[^>]*>/g, '');

        const stepByStep = data.results.find(step => step.id === +idRecipe).analyzedInstructions[0].steps.map(step => step.step);

        const associatedDiet = {
            id: filteredRecipe.id,
            name: filteredRecipe.title,
            image: filteredRecipe.image,
            summary: deleteTags,
            healthScore: filteredRecipe.healthScore,
            steps: stepByStep,
            diets: filteredRecipe.diets
        }

        return res.status(200).json(associatedDiet);

    } catch (error) {
        
        res.status(404).send(error.message);

    }

}


module.exports = {
    getRecipesId
}