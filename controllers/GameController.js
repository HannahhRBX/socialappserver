import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


// Updates games for a user
export const UpdateGames = async(req,res)=>{
    try {
        const {
            id,
            games,
        } = req.body;

        if (req.user.id == id){
        
            const user = await User.findById(id);
            
            console.log(games)
            user.Games = games;
            const updateData = await user.save();
            res.status(200).json(updateData);
        }else{
            res.status(400).json({message: "Unauthorized"})
        }
    }catch(err){
        res.status(404).json({error: err.mesage});
    }
};

// Gets game info for all users
export const GetGameInfo = async(req,res) =>{
    try {
        const user = await User.find();
        res.status(200).json(user);
    } catch(error) {
        // Handle error
        res.status(404).json({message: error.message})
    }
};

// Function to get game library by page number from the API
export const GetGamesLibrary = async(req,res) =>{
    try {
        
        const {page} = req.params;
        
        const response = await fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&page=${page}&page_size=35`, {
            method: "GET",
        });
        const data = await response.json();
        if (response.ok) {
            res.status(200).json(data);
        }else{
            res.status(404).json({message: error.message})
        }
    } catch(error) {
        res.status(404).json({message: error.message})
    }
};

// Function to search games with keywords from the API
export const SearchGames = async(req,res) =>{
    try {
        
        const {searchTerms} = req.params;
        
        const response = await fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${searchTerms}`, {
            method: "GET",
        });
        const data = await response.json();
        if (response.ok) {
            res.status(200).json(data);
        }else{
            res.status(404).json({message: error.message})
        }
    } catch(error) {
        res.status(404).json({message: error.message})
    }
};

// Function to get game details by game id from the API
export const GetGameDetails = async(req,res) =>{
    try {
        
        const {gameId} = req.params;
        
        const response = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${process.env.RAWG_API_KEY}`, {
            method: "GET",
        });
        const data = await response.json();
        if (response.ok) {
            res.status(200).json(data);
        }else{
            res.status(404).json({message: error.message})
        }
    } catch(error) {
        res.status(404).json({message: error.message})
    }
};

// Gets matching users for sending user based on similar games
export const GetMatchingUsers = async(req,res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id); // Gets origin user

        
        const userGames = user.Games; // Gets origin user's games
        const userGameIds = userGames.map(game => game[0]); // Extract game ids
        const users = await User.find();
        let matchingUsers = users.filter(user => {

            // Prevent user from matching with themselves
            if (user._id.toString() === id) {
                return false;
            }
            user.Password = null;
            // Check if the user has at least one game that's in userGameIds
            return user.Games.some(game => userGameIds.includes(game[0]));
            }).map(otherUser => {
                let Score = 0;
            
                otherUser.Games.forEach((game, index) => {
                    // Find the user game index that matches the game
                    const userGameIndex = userGames.findIndex(userGame => userGame[0] === game[0]);
                    if (userGameIndex !== -1) {
                        
                        // Find the user game that matches the game
                        const userGame = userGames[userGameIndex];

                        // Check if there is at least one matching platform
                        if (game[1].some(platform => userGame[1].includes(platform))) {
                            // Adds points based on weight for each side of the comparison
                            Score += ((5-index) + (5-userGameIndex))
                        }
                    }
                });
            
            return { ...otherUser._doc, Score };
        });
        // Sort users into highest score to lowest score
        matchingUsers.sort((a, b) => b.Score - a.Score);

        // Only take the first 5 users
        matchingUsers = matchingUsers.slice(0, 5);

        // Return back to client
        res.status(200).json(matchingUsers);
    } catch(error) {
        // Handle error
        res.status(404).json({message: error.message})
    }
};

